import { useNftPage } from "../hooks/use-nft-page";
import { NftPageView } from "./nft-page-view";

export function NftPage() {
  return <NftPageView {...useNftPage()} />;
}
