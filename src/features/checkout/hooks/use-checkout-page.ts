import { artworkForToken } from "@/assets/artwork";
import { useIdentity } from "@/features/auth/hooks/use-identity";
import { useCheckout } from "@/features/checkout/hooks/use-checkout";
import { useWallets } from "@/features/wallets/hooks/use-wallets";
import { multiply } from "@/shared/lib/money";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function useCheckoutPage() {
  const { id } = useIdentity();
  const navigate = useNavigate();
  const wallets = useWallets(id);
  const savedWallets = wallets.data ?? [];
  const [savedWallet, setSavedWallet] = useState("");
  const walletId = savedWallet || savedWallets[0]?.id || "";
  const [provider, setProvider] = useState("coinbase");
  const selectedWallet = savedWallets.find((w) => w.id === walletId);
  const [networkChoice, setNetworkChoice] = useState("");
  const network = networkChoice || selectedWallet?.network || "";
  const checkout = useCheckout(id, walletId, network);
  const { quote, mutation } = checkout;
  const session = useIdentity();
  const checkoutItems =
    quote.data?.items.map((i) => ({
      id: i.tokenId,
      name: i.name,
      image: artworkForToken(i.nftId),
      qty: i.quantity,
      price: multiply(i.price, i.quantity),
    })) ?? [];
  return {
    id,
    navigate,
    wallets,
    savedWallets,
    savedWallet,
    setSavedWallet,
    walletId,
    provider,
    setProvider,
    selectedWallet,
    networkChoice,
    setNetworkChoice,
    network,
    checkout,
    quote,
    mutation,
    session,
    checkoutItems,
  };
}
