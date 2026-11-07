import type { Order, OrderInput } from "@/features/orders/types/contracts";
import { get, send } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";
import { queryOptions } from "@tanstack/react-query";

export const orderOptions = (id: string, orderId: string) =>
  queryOptions({
    queryKey: queryKeys.order(id, orderId),
    queryFn: ({ signal }) => get<Order>(`/orders/${orderId}`, signal),
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 1000 : false,
  });

export const createOrder = (input: OrderInput, key: string) =>
  send<Order>("/orders", input, "POST", { "Idempotency-Key": key });
