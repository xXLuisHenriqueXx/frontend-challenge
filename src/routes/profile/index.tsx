import { requireSession } from "@/features/auth/api/queries";
import { ProfilePage } from "@/features/profile/components/profile-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/")({
  beforeLoad: ({ location }) => requireSession(location),
  component: ProfilePage,
});
