import { useOrderPage } from "../hooks/use-order-page";
import { OrderPageView } from "./order-page-view";

export function OrderPage() {
  return <OrderPageView {...useOrderPage()} />;
}
