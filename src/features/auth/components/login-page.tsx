import { useLoginPage } from "../hooks/use-login-page";
import { LoginForm } from "./login-form";

export function LoginPage() {
  return <LoginForm {...useLoginPage()} />;
}
