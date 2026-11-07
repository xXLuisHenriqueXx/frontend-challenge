import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EthPrice } from "@/shared/components/eth-price";
import { SummarySkeleton } from "@/shared/components/skeleton";
import { Link } from "@tanstack/react-router";
import type { CartPageModel } from "../types/cart-page-model";

export function CartSummary({
  quote,
  coupon,
  setCoupon,
  couponMutation,
  subtotal,
  total,
  items,
  cart,
  navigate,
}: Pick<
  CartPageModel,
  | "quote"
  | "coupon"
  | "setCoupon"
  | "couponMutation"
  | "subtotal"
  | "total"
  | "items"
  | "cart"
  | "navigate"
>) {
  return (
    <aside
      aria-label="Resumo do carrinho"
      aria-busy={quote.isPending}
      className="fixed bottom-0 left-0 right-0 flex flex-col gap-8 p-6 pb-9 bg-surface-card rounded-t-[40px] lg:sticky lg:top-10 lg:gap-6 lg:p-0 lg:bg-transparent lg:rounded-none"
    >
      {quote.isPending && <SummarySkeleton />}
      <h2 className="hidden lg:block pb-3 border-b border-border text-lg font-bold">
        Resumo da carteira
      </h2>

      <div className="flex flex-col gap-3">
        <label
          className="sr-only lg:not-sr-only lg:block text-sm font-bold"
          htmlFor="promo"
        >
          Código promocional
        </label>

        <div className="group/input flex flex-row items-center gap-2 pl-4 bg-surface-card border border-border focus-within:border-primary transition-colors duration-300 rounded-full outline-none lg:pl-3 lg:gap-0 lg:rounded-md lg:overflow-hidden">
          <Input
            id="promo"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="flex-1 border-transparent focus-visible:border-transparent font-bold p-0"
            placeholder="Digite o código promocional ..."
          />

          <Button
            disabled={couponMutation.isPending}
            onClick={() => {
              const removing =
                !!quote.data?.coupon &&
                (!coupon || coupon === quote.data.coupon);
              couponMutation.mutate(removing ? "" : coupon);
              if (removing) setCoupon("");
            }}
            className="rounded-full lg:rounded-none"
          >
            {quote.data?.coupon && (!coupon || coupon === quote.data.coupon)
              ? "Remover"
              : "Aplicar"}
          </Button>
        </div>

        <div className="flex flex-row justify-between">
          <p className="text-[15px]">Subtotal</p>
          <span>
            <EthPrice value={subtotal} />
          </span>
        </div>
        <div className="flex flex-row justify-between">
          <p className="text-[15px]">Desconto do lançamento</p>
          <span className="text-[15px]">( - ) {quote.data?.discount}</span>
        </div>
        <div className="flex flex-row justify-between">
          <p className="text-[15px]">Taxa de rede</p>

          <div className="flex flex-col items-end">
            <span>{quote.data?.fee} ETH</span>
            <span className="text-xs text-font-accent">Taxa estimada</span>
          </div>
        </div>
        <div className="flex flex-row justify-between lg:pt-3">
          <p className="font-bold">Total</p>
          <span className="text-lg font-bold text-font-accent">
            <EthPrice value={total} />
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          className="w-full rounded-full lg:rounded-md"
          disabled={
            items.length === 0 ||
            cart.mutation.isPending ||
            quote.isError ||
            quote.isFetching ||
            items.some((i) => i.quantity > i.stock)
          }
          onClick={() => void navigate({ to: "/payment" })}
        >
          Conectar e finalizar
        </Button>

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
          className="hidden lg:block text-center text-sm text-font-accent hover:underline"
        >
          Continuar explorando
        </Link>
      </div>
    </aside>
  );
}
