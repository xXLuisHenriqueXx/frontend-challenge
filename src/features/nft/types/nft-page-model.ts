import type { useNftPage } from "../hooks/use-nft-page";

export type NftPageModel = ReturnType<typeof useNftPage> & {
  nft: NonNullable<ReturnType<typeof useNftPage>["nft"]>;
  relatedNfts: { name: string; price: string; image: string }[];
  total: string;
  add: () => void;
};
