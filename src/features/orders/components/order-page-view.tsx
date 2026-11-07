import { artworkForToken } from "@/assets/artwork";
import { RemoteState } from "@/shared/components/remote-state";
import { multiply } from "@/shared/lib/money";
import type { useOrderPage } from "../hooks/use-order-page";
import { receiptState } from "../lib/receipt-state";

import { OrderReceipt } from "./order-receipt";

export function OrderPageView({
  query,
  router,
}: ReturnType<typeof useOrderPage>) {
  if (!query.data)
    return (
      <main className="mx-auto max-w-300 p-8">
        <h1>Seu pedido</h1>
        <RemoteState query={query} />
      </main>
    );
  const order = query.data;
  const { status, config } = receiptState(order);
  const transaction = {
    id: order.transactionId,
    date: new Date(order.createdAt).toLocaleString(),
    wallet: order.wallet.name,
    networkFee: order.quote.fee,
    explorerUrl: "#",
  };
  const items = order.quote.items.map((i) => ({
    ...i,
    image: artworkForToken(i.nftId),
    subtotal: multiply(i.price, i.quantity),
  }));
  const total = order.quote.total;

  const isPending = status === "pending";
  const isFailed = status === "failed";
  return (
    <main className="receipt-page flex min-h-dvh items-center justify-center bg-ink p-4">
      <OrderReceipt
        isFailed={isFailed}
        status={status}
        isPending={isPending}
        config={config}
        transaction={transaction}
        items={items}
        order={order}
        total={total}
        router={router}
      />
    </main>
  );
}
