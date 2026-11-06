import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Wallet } from "react-iconly";
import { EllipsisVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/payment/")({
  component: RouteComponent,
});

/* ----------------------------- dados estáticos ---------------------------- */

const SAVED_WALLETS = [
  {
    id: "reserva",
    name: "Reserva",
    address: "nova.kurio.eth",
    network: "Rede Polygon",
  },
  {
    id: "principal",
    name: "Principal",
    address: "0xA91F…E82C",
    network: "Rede principal Ethereum",
  },
];

const WALLET_PROVIDERS = [
  { id: "walletconnect", name: "WalletConnect", icon: "W" },
  { id: "metamask", name: "MetaMask", icon: "M" },
  { id: "coinbase", name: "Coinbase Wallet", icon: <Wallet /> },
];

const NFTS = [
  { id: "0042", name: "Emerald Ape #042", qty: 2, price: "2.38" },
  { id: "0314", name: "Violet Nomad #314", qty: 6, price: "8.34" },
  { id: "0088", name: "Ivory Baron #088", qty: 9, price: "16.11" },
];

const BREADCRUMB = ["Início", "Mercado", "Pagamento"];

const fieldClass =
  "h-11 w-full rounded-md border border-border bg-surface-card px-3 text-sm text-foreground placeholder:text-font-secondary outline-none focus-visible:border-font-accent";

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-2 text-sm ${className ?? ""}`}>
      <span>
        {label}
        {required && <span className="ml-0.5 text-font-accent">*</span>}
      </span>
      {children}
    </label>
  );
}

function SavedWalletCard({
  wallet,
  checked,
  onSelect,
}: {
  wallet: (typeof SAVED_WALLETS)[number];
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <Card className="flex flex-row gap-2 items-center justify-between w-full min-h-22.5 px-5 py-4 bg-surface-card rounded-xl">
      <label className="flex flex-1 flex-row gap-5 items-center cursor-pointer">
        <input
          type="radio"
          name="saved-wallet"
          checked={checked}
          onChange={onSelect}
        />

        <div>
          <p className="mb-2 font-bold">{wallet.name}</p>
          <p className="text-sm text-font-secondary">{wallet.address}</p>
          <p className="text-sm text-font-secondary">{wallet.network}</p>
        </div>
      </label>

      <Button
        className="size-10"
        variant="ghost"
        size="icon"
        aria-label={`Opções da carteira ${wallet.name}`}
      >
        <EllipsisVertical />
      </Button>
    </Card>
  );
}

function ProviderCard({
  provider,
  checked,
  onSelect,
}: {
  provider: (typeof WALLET_PROVIDERS)[number];
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      className={`w-full min-h-22.5 px-5 py-4 bg-surface-card rounded-xl transition-colors lg:min-h-0 lg:py-3 ${
        checked ? "lg:border-font-accent" : ""
      }`}
    >
      <label className="flex flex-row items-center justify-between cursor-pointer">
        <div className="flex flex-row gap-3 items-center">
          <div className="flex items-center justify-center size-10 bg-surface-raised border border-border rounded-full text-sm font-bold text-font-accent">
            {provider.icon}
          </div>

          <span className="text-sm">{provider.name}</span>
        </div>

        <input
          type="radio"
          name="provider"
          checked={checked}
          onChange={onSelect}
        />
      </label>
    </Card>
  );
}

function SummaryRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between text-sm">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      {hint && (
        <span className="mt-1 text-center text-xs text-font-accent">
          {hint}
        </span>
      )}
    </div>
  );
}

function RouteComponent() {
  const [savedWallet, setSavedWallet] = useState("reserva");
  const [provider, setProvider] = useState("coinbase");

  return (
    <main className="mx-auto flex flex-col w-full max-w-300 min-h-dvh py-8 px-7 lg:min-h-0 lg:px-6 lg:py-10">
      <header className="flex flex-row items-center mb-4 lg:hidden">
        <Link to="/">
          <Button
            className="size-8.75 rounded-full"
            variant="outline"
            size="icon"
            aria-label="Voltar"
          >
            <ChevronLeft />
          </Button>
        </Link>

        <h1 className="mx-auto text-xl font-bold">Pagamento com carteira</h1>
      </header>

      <nav
        aria-label="Breadcrumb"
        className="hidden lg:mb-10 lg:block text-sm font-bold"
      >
        {BREADCRUMB.map((item, i) => (
          <span key={item}>
            {i > 0 && " / "}
            {item}
          </span>
        ))}
      </nav>

      <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,1fr)_405px]">
        <section className="hidden lg:block">
          <h2 className="mb-4 font-bold">Perfil do colecionador</h2>

          <form
            id="collector-form"
            className="grid grid-cols-2 gap-x-6 gap-y-5"
            onSubmit={(e) => e.preventDefault()}
          >
            <Field label="Nome de exibição" required>
              <input className={fieldClass} name="displayName" />
            </Field>

            <Field label="Nome de usuário" required>
              <input className={fieldClass} name="username" />
            </Field>

            <Field label="Rede" required>
              <select className={fieldClass} name="network" defaultValue="">
                <option value="" disabled>
                  Selecione uma rede
                </option>
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
              </select>
            </Field>

            <Field label="Nome do perfil" required>
              <input className={fieldClass} name="profileName" />
            </Field>

            <Field label="Endereço da carteira" required>
              <input
                className={fieldClass}
                name="walletAddress"
                placeholder="Endereço 0x da carteira"
              />
            </Field>

            <Field label="&nbsp;" className="[&>span]:invisible">
              <input
                className={fieldClass}
                name="secondaryWallet"
                placeholder="ENS ou carteira secundária (opcional)"
              />
            </Field>

            <Field label="Tipo de carteira" required>
              <select className={fieldClass} name="walletType" defaultValue="">
                <option value="" disabled>
                  Selecione uma carteira
                </option>
                {WALLET_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Código de indicação" required>
              <input className={fieldClass} name="referralCode" />
            </Field>

            <Field label="E-mail" required>
              <input className={fieldClass} name="email" type="email" />
            </Field>

            <Field label="Nome ENS" required>
              <select
                className={`${fieldClass} w-auto self-start`}
                name="ens"
                defaultValue=".eth"
              >
                <option value=".eth">.eth</option>
              </select>
            </Field>

            <label className="col-span-2 flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="useOtherWallet" />
              Usar outra carteira?
            </label>

            <Field
              label="Observação do colecionador (opcional)"
              className="col-span-2"
            >
              <textarea
                className={`${fieldClass} h-40 resize-none py-3`}
                name="note"
              />
            </Field>
          </form>
        </section>

        <aside className="flex flex-1 flex-col justify-between gap-6 lg:flex-none lg:justify-start lg:gap-5">
          <div className="flex flex-col gap-4 lg:gap-5">
            <div className="flex flex-col gap-4 lg:hidden">
              <div className="flex flex-row justify-between">
                <p className="font-bold">Carteira conectada</p>

                <Button variant="link" size="link">
                  Trocar carteira
                </Button>
              </div>

              <div className="space-y-5">
                {SAVED_WALLETS.map((wallet) => (
                  <SavedWalletCard
                    key={wallet.id}
                    wallet={wallet}
                    checked={savedWallet === wallet.id}
                    onSelect={() => setSavedWallet(wallet.id)}
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
                {NFTS.map((nft) => (
                  <li
                    key={nft.id}
                    className="flex items-center gap-3 rounded-lg bg-surface-card p-1 pr-3"
                  >
                    <div className="size-17.5 shrink-0 rounded-md bg-surface-raised" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{nft.name}</p>
                      <p className="text-xs text-font-secondary">
                        ID do token: #{nft.id}
                      </p>
                    </div>

                    <span className="text-xs text-font-secondary">
                      (x {nft.qty})
                    </span>
                    <span className="text-sm font-bold text-font-accent">
                      {nft.price} ETH
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-center text-sm">
                Tem um código promocional?{" "}
                <Button variant="link" size="link">
                  Aplique aqui
                </Button>
              </p>

              <div className="mt-3 space-y-2">
                <SummaryRow label="Subtotal" value="26.83 ETH" />
                <SummaryRow label="Desconto do lançamento" value="(-) 00.00" />
                <SummaryRow
                  label="Taxa de rede"
                  value="0.016 ETH"
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
                  onSelect={() => setProvider(p.id)}
                />
              ))}
            </div>

            <p className="w-full font-bold text-end lg:flex lg:justify-between lg:border-t lg:border-border lg:pt-4 lg:text-start">
              Total:
              <span className="ml-7 text-lg font-bold text-font-accent lg:ml-0">
                <span className="lg:hidden">8.936 ETH</span>
                <span className="hidden lg:inline">26.846 ETH</span>
              </span>
            </p>
          </div>

          <Button className="w-full rounded-full lg:rounded-md lg:h-11">
            Confirmar compra
          </Button>
        </aside>
      </div>

      <div className="hidden lg:block mt-30">
        <Footer />
      </div>
    </main>
  );
}
