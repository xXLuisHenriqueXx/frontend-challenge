import { Button } from "@/components/ui/button";
import { ProviderCard } from "@/features/checkout/components/provider-card";
import { SavedWalletCard } from "@/features/checkout/components/saved-wallet-card";
import { WALLET_PROVIDERS } from "@/features/checkout/lib/presentation";
import { EthPrice } from "@/shared/components/eth-price";
import { NftImage } from "@/shared/components/nft-image";
import { SummaryRow } from "@/shared/components/summary-row";

import type { CheckoutPageModel } from "../types/checkout-page-model";

export function CheckoutWalletOptions({
  navigate,
  savedWallets,
  walletId,
  setSavedWallet,
  setNetworkChoice,
  checkout,
  checkoutItems,
  quote,
  provider,
  setProvider,
}: Pick<
  CheckoutPageModel,
  | "navigate"
  | "savedWallets"
  | "walletId"
  | "setSavedWallet"
  | "setNetworkChoice"
  | "checkout"
  | "checkoutItems"
  | "quote"
  | "provider"
  | "setProvider"
>) {
  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between">
          <p className="font-bold">Carteira conectada</p>

          <Button
            onClick={() => void navigate({ to: "/wallets" })}
            variant="link"
            size="link"
          >
            Trocar carteira
          </Button>
        </div>

        <div className="space-y-5">
          {savedWallets.map((wallet) => (
            <SavedWalletCard
              key={wallet.id}
              wallet={wallet}
              checked={walletId === wallet.id}
              onSelect={() => {
                setSavedWallet(wallet.id);
                setNetworkChoice(wallet.network);
                checkout.resetConnection();
              }}
            />
          ))}
        </div>
      </div>

      <section className="hidden lg:block">
        <h2 className="font-bold">Seus NFTs</h2>

        <div className="mt-1 mb-2 flex justify-between text-sm font-bold">
          <span>NFTs</span>
          <span>Subtotal</span>
        </div>

        <ul className="space-y-2">
          {checkoutItems.map((nft) => (
            <li
              key={nft.id}
              className="flex items-center gap-3 rounded-lg bg-surface-card p-1 pr-3"
            >
              <NftImage
                src={nft.image}
                alt={nft.name}
                sizes="70px"
                className="size-17.5 shrink-0 rounded-md object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{nft.name}</p>
                <p className="text-xs text-font-secondary">
                  ID do token: #{nft.id}
                </p>
              </div>

              <span className="text-xs text-font-secondary">(x {nft.qty})</span>
              <span className="text-sm font-bold text-font-accent">
                <EthPrice value={nft.price} />
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-3 text-center text-sm">
          Tem um código promocional?{" "}
          <Button
            onClick={() => void navigate({ to: "/cart" })}
            variant="link"
            size="link"
          >
            Aplique aqui
          </Button>
        </p>

        <div className="mt-3 space-y-2">
          <SummaryRow
            label="Subtotal"
            value={(quote.data?.subtotal ?? "?") + " ETH"}
          />
          <SummaryRow
            label="Desconto do lançamento"
            value={"(-) " + (quote.data?.discount ?? "?")}
          />
          <SummaryRow
            label="Taxa de rede"
            value={(quote.data?.fee ?? "?") + " ETH"}
            hint="Taxa estimada"
          />
        </div>
      </section>

      <p className="font-bold lg:text-center">Carteira e rede</p>

      <div className="flex flex-col gap-4 lg:gap-3">
        {WALLET_PROVIDERS.map((p) => (
          <ProviderCard
            key={p.id}
            provider={p}
            checked={provider === p.id}
            onSelect={() => {
              setProvider(p.id);
              checkout.resetConnection();
            }}
          />
        ))}
      </div>

      <p className="w-full font-bold text-end lg:flex lg:justify-between lg:border-t lg:border-border lg:pt-4 lg:text-start">
        Total:
        <span className="ml-7 text-lg font-bold text-font-accent lg:ml-0">
          <span className="lg:hidden">{quote.data?.total} ETH</span>
          <span className="hidden lg:inline">{quote.data?.total} ETH</span>
        </span>
      </p>
    </div>
  );
}
