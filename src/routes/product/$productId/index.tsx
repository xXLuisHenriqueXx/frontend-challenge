import { NftPage } from "@/features/nft/components/nft-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/product/$productId/")({
  component: NftPage,
});
