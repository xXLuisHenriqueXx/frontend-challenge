import { useRegisterPage } from "../hooks/use-register-page";
import { RegisterPageView } from "./register-page-view";

export function RegisterPage() {
  return <RegisterPageView {...useRegisterPage()} />;
}
