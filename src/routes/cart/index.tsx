import { CartPage } from "@/features/cart/components/cart-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cart/")({
  component: CartPage,
});
