import { useQuery } from "@tanstack/react-query";
import { catalogOptions } from "../api/queries";
import type { CatalogSearch } from "../types/contracts";

export function useNfts(search: CatalogSearch) {
  return useQuery(catalogOptions(search));
}
