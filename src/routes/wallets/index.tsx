import { requireSession } from "@/features/auth/api/queries";
import { WalletsPage } from "@/features/wallets/components/wallets-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/wallets/")({
  beforeLoad: ({ location }) => requireSession(location),
  component: WalletsPage,
});
