import { multiply } from "@/api/contracts";
import type { CartLine } from "@/api/contracts";
import { Delete } from "react-iconly";

import Monkey from "@/assets/monkey.png";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type CartItem = CartLine;

type ProductCardProps = {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

function ProductCard({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: ProductCardProps) {
  const { name, tokenId, edition, price, quantity } = item;

  return (
    <Card
      data-cart-line={item.id}
      className="grid grid-cols-[1fr_auto] items-center gap-2 w-full min-h-25 pr-4 bg-surface-card rounded-xl lg:grid-cols-[minmax(0,1fr)_7rem_9rem_7rem_2.5rem] lg:gap-4 lg:min-h-17.5 lg:rounded-md"
    >
      <div className="flex flex-row items-center gap-2 min-w-0 lg:gap-4">
        <img
          className="h-25 aspect-square object-cover lg:h-17.5"
          src={Monkey}
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
            {price} ETH
          </p>
        </div>
      </div>

      <span className="hidden lg:block font-bold text-font-accent">
        {price} ETH
      </span>

      <div className="flex flex-row items-center gap-3">
        <Button
          className="size-6 rounded-full"
          variant="outline"
          size="icon"
          aria-label={`Diminuir quantidade de ${name}`}
          disabled={quantity <= 1}
          onClick={onDecrease}
        >
          -
        </Button>
        <span className="text-lg font-medium tabular-nums">{quantity}</span>
        <Button
          className="size-6 rounded-full"
          variant="outline"
          size="icon"
          aria-label={`Aumentar quantidade de ${name}`}
          disabled={quantity >= item.stock}
          onClick={onIncrease}
        >
          +
        </Button>
      </div>

      <span className="hidden lg:block font-bold text-font-accent tabular-nums">
        {multiply(price, quantity)} ETH
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

export { ProductCard };
