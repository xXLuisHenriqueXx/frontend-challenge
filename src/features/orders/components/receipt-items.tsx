import { EthPrice } from "@/shared/components/eth-price";
import { NftImage } from "@/shared/components/nft-image";
import { cn } from "cn";
import type { OrderPageModel } from "../types/order-page-model";

export function ReceiptItems({
  isFailed,
  items,
  isPending,
}: Pick<OrderPageModel, "isFailed" | "items" | "isPending">) {
  return (
    <>
      <ul className={cn("receipt-items", isFailed && "opacity-60")}>
        {items.map((item) => (
          <li
            key={item.tokenId}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 py-3 sm:grid-cols-[auto_1fr_5rem_7rem]"
          >
            <NftImage
              src={item.image}
              alt={item.name}
              className={cn(
                "size-14 rounded-md object-cover sm:size-17.5",
                (isPending || isFailed) && "grayscale",
              )}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{item.name}</p>
              <p className="text-xs text-font-secondary">
                ID do token: {item.tokenId}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 sm:contents">
              <span className="text-xs text-font-secondary sm:text-center">
                (x {item.quantity})
              </span>
              <span
                className={cn(
                  "text-sm font-bold sm:text-right sm:text-base",
                  isFailed
                    ? "text-font-secondary line-through"
                    : "text-font-accent",
                )}
              >
                <EthPrice value={item.subtotal} />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
