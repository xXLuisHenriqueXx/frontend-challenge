import type { CartLine } from "@/features/cart/types/contracts";
import type { Order } from "@/features/orders/types/contracts";
import type { PaymentStatus, statusConfig } from "../lib/receipt-state";

import type { useOrderPage } from "../hooks/use-order-page";

export type OrderPageModel = ReturnType<typeof useOrderPage> & {
  order: Order;
  status: PaymentStatus;
  transaction: {
    id: string;
    date: string;
    wallet: string;
    networkFee: string;
    explorerUrl: string;
  };
  items: (CartLine & { image: string; subtotal: string })[];
  total: string;
  config: (typeof statusConfig)[PaymentStatus];
  isPending: boolean;
  isFailed: boolean;
};
