import { useId } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import type { ReactNode, InputHTMLAttributes } from "react";
import { isAxiosError } from "axios";
import { Header } from "@/routes/-components/Header";
import { clearPrivate, queryClient, send } from "@/api/client";
import { Button } from "./ui/button";
import type { ApiError } from "@/api/contracts";

export function AccountLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const logout = useMutation({
    mutationFn: async () => {
      await send("/auth/logout");
      await clearPrivate();
      await navigate({ to: "/login", search: { returnTo: "/profile" } });
      await queryClient.invalidateQueries();
    },
  });
  return (
    <>
      <Header />
      <main className="mx-auto max-w-300 px-6 py-8 lg:grid lg:grid-cols-[310px_1fr] lg:gap-7">
        <nav
          aria-label="Meu perfil"
          className="mb-8 flex flex-wrap gap-5 bg-surface-card p-5 lg:mb-0 lg:h-fit lg:flex-col"
        >
          <p className="w-full font-bold">Meu perfil</p>
          <Link
            to="/profile"
            activeProps={{ className: "text-font-accent underline" }}
          >
            Dados do perfil
          </Link>
          <Link
            to="/wallets"
            activeProps={{ className: "text-font-accent underline" }}
          >
            Carteiras
          </Link>
          <Link to="/cart">Carrinho</Link>
          <button
            className="text-left text-font-accent"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
          >
            Sair
          </button>
        </nav>
        <section className="min-w-0">{children}</section>
      </main>
    </>
  );
}
export function AccountField({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const uniqueId = useId();
  const id = props.id ?? `${uniqueId}-${props.name}`;
  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={id} className="text-sm">
        {label}
        {props.required && (
          <span aria-hidden="true" className="text-font-coral">
            {" "}
            *
          </span>
        )}
      </label>
      <input
        {...props}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-11 w-full min-w-0 rounded-sm border border-border bg-transparent px-3 outline-none focus-visible:border-primary"
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
export const errorsFor = (error: unknown) =>
  isAxiosError<ApiError>(error) ? (error.response?.data.fields ?? {}) : {};
export function Feedback({
  mutation,
}: {
  mutation: { isError: boolean; error: unknown; isSuccess: boolean };
}) {
  return mutation.isSuccess ? (
    <p role="status" className="my-4 text-font-accent">
      Alterações salvas.
    </p>
  ) : null;
}
export function SaveButton({
  pending,
  children = "Salvar",
}: {
  pending: boolean;
  children?: ReactNode;
}) {
  return (
    <Button
      type="submit"
      disabled={pending}
      className="mt-7 h-11 w-fit rounded-sm"
    >
      {children}
    </Button>
  );
}
