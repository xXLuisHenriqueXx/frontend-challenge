import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { Header } from "@/shared/components/site-header";
import { Link } from "@tanstack/react-router";
import {
  Download,
  Heart,
  LifeBuoy,
  LogOut,
  MapPin,
  ShoppingCart,
  Tag,
  User,
} from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

export function AccountLayout({ children }: { children: ReactNode }) {
  const logout = useLogout("login");
  return (
    <>
      <Header />
      <main className="account-layout mx-auto max-w-300 px-6 py-8 lg:grid lg:grid-cols-[310px_1fr] lg:gap-7">
        <nav
          aria-label="Meu perfil"
          className="mb-8 flex flex-wrap gap-5 bg-surface-card p-5 lg:mb-0 lg:h-fit lg:flex-col"
        >
          <p className="w-full font-bold">Meu perfil</p>
          <Link
            to="/profile"
            activeProps={{ className: "text-font-accent underline" }}
          >
            <User aria-hidden="true" /> Dados do perfil
          </Link>
          <Link
            to="/wallets"
            activeProps={{ className: "text-font-accent underline" }}
          >
            <MapPin aria-hidden="true" /> Carteiras
          </Link>
          {[
            { label: "Atividade", Icon: ShoppingCart },
            { label: "Lista de interesse", Icon: Heart },
            { label: "Ofertas", Icon: Tag },
            { label: "Arquivos baixados", Icon: Download },
            { label: "Suporte", Icon: LifeBuoy },
          ].map(({ label, Icon }) => (
            <span key={label} aria-disabled="true" title="Fora do escopo">
              <Icon aria-hidden="true" />
              {label}
            </span>
          ))}
          <Link to="/cart">
            <ShoppingCart aria-hidden="true" />
            Carrinho
          </Link>
          <button
            className="text-left text-font-accent"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
          >
            <LogOut aria-hidden="true" /> Sair
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
export { errorsFor } from "@/shared/lib/errors";
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
