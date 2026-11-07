import { Link } from "@tanstack/react-router";
import type { OrderPageModel } from "../types/order-page-model";

export function ReceiptAmounts({
  isFailed,
  router,
  config,
}: Pick<OrderPageModel, "isFailed" | "router" | "config">) {
  return (
    <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      {isFailed ? (
        <>
          <button
            type="button"
            onClick={() => router.history.back()}
            className="block w-full rounded-sm bg-primary px-4 py-3 text-center text-sm font-bold text-black transition-colors hover:bg-primary-light sm:w-fit"
          >
            {config.cta}
          </button>
          <Link
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
            className="block w-full rounded-sm border border-primary px-4 py-3 text-center text-sm font-bold text-primary transition-colors hover:bg-primary/10 sm:w-fit"
          >
            Voltar à loja
          </Link>
        </>
      ) : (
        <a
          aria-label="Referência de transação simulada"
          role="link"
          aria-disabled="true"
          tabIndex={-1}
          title="Referência simulada; não há transação em um explorador real"
          target="_blank"
          rel="noreferrer"
          className="block w-full rounded-sm bg-primary px-4 py-3 text-center text-sm font-bold text-black transition-colors hover:bg-primary-light sm:w-fit"
        >
          {config.cta}
        </a>
      )}
    </div>
  );
}
