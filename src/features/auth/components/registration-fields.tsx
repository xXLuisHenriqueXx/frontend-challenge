import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Hide } from "react-iconly";
import type { RegisterPageModel } from "../types/register-page-model";

export function RegistrationFields({
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}: Pick<
  RegisterPageModel,
  | "showPassword"
  | "setShowPassword"
  | "showConfirmPassword"
  | "setShowConfirmPassword"
>) {
  return (
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
            aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            <Hide />
          </button>
        </div>
      </Field>
    </FieldGroup>
  );
}
