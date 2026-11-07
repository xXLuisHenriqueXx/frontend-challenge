import { useIdentity } from "@/features/auth/hooks/use-identity";
import { useOrder } from "@/features/orders/hooks/use-order";
import { getRouteApi, useRouter } from "@tanstack/react-router";

const Route = getRouteApi("/payment/confirm/");

export function useOrderPage() {
  const { orderId } = Route.useSearch();
  const { id } = useIdentity();
  const query = useOrder(id, orderId);
  const router = useRouter();
  return { orderId, id, query, router };
}
