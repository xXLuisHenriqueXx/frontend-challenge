import { Button } from "@/components/ui/button";
import { EthPrice } from "@/shared/components/eth-price";
import { QuantityStepper } from "@/shared/components/quantity-stepper";
import { Buy, Heart } from "react-iconly";
import type { NftPageModel } from "../types/nft-page-model";

export function NftPurchaseControls({
  quantity,
  setQuantity,
  nft,
  total,
  cart,
  add,
  favorite,
}: Pick<
  NftPageModel,
  "quantity" | "setQuantity" | "nft" | "total" | "cart" | "add" | "favorite"
>) {
  return (
    <section className="-mt-10 flex h-full w-full flex-col gap-5 rounded-t-[40px] bg-surface-card p-6 pt-5 pb-9 drop-shadow-[0_-4px_20px_rgba(0,0,0,0.4)] lg:order-4 lg:mt-0 lg:flex-row lg:items-center lg:justify-between lg:rounded-none lg:bg-transparent lg:p-0 lg:drop-shadow-none">
      <div className="flex flex-row items-center justify-between lg:justify-start">
        <QuantityStepper
          context="detail"
          quantity={quantity}
          stock={nft.stock}
          onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
          onIncrease={() => setQuantity((q) => Math.min(nft.stock, q + 1))}
        >
          <span className="text-[15px] font-medium text-secondary lg:hidden">
            Qtd.
          </span>
        </QuantityStepper>

        <p className="text-xl font-bold text-font-accent lg:hidden">
          <EthPrice value={total} />
        </p>
      </div>

      <div className="flex flex-row items-center gap-3">
        <Button
          disabled={cart.mutation.isPending || nft.stock === 0}
          onClick={add}
          className="flex-1 rounded-full lg:flex-none lg:px-10"
        >
          <span className="lg:hidden">Comprar NFT</span>
          <span className="hidden lg:inline">Comprar</span>
        </Button>

        <Button
          className="rounded-full lg:hidden"
          variant="outline"
          size="icon"
          aria-label="Adicionar ao carrinho"
          onClick={add}
          disabled={cart.mutation.isPending || nft.stock === 0}
        >
          <Buy filled />
        </Button>

        <Button
          aria-pressed={favorite.selected}
          onClick={favorite.toggle}
          disabled={favorite.mutation.isPending}
          className="hidden rounded-full lg:inline-flex"
          variant="outline"
        >
          <Heart filled={favorite.selected} />{" "}
          {favorite.selected ? "Favoritado" : "Favoritar"}
        </Button>
      </div>
    </section>
  );
}
