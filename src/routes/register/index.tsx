import { safeReturn } from "@/features/auth/api/queries";
import { RegisterPage } from "@/features/auth/components/register-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/register/")({
  validateSearch: (s: Record<string, unknown>) => ({
    returnTo: safeReturn(s.returnTo),
  }),
  component: RegisterPage,
});
