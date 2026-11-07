import { useIdentity } from "@/features/auth/hooks/use-identity";
import { quoteOptions } from "@/features/cart/api/queries";
import { useCart } from "@/features/cart/hooks/use-cart";
import { useQuote } from "@/features/cart/hooks/use-quote";
import type { CartLine, Quote } from "@/features/cart/types/contracts";
import { parseSearch } from "@/features/catalog/api/search";
import { useNfts } from "@/features/catalog/hooks/use-nfts";
import { queryClient, send } from "@/shared/api/http";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const EMPTY_CART_ITEMS: CartLine[] = [];

export function useCartPage() {
  const related = useNfts(parseSearch({}));
  const cart = useCart();
  const { id } = useIdentity();
  const navigate = useNavigate();
  const quote = useQuote(id);
  const [coupon, setCoupon] = useState("");
  const [cartNotice, setCartNotice] = useState("");
  const [removedLine, setRemovedLine] = useState<{
    id: string;
    index: number;
  } | null>(null);
  const couponMutation = useMutation({
    mutationFn: (value: string) => send<Quote>("/quote", { coupon: value }),
    onSuccess: (value) => {
      queryClient.setQueryData(quoteOptions(id).queryKey, value);
      setCartNotice(value.coupon ? "Cupom aplicado." : "Cupom removido.");
    },
  });
  const items = cart.data?.items ?? EMPTY_CART_ITEMS;
  useEffect(() => {
    if (!removedLine || items.some((item) => item.id === removedLine.id))
      return;
    const lines = Array.from(
      document.querySelectorAll<HTMLElement>("[data-cart-line]"),
    );
    const next = lines.at(Math.min(removedLine.index, lines.length - 1));
    const target =
      next?.querySelector<HTMLElement>("button:not(:disabled)") ??
      document.querySelector<HTMLElement>("main");
    target?.focus();
    setRemovedLine(null);
  }, [items, removedLine]);
  const relatedNfts = (related.data?.items ?? [])
    .slice(0, 5)
    .map((n) => ({ name: n.name, price: n.price, image: n.images[0] }));
  const subtotal = quote.data?.subtotal;
  const total = quote.data?.total;
  function changeQuantity(itemId: string, delta: number) {
    const item = items.find((i) => i.id === itemId)!;
    cart.mutation.mutate(
      { item, quantity: item.quantity + delta },
      { onSuccess: () => setCartNotice("Quantidade atualizada.") },
    );
  }
  function removeItem(itemId: string) {
    const index = items.findIndex((item) => item.id === itemId);
    cart.mutation.mutate(
      {
        item: items.find((i) => i.id === itemId),
        remove: true,
      },
      {
        onSuccess: () => {
          setCartNotice("NFT removido do carrinho.");
          setRemovedLine({ id: itemId, index });
        },
      },
    );
  }
  return {
    related,
    cart,
    id,
    navigate,
    quote,
    coupon,
    setCoupon,
    cartNotice,
    setCartNotice,
    couponMutation,
    items,
    relatedNfts,
    subtotal,
    total,
    changeQuantity,
    removeItem,
  };
}
