import type { CartLine, Quote } from "@/features/cart/types/contracts";
import { get, send } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";
import { queryOptions } from "@tanstack/react-query";

export const cartOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.cart(id),
    queryFn: ({ signal }) =>
      get<{ items: CartLine[]; coupon: string }>("/cart", signal),
  });

export const quoteOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.quote(id),
    queryFn: ({ signal }) =>
      send<Quote>("/quote", undefined, "POST", undefined, signal),
    staleTime: 0,
  });
