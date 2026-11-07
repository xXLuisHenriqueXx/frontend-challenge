import Facebook from "@/assets/icons/facebook.svg";
import Google from "@/assets/icons/google.svg";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AuthHeading } from "@/features/auth/components/auth-heading";
import { AccessibleForm } from "@/shared/components/accessible-form";
import { Link } from "@tanstack/react-router";
import type { useRegisterPage } from "../hooks/use-register-page";
import { RegistrationFields } from "./registration-fields";

export function RegisterPageView({
  returnTo,
  mutation,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}: ReturnType<typeof useRegisterPage>) {
  return (
    <div className="auth-shell">
      <main className="auth-page auth-register flex flex-col w-full min-h-dvh items-center justify-center gap-10 pt-20 pb-6 px-7">
        <p className="text-center text-[32px] font-bold" aria-hidden="true">
          KURIO
        </p>

        <AuthHeading mode="register" returnTo={returnTo} />

        <AccessibleForm
          error={mutation.error}
          className="mt-6 flex flex-1 flex-col w-full"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(e.currentTarget);
          }}
        >
          <RegistrationFields
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
          />

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
    </div>
  );
}
