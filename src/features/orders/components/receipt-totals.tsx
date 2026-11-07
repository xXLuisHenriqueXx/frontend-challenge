import { EthPrice } from "@/shared/components/eth-price";
import { cn } from "cn";
import type { OrderPageModel } from "../types/order-page-model";

export function ReceiptTotals({
  order,
  isPending,
  isFailed,
  transaction,
  config,
  total,
}: Pick<
  OrderPageModel,
  "order" | "isPending" | "isFailed" | "transaction" | "config" | "total"
>) {
  return (
    <>
      <div className="ml-auto mt-2 w-full space-y-1 text-sm sm:w-[70%]">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>
            <EthPrice value={order.quote.subtotal} />
          </span>
        </div>
        <div className="flex justify-between">
          <span>Desconto</span>
          <span>
            − <EthPrice value={order.quote.discount} />
          </span>
        </div>
        <div className="flex justify-between">
          <span>{isPending ? "Taxa de rede (estimada)" : "Taxa de rede"}</span>
          <span className={cn(isFailed && "line-through")}>
            <EthPrice value={transaction.networkFee} />
          </span>
        </div>
        <div className="flex justify-between font-bold">
          <span>{config.totalLabel}</span>
          <span
            className={cn(
              isFailed
                ? "text-font-secondary line-through"
                : "text-font-accent",
            )}
          >
            <EthPrice value={total} />
          </span>
        </div>
      </div>
    </>
  );
}
