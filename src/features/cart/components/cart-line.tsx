import type { CartLine } from "@/features/cart/types/contracts";
import { EthPrice } from "@/shared/components/eth-price";
import { NftImage } from "@/shared/components/nft-image";
import { QuantityStepper } from "@/shared/components/quantity-stepper";
import { multiply } from "@/shared/lib/money";
import { Delete } from "react-iconly";

import { artworkForToken } from "@/assets/artwork";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type CartItem = CartLine;

type CartLineCardProps = {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

function CartLineCard({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: CartLineCardProps) {
  const { name, tokenId, edition, price, quantity } = item;

  return (
    <Card
      data-cart-line={item.id}
      className="cart-line grid grid-cols-[1fr_auto] items-center gap-2 w-full min-h-25 pr-4 bg-surface-card rounded-xl lg:grid-cols-[minmax(0,1fr)_7rem_9rem_7rem_2.5rem] lg:gap-4 lg:min-h-17.5 lg:rounded-md"
    >
      <div className="flex flex-row items-center gap-2 min-w-0 lg:gap-4">
        <NftImage
          className="size-25 shrink-0 aspect-square object-cover lg:size-17.5"
          sizes="(min-width: 1024px) 70px, 100px"
          src={artworkForToken(item.nftId)}
          alt={name}
        />

        <div className="space-y-4 min-w-0 lg:space-y-0">
          <div>
            <h2 className="text-[15px] font-bold truncate">{name}</h2>
            <p className="text-sm text-secondary lg:hidden">
              Edição: {edition}
            </p>
            <p className="hidden lg:block text-sm text-secondary">
              ID do token: {tokenId}
            </p>
          </div>

          <p className="text-lg font-bold text-font-accent lg:hidden">
            <EthPrice value={price} />
          </p>
        </div>
      </div>

      <span className="hidden lg:block font-bold text-font-accent">
        <EthPrice value={price} />
      </span>

      <QuantityStepper
        context="cart"
        quantity={quantity}
        stock={item.stock}
        name={name}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
      />

      <span className="hidden lg:block font-bold text-font-accent tabular-nums">
        <EthPrice value={multiply(price, quantity)} />
      </span>

      <Button
        className="inline-flex"
        variant="ghost"
        size="icon"
        aria-label={`Remover ${name}`}
        onClick={onRemove}
      >
        <Delete size={20} />
      </Button>
    </Card>
  );
}

export { CartLineCard };
