import { safeReturn } from "@/features/auth/api/queries";
import { LoginPage } from "@/features/auth/components/login-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login/")({
  validateSearch: (s: Record<string, unknown>) => ({
    returnTo: safeReturn(s.returnTo),
  }),
  component: LoginPage,
});
