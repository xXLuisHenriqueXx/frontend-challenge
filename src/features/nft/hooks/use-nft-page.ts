import { useCart } from "@/features/cart/hooks/use-cart";
import { parseSearch } from "@/features/catalog/api/search";
import { useFavorites } from "@/features/catalog/hooks/use-favorites";
import { useNfts } from "@/features/catalog/hooks/use-nfts";
import { useNft } from "@/features/nft/hooks/use-nft";
import { useParams } from "@tanstack/react-router";
import { useState } from "react";

export function useNftPage() {
  const { productId } = useParams({ strict: false });
  const related = useNfts(parseSearch({}));
  const query = useNft(productId ?? "");
  const cart = useCart();
  const favorite = useFavorites(productId ?? "");
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [tab, setTab] = useState<"details" | "reviews">("details");
  const nft = query.data;
  return {
    productId,
    related,
    query,
    cart,
    favorite,
    quantity,
    setQuantity,
    imageIndex,
    setImageIndex,
    tab,
    setTab,
    nft,
  };
}
