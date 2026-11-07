import type { Wallet } from "@/features/wallets/types/contracts";
import { get } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";
import { queryOptions } from "@tanstack/react-query";

export const walletOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.wallets(id),
    queryFn: ({ signal }) => get<Wallet[]>("/wallets", signal),
  });
