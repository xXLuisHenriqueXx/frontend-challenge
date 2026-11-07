import { requireSession } from "@/features/auth/api/queries";
import { OrderPage } from "@/features/orders/components/order-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/payment/confirm/")({
  beforeLoad: ({ location }) => requireSession(location),
  validateSearch: (s: Record<string, unknown>) => ({
    orderId: String(s.orderId ?? ""),
  }),
  component: OrderPage,
});
