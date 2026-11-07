import { Link } from "@tanstack/react-router";

export function AuthHeading({
  mode,
  returnTo,
}: {
  mode: "login" | "register";
  returnTo: string;
}) {
  return (
    <>
      <div className="auth-heading">
        {mode === "register" && (
          <Link className="hidden lg:block" to="/login" search={{ returnTo }}>
            Entrar
          </Link>
        )}
        <h1>
          <span className="lg:hidden">
            {mode === "login" ? "Entrar" : "Criar perfil de colecionador"}
          </span>
          <span className="hidden lg:inline">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </span>
        </h1>
        {mode === "login" && (
          <Link
            className="hidden lg:block"
            to="/register"
            search={{ returnTo }}
          >
            Criar conta
          </Link>
        )}
      </div>
      <p className="auth-intro hidden lg:block">
        {mode === "login"
          ? "Entre para gerenciar sua carteira, coleção e perfil de criador."
          : "Crie seu perfil de colecionador e conecte uma carteira quando quiser."}
      </p>
    </>
  );
}
