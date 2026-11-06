import { buttonVariants, Button } from "@/components/ui/button";
import { Children, cloneElement, isValidElement, useId, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { AccessibleForm } from "@/components/AccessibleForm";
import { useCheckout } from "@/api/checkout";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, createFileRoute, Link } from "@tanstack/react-router";
import { requireSession, walletOptions, message } from "@/api/client";
import { multiply } from "@/api/contracts";
import { useIdentity, RemoteState } from "@/api/hooks";
import type { Wallet as WalletData } from "@/api/contracts";

import { ChevronLeft, Wallet } from "react-iconly";
import { EllipsisVertical } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/payment/")({
  beforeLoad: ({ location }) => requireSession(location),
  component: RouteComponent,
});

/* ----------------------------- dados estáticos ---------------------------- */

const WALLET_PROVIDERS = [
  { id: "walletconnect", name: "WalletConnect", icon: "W" },
  { id: "metamask", name: "MetaMask", icon: "M" },
  { id: "coinbase", name: "Coinbase Wallet", icon: <Wallet /> },
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
  const titleId = useId();
  const attach = (node: ReactNode): ReactNode =>
    Children.map(node, (child) => {
      if (!isValidElement(child)) return child;
      const element = child as ReactElement<Record<string, unknown>>;
      if (
        typeof element.type === "string" &&
        ["input", "select", "textarea"].includes(element.type)
      )
        return cloneElement(element, {
          "aria-labelledby": element.props["aria-label"] ? undefined : titleId,
        });
      if (element.props.children)
        return cloneElement(element, {
          children: attach(element.props.children as ReactNode),
        });
      return child;
    });
  return (
    <div
      role="group"
      aria-labelledby={titleId}
      className={`flex flex-col gap-2 text-sm ${className ?? ""}`}
    >
      <span id={titleId}>
        {label === "&nbsp;" ? "Carteira secundária (opcional)" : label}
        {required && (
          <span className="ml-0.5 text-font-accent" aria-hidden="true">
            *
          </span>
        )}
      </span>
      {attach(children)}
    </div>
  );
}

function SavedWalletCard({
  wallet,
  checked,
  onSelect,
}: {
  wallet: WalletData;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <Card className="flex flex-row gap-2 items-center justify-between w-full min-h-22.5 px-5 py-4 bg-surface-card rounded-xl">
      <label className="flex flex-1 flex-row gap-5 items-center cursor-pointer">
        <input
          aria-label={wallet.name}
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
  const { id } = useIdentity();
  const navigate = useNavigate();
  const wallets = useQuery(walletOptions(id));

  const SAVED_WALLETS = wallets.data ?? [];
  const [savedWallet, setSavedWallet] = useState("");
  const walletId = savedWallet || SAVED_WALLETS[0]?.id || "";
  const [provider, setProvider] = useState("coinbase");
  const selectedWallet = SAVED_WALLETS.find((w) => w.id === walletId);
  const [networkChoice, setNetworkChoice] = useState("");
  const network = networkChoice || selectedWallet?.network || "";
  const checkout = useCheckout(id, walletId, network);
  const { quote, mutation } = checkout;
  const session = useIdentity();

  const NFTS =
    quote.data?.items.map((i) => ({
      id: i.tokenId,
      name: i.name,
      qty: i.quantity,
      price: multiply(i.price, i.quantity),
    })) ?? [];
  return (
    <>
      {" "}
      <main className="mx-auto flex flex-col w-full max-w-300 min-h-dvh py-8 px-7 lg:min-h-0 lg:px-6 lg:py-10">
        <h1 className="sr-only">Pagamento com carteira</h1>
        <RemoteState query={wallets} />
        <RemoteState query={quote} />

        <header className="flex flex-row items-center mb-4 lg:hidden">
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
            className={buttonVariants({
              className: "size-8.75 rounded-full",
              variant: "outline",
              size: "icon",
            })}
            aria-label="Voltar"
          >
            <ChevronLeft />
          </Link>

          <p className="mx-auto text-xl font-bold">Pagamento com carteira</p>
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
          <section>
            <h2 className="mb-4 font-bold">Perfil do colecionador</h2>

            <AccessibleForm
              error={mutation.error}
              ref={checkout.form}
              id="collector-form"
              onChange={() => {
                checkout.persist();
                checkout.resetReview();
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
            >
              <Field label="Nome de exibição" required>
                <input
                  className={fieldClass}
                  name="displayName"
                  required
                  minLength={2}
                  defaultValue={
                    checkout.draft.displayName ?? session.data?.user.displayName
                  }
                />
              </Field>

              <Field label="Nome de usuário" required>
                <input
                  className={fieldClass}
                  name="username"
                  required
                  minLength={3}
                  defaultValue={
                    checkout.draft.username ?? session.data?.user.username
                  }
                />
              </Field>

              <Field label="Rede" required>
                <select
                  className={fieldClass}
                  name="network"
                  required
                  value={network}
                  onChange={(e) => {
                    setNetworkChoice(e.target.value);
                    checkout.resetConnection();
                  }}
                >
                  <option value="" disabled>
                    Selecione uma rede
                  </option>
                  <option value="Ethereum">Ethereum</option>
                  <option value="Polygon">Polygon</option>
                  <option value="Solana">Solana</option>
                </select>
              </Field>

              <Field label="Nome do perfil" required>
                <input
                  className={fieldClass}
                  name="profileName"
                  required
                  defaultValue={
                    checkout.draft.profileName ?? session.data?.user.displayName
                  }
                />
              </Field>

              <Field label="Endereço da carteira" required>
                <input
                  className={fieldClass}
                  name="walletAddress"
                  required
                  readOnly
                  value={selectedWallet?.address ?? ""}
                  placeholder="Endereço 0x da carteira"
                />
              </Field>

              <Field label="&nbsp;" className="[&>span]:invisible">
                <input
                  className={fieldClass}
                  name="secondaryWallet"
                  defaultValue={checkout.draft.secondaryWallet ?? ""}
                  placeholder="ENS ou carteira secundária (opcional)"
                />
              </Field>

              <Field label="Tipo de carteira" required>
                <select
                  className={fieldClass}
                  name="walletType"
                  required
                  value={provider}
                  onChange={(e) => {
                    setProvider(e.target.value);
                    checkout.resetConnection();
                  }}
                >
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
                <input
                  className={fieldClass}
                  name="referralCode"
                  required
                  minLength={3}
                  defaultValue={checkout.draft.referralCode ?? ""}
                />
              </Field>

              <Field label="E-mail" required>
                <input
                  className={fieldClass}
                  name="email"
                  type="email"
                  required
                  defaultValue={
                    checkout.draft.email ?? session.data?.user.email
                  }
                />
              </Field>

              <Field label="Nome ENS" required>
                <div className="flex gap-2">
                  <select
                    className={`${fieldClass} w-auto self-start`}
                    name="ens"
                    defaultValue=".eth"
                  >
                    <option value=".eth">.eth</option>
                  </select>
                  <input
                    className={fieldClass}
                    name="ensName"
                    aria-label="Nome ENS"
                    required
                    defaultValue={
                      checkout.draft.ensName ??
                      session.data?.user.ens ??
                      session.data?.user.username
                    }
                  />
                </div>
              </Field>

              <label className="md:col-span-2 flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  name="useOtherWallet"
                  onChange={(e) => {
                    if (e.target.checked) void navigate({ to: "/wallets" });
                  }}
                />
                Usar outra carteira?
              </label>

              <Field
                label="Observação do colecionador (opcional)"
                className="md:col-span-2"
              >
                <textarea
                  className={`${fieldClass} h-40 resize-none py-3`}
                  name="note"
                  defaultValue={checkout.draft.note ?? ""}
                />
              </Field>
            </AccessibleForm>
          </section>

          <aside className="flex flex-1 flex-col justify-between gap-6 lg:flex-none lg:justify-start lg:gap-5">
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
                  {SAVED_WALLETS.map((wallet) => (
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
                  <span className="hidden lg:inline">
                    {quote.data?.total} ETH
                  </span>
                </span>
              </p>
            </div>

            <Button
              onClick={() => checkout.connect.mutate()}
              disabled={checkout.connect.isPending || !walletId}
              variant="outline"
            >
              {checkout.connected
                ? "Desconectar carteira"
                : "Conectar carteira"}
            </Button>
            {checkout.connect.isError && (
              <p role="alert">{message(checkout.connect.error)}</p>
            )}
            {checkout.reviewed && (
              <p role="status">
                Revise os itens, a carteira, a rede e o total acima. Confirme
                para enviar o pedido.
              </p>
            )}
            <Button
              disabled={
                mutation.isPending ||
                (!checkout.recovering &&
                  (!walletId || quote.isError || !quote.data?.items.length))
              }
              form="collector-form"
              type={checkout.recovering ? "button" : "submit"}
              onClick={
                checkout.recovering ? () => mutation.mutate() : undefined
              }
              className="w-full rounded-full lg:rounded-md lg:h-11"
            >
              {checkout.recovering
                ? "Recuperar tentativa"
                : checkout.reviewed
                  ? "Confirmar compra"
                  : "Revisar compra"}
            </Button>
          </aside>
        </div>
      </main>
      <div className="mx-auto mt-30 hidden w-full max-w-300 px-8 pb-16 lg:block">
        <Footer />
      </div>
    </>
  );
}
