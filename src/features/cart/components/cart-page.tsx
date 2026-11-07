import { useCartPage } from "../hooks/use-cart-page";
import { CartPageView } from "./cart-page-view";

export function CartPage() {
  return <CartPageView {...useCartPage()} />;
}
