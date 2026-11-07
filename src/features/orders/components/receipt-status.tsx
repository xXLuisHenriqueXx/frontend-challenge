import ThankYou from "@/assets/thank-you.png";
import { cn } from "cn";
import { Clock, Loader2, XCircle } from "lucide-react";
import { failureReason } from "../lib/receipt-state";

import type { OrderPageModel } from "../types/order-page-model";

export function ReceiptStatus({
  isFailed,
  status,
  isPending,
  config,
}: Pick<OrderPageModel, "isFailed" | "status" | "isPending" | "config">) {
  return (
    <header
      className={cn(
        "flex flex-col items-center gap-4 border-b px-6 pb-5 pt-8",
        isFailed ? "border-error" : "border-primary",
      )}
    >
      {status === "success" && <img src={ThankYou} alt="Thank you" />}

      {isPending && (
        <div
          className="relative flex size-20 items-center justify-center rounded-full border border-primary text-primary"
          role="status"
          aria-label="Processando"
        >
          <Loader2 className="absolute size-20 animate-spin opacity-40" />
          <Clock className="size-8" />
        </div>
      )}

      {isFailed && (
        <div className="flex size-20 items-center justify-center rounded-full border border-error text-error">
          <XCircle className="size-10" />
        </div>
      )}

      <h1
        className={cn(
          "text-center text-sm font-bold sm:text-base",
          isFailed ? "text-error" : "text-font-secondary",
        )}
      >
        {config.title}
      </h1>

      {isFailed && (
        <p className="rounded-sm border border-error/50 px-3 py-1 text-center text-xs text-error">
          {failureReason}
        </p>
      )}
    </header>
  );
}
