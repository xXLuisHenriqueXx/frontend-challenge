import type { Nft } from "@/features/nft/types/contracts";

export interface CatalogSearch {
  q: string;
  collection: string;
  network: string;
  category: string;
  sort: "recent" | "price-asc" | "price-desc";
  page: number;
  min: string;
  max: string;
}

export interface Catalog {
  items: Nft[];
  total: number;
  pages: number;
}
