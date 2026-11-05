import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Hide } from "react-iconly";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/register/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <main className="flex flex-col w-full min-h-dvh items-center justify-center gap-10 pt-20 pb-6 px-7">
      <h1 className="text-center text-[32px] font-bold">KURIO</h1>

      <p className="mt-12 text-center text-xl font-bold">
        Criar perfil de colecionador
      </p>

      <form className="mt-6 flex flex-1 flex-col w-full">
        <FieldGroup className="gap-2">
          <Field>
            <Input type="text" placeholder="Nome de usuário ..." />
          </Field>
          <Field>
            <Input type="email" placeholder="Digite seu e-mail ..." />
          </Field>

          <Field>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha ..."
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-border-soft hover:text-primary transition-colors duration-300"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                <Hide />
              </button>
            </div>
          </Field>
          <Field>
            <div className="relative">
              <Input
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

        <Button className="mt-10" type="submit">
          Criar perfil
        </Button>

        <div className="my-10 flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-[13px]">Ou continue com</span>
          <Separator className="flex-1" />
        </div>

        <div className="flex flex-col gap-2">
          <Button
            className="border-border text-secondary font-medium"
            variant="outline"
          >
            <span className="text-sm font-bold text-[#4285f4]">G</span>
            Continuar com Google
          </Button>

          <Button
            className="border-border text-secondary font-medium"
            variant="outline"
          >
            <span className="text-sm font-bold text-[#4267B2]">f</span>
            Continuar com Facebook
          </Button>
        </div>

        <div className="mt-10 text-center text-[15px] text-secondary">
          Já tem uma conta?{" "}
          <Link
            to="/register"
            className="hover:text-[#e09a59] transition-colors duration-300"
          >
            Entre
          </Link>
        </div>
      </form>
    </main>
  );
}
