import { useWalletsPage } from "../hooks/use-wallets-page";
import { WalletsPageView } from "./wallets-page-view";

export function WalletsPage() {
  return <WalletsPageView {...useWalletsPage()} />;
}
