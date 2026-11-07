import { requireSession } from "@/features/auth/api/queries";
import { CheckoutPage } from "@/features/checkout/components/checkout-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/payment/")({
  beforeLoad: ({ location }) => requireSession(location),
  component: CheckoutPage,
});
