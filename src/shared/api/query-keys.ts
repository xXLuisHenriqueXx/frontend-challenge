import type { CatalogSearch } from "@/features/catalog/types/contracts";

export const queryKeys = {
  session: ["session"] as const,
  catalogs: ["nfts"] as const,
  catalog: (search: CatalogSearch) => ["nfts", search] as const,
  nfts: ["nft"] as const,
  nft: (id: string) => ["nft", id] as const,
  private: ["private"] as const,
  user: (id: string) => ["private", id] as const,
  cart: (id: string) => ["private", id, "cart"] as const,
  quote: (id: string) => ["private", id, "quote"] as const,
  favorites: (id: string) => ["private", id, "favorites"] as const,
  wallets: (id: string) => ["private", id, "wallets"] as const,
  profile: (id: string) => ["private", id, "profile"] as const,
  order: (id: string, orderId: string) =>
    ["private", id, "order", orderId] as const,
};
