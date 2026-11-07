import { useQuery } from "@tanstack/react-query";
import { orderOptions } from "../api/queries";

export function useOrder(userId: string, orderId: string) {
  return useQuery(orderOptions(userId, orderId));
}
