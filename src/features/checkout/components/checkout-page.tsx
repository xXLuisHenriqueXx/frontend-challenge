import { useCheckoutPage } from "../hooks/use-checkout-page";
import { CheckoutPageView } from "./checkout-page-view";

export function CheckoutPage() {
  return <CheckoutPageView {...useCheckoutPage()} />;
}
