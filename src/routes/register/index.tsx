import { AccessibleForm } from "@/components/AccessibleForm";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, createFileRoute, Link } from "@tanstack/react-router";
import { clearPrivate, queryClient, safeReturn, send } from "@/api/client";

import { useState } from "react";
import { Hide } from "react-iconly";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";

import Google from "@/assets/icons/google.svg";
import Facebook from "@/assets/icons/facebook.svg";

export const Route = createFileRoute("/register/")({
  validateSearch: (s: Record<string, unknown>) => ({
    returnTo: safeReturn(s.returnTo),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { returnTo } = Route.useSearch();
  const mutation = useMutation({
    mutationFn: async (form: HTMLFormElement) => {
      const data = Object.fromEntries(new FormData(form));
      if (data.password !== data.confirmPassword)
        throw new Error("As senhas devem coincidir");
      await send("/auth/register", data);
      await clearPrivate();
      await send("/auth/login", data);
      await queryClient.invalidateQueries();
      await navigate({ to: returnTo });
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <main className="flex flex-col w-full min-h-dvh items-center justify-center gap-10 pt-20 pb-6 px-7">
      <p className="text-center text-[32px] font-bold" aria-hidden="true">
        KURIO
      </p>

      <h1 className="mt-12 text-center text-xl font-bold">
        Criar perfil de colecionador
      </h1>

      <AccessibleForm
        error={mutation.error}
        className="mt-6 flex flex-1 flex-col w-full"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(e.currentTarget);
        }}
      >
        <FieldGroup className="gap-2">
          <label htmlFor="auth-email" className="sr-only">
            E-mail
          </label>
          <label htmlFor="auth-password" className="sr-only">
            Senha
          </label>
          <label htmlFor="auth-username" className="sr-only">
            Nome de usuário
          </label>
          <label htmlFor="auth-confirmPassword" className="sr-only">
            Confirmar senha
          </label>
          <Field>
            <Input
              id="auth-username"
              name="username"
              autoComplete="username"
              aria-label="Nome de usuário"
              minLength={3}
              required
              type="text"
              placeholder="Nome de usuário ..."
            />
          </Field>
          <Field>
            <Input
              id="auth-email"
              name="email"
              autoComplete="email"
              aria-label="E-mail"
              required
              type="email"
              placeholder="Digite seu e-mail ..."
            />
          </Field>

          <Field>
            <div className="relative">
              <Input
                id="auth-password"
                name="password"
                autoComplete="current-password"
                aria-label="Senha"
                required
                minLength={8}
                type={showPassword ? "text" : "password"}
                placeholder="Senha ..."
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors duration-300"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                <Hide />
              </button>
            </div>
          </Field>
          <Field>
            <div className="relative">
              <Input
                id="auth-confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                aria-label="Confirmar senha"
                required
                minLength={8}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar Senha ..."
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-border-soft hover:text-primary transition-colors duration-300"
                aria-label={
                  showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                }
              >
                <Hide />
              </button>
            </div>
          </Field>
        </FieldGroup>

        <Button className="mt-10" type="submit" disabled={mutation.isPending}>
          Criar perfil
        </Button>

        <div className="my-10 flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-[13px]">Ou continue com</span>
          <Separator className="flex-1" />
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            disabled
            className="bg-transparent text-secondary font-medium"
            variant="outline"
          >
            <img className="size-5" src={Google} alt="" />
            Continuar com Google
          </Button>

          <Button
            type="button"
            disabled
            className="bg-transparent text-secondary font-medium"
            variant="outline"
          >
            <img className="size-5" src={Facebook} alt="" />
            Continuar com Facebook
          </Button>
        </div>

        <div className="mt-10 text-center text-[15px] text-secondary">
          Já tem uma conta?{" "}
          <Link
            to="/login"
            search={{ returnTo }}
            className="hover:text-[#e09a59] transition-colors duration-300"
          >
            Entre
          </Link>
        </div>
      </AccessibleForm>
    </main>
  );
}
