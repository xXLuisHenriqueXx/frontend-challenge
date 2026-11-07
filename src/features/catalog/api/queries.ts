import type {
  Catalog,
  CatalogSearch,
} from "@/features/catalog/types/contracts";
import { get } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";
import { queryOptions } from "@tanstack/react-query";

export const catalogOptions = (search: CatalogSearch) =>
  queryOptions({
    queryKey: queryKeys.catalog(search),
    queryFn: ({ signal }) => get<Catalog>("/nfts", signal, search),
  });
