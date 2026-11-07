import type { Nft } from "@/features/nft/types/contracts";
import { get } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";
import { queryOptions } from "@tanstack/react-query";

export const nftOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.nft(id),
    queryFn: ({ signal }) => get<Nft>(`/nfts/${id}`, signal),
  });
