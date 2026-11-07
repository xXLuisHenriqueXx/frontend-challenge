import Facebook from "@/assets/icons/facebook.svg";
import Google from "@/assets/icons/google.svg";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AuthHeading } from "@/features/auth/components/auth-heading";
import { AccessibleForm } from "@/shared/components/accessible-form";
import { Link } from "@tanstack/react-router";
import { Hide } from "react-iconly";
import type { LoginPageModel } from "../types/login-page-model";

export function LoginForm({
  returnTo,
  mutation,
  showPassword,
  setShowPassword,
}: Pick<
  LoginPageModel,
  "returnTo" | "mutation" | "showPassword" | "setShowPassword"
>) {
  return (
    <div className="auth-shell">
      <main className="auth-page flex flex-col w-full min-h-dvh items-center justify-center gap-10 pt-20 pb-6 px-7">
        <p className="text-center text-[32px] font-bold" aria-hidden="true">
          KURIO
        </p>

        <AuthHeading mode="login" returnTo={returnTo} />

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
            <Field>
              <Input
                id="auth-email"
                name="email"
                autoComplete="email"
                aria-label="E-mail"
                required
                type="email"
                placeholder="contato@email.com"
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
                  placeholder="Senha"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a78358] hover:text-[#d28b49]"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  <Hide />
                </button>
              </div>
            </Field>
          </FieldGroup>

          <Button
            type="button"
            disabled
            title="Recuperação de senha fora do escopo da demonstração"
            className="mt-3 self-end text-sm font-normal"
            variant="link"
            size="link"
          >
            Esqueceu a senha?
          </Button>

          <Button className="mt-10" type="submit" disabled={mutation.isPending}>
            Entrar
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
            Novo na Kurio?{" "}
            <Link
              to="/register"
              search={{ returnTo }}
              className="hover:text-[#e09a59] transition-colors duration-300"
            >
              Crie uma conta
            </Link>
          </div>
        </AccessibleForm>
      </main>
    </div>
  );
}
