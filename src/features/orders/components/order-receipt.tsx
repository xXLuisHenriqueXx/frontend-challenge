import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { X } from "lucide-react";
import type { OrderPageModel } from "../types/order-page-model";
import { SummaryItem } from "./order-page-parts";
import { ReceiptAmounts } from "./receipt-amounts";
import { ReceiptItems } from "./receipt-items";
import { ReceiptStatus } from "./receipt-status";
import { ReceiptTotals } from "./receipt-totals";

export function OrderReceipt({
  isFailed,
  status,
  isPending,
  config,
  transaction,
  items,
  order,
  total,
  router,
}: Pick<
  OrderPageModel,
  | "isFailed"
  | "status"
  | "isPending"
  | "config"
  | "transaction"
  | "items"
  | "order"
  | "total"
  | "router"
>) {
  return (
    <section
      className={cn(
        "relative w-full max-w-144.5 border-b-10 bg-surface-card text-foreground",
        isFailed ? "border-error" : "border-primary",
      )}
    >
      <Link
        className="absolute right-4 top-4 text-primary transition-colors duration-300 hover:text-error"
        to="/"
        search={{
          q: "",
          collection: "",
          network: "",
          category: "",
          sort: "recent",
          page: 1,
          min: "0",
          max: "100",
        }}
        aria-label="Fechar"
      >
        <X />
      </Link>

      <ReceiptStatus
        isFailed={isFailed}
        status={status}
        isPending={isPending}
        config={config}
      />

      <dl
        className={cn(
          "grid grid-cols-2 gap-y-4 border-b px-6 py-4 text-xs sm:grid-cols-4 sm:px-9 sm:gap-y-0",
          isFailed ? "border-error" : "border-primary",
        )}
      >
        <SummaryItem label="ID da transação" value={transaction.id} bold />
        <SummaryItem label="Data" value={transaction.date} divider />
        <SummaryItem
          label="Status"
          value={config.statusLabel}
          divider
          valueClassName={cn(
            "font-bold",
            isPending && "text-primary",
            isFailed && "text-error",
          )}
        />
        <SummaryItem label="Carteira" value={transaction.wallet} bold divider />
      </dl>

      <div className="px-6 py-6 sm:px-11">
        <h2 className="mb-3 text-sm font-bold">{config.detailsTitle}</h2>

        <div
          className={cn(
            "grid grid-cols-[1fr_auto] border-b pb-2 text-sm font-bold sm:grid-cols-[1fr_5rem_7rem]",
            isFailed ? "border-error/60" : "border-primary",
          )}
        >
          <span>NFTs</span>
          <span className="hidden text-center sm:block">Edições</span>
          <span className="text-right">{config.subtotalLabel}</span>
        </div>

        <ReceiptItems isFailed={isFailed} items={items} isPending={isPending} />

        <ReceiptTotals
          order={order}
          isPending={isPending}
          isFailed={isFailed}
          transaction={transaction}
          config={config}
          total={total}
        />

        <Separator
          className={cn("my-6", isFailed ? "bg-error/50" : "bg-primary/50")}
        />

        <p className="mt-4 text-center text-xs leading-relaxed text-font-secondary">
          {config.footnote}
        </p>

        <ReceiptAmounts isFailed={isFailed} router={router} config={config} />
      </div>
    </section>
  );
}
