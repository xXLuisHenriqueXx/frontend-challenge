import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Clock, Loader2, X, XCircle } from "lucide-react";

import Monkey from "@/assets/monkey.png";
import ThankYou from "@/assets/thank-you.png";
import { cn } from "cn";
import { Separator } from "@/components/ui/separator";

type PaymentStatus = "success" | "pending" | "failed";

/**
 * O estado vem pela URL: /payment/confirm/?status=pending
 * Em produção, troque pelo status real retornado pela transação.
 */
export const Route = createFileRoute("/payment/confirm/")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { status: PaymentStatus } => ({
    status:
      search.status === "pending" || search.status === "failed"
        ? search.status
        : "success",
  }),
  component: RouteComponent,
});

const transaction = {
  id: "0xA91F…E82C",
  date: "29 Jul, 2026",
  wallet: "MetaMask",
  networkFee: 0.016,
  explorerUrl: "https://etherscan.io/tx/0xA91F",
};

const items = [
  {
    name: "Emerald Ape #042",
    tokenId: "#0042",
    quantity: 2,
    subtotal: 2.38,
    image: Monkey,
  },
  {
    name: "Violet Nomad #314",
    tokenId: "#0314",
    quantity: 6,
    subtotal: 8.34,
    image: Monkey,
  },
  {
    name: "Ivory Baron #088",
    tokenId: "#0088",
    quantity: 9,
    subtotal: 16.11,
    image: Monkey,
  },
];

const total =
  items.reduce((acc, i) => acc + i.subtotal, 0) + transaction.networkFee;

/* Motivo exibido no estado "recusado" (troque pelo retorno real da carteira/rede) */
const failureReason = "Transação rejeitada na carteira";

const statusConfig = {
  success: {
    title: "Seus NFTs agora estão na sua carteira",
    statusLabel: "Confirmada",
    detailsTitle: "Detalhes da transação",
    subtotalLabel: "Subtotal",
    totalLabel: "Total",
    footnote:
      "Transação confirmada na Ethereum. A propriedade foi transferida para sua carteira conectada e registrada na rede.",
    cta: "Ver no Etherscan",
  },
  pending: {
    title: "Aguardando confirmação da rede",
    statusLabel: "Pendente",
    detailsTitle: "NFTs reservados",
    subtotalLabel: "Subtotal",
    totalLabel: "Total estimado",
    footnote:
      "Sua transação foi enviada e está aguardando confirmação na Ethereum. Isso pode levar alguns minutos. Você pode fechar esta página, os NFTs aparecerão na sua carteira assim que a rede confirmar.",
    cta: "Acompanhar no Etherscan",
  },
  failed: {
    title: "Pagamento recusado",
    statusLabel: "Recusada",
    detailsTitle: "NFTs não adquiridos",
    subtotalLabel: "Subtotal",
    totalLabel: "Total não cobrado",
    footnote:
      "Nenhum NFT foi transferido para sua carteira e nenhum valor foi cobrado pela compra. Verifique o saldo e a rede selecionada na carteira e tente novamente.",
    cta: "Tentar novamente",
  },
} satisfies Record<PaymentStatus, Record<string, string>>;

function RouteComponent() {
  const { status } = Route.useSearch();
  const router = useRouter();
  const config = statusConfig[status];

  const isPending = status === "pending";
  const isFailed = status === "failed";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink p-4">
      <section
        className={cn(
          "relative w-full max-w-144.5 border-b-10 bg-surface-card text-foreground",
          isFailed ? "border-error" : "border-primary",
        )}
      >
        <Link
          className="absolute right-4 top-4 text-primary transition-colors duration-300 hover:text-error"
          to="/"
          aria-label="Fechar"
        >
          <X />
        </Link>

        <header
          className={cn(
            "flex flex-col items-center gap-4 border-b px-6 pb-5 pt-8",
            isFailed ? "border-error" : "border-primary",
          )}
        >
          {status === "success" && <img src={ThankYou} alt="Thank you" />}

          {isPending && (
            <div
              className="relative flex size-20 items-center justify-center rounded-full border border-primary text-primary"
              role="status"
              aria-label="Processando"
            >
              <Loader2 className="absolute size-20 animate-spin opacity-40" />
              <Clock className="size-8" />
            </div>
          )}

          {isFailed && (
            <div className="flex size-20 items-center justify-center rounded-full border border-error text-error">
              <XCircle className="size-10" />
            </div>
          )}

          <h1
            className={cn(
              "text-center text-sm font-bold sm:text-base",
              isFailed ? "text-error" : "text-font-secondary",
            )}
          >
            {config.title}
          </h1>

          {isFailed && (
            <p className="rounded-sm border border-error/50 px-3 py-1 text-center text-xs text-error">
              {failureReason}
            </p>
          )}
        </header>

        <dl
          className={cn(
            "grid grid-cols-2 gap-y-4 border-b px-6 py-4 text-xs sm:grid-cols-4 sm:px-9 sm:gap-y-0",
            isFailed ? "border-error" : "border-primary",
          )}
        >
          <SummaryItem label="ID da transação" value={transaction.id} bold />
          <SummaryItem label="Data" value={transaction.date} divider />
          <SummaryItem
            label="Status"
            value={config.statusLabel}
            divider
            valueClassName={cn(
              "font-bold",
              isPending && "text-primary",
              isFailed && "text-error",
            )}
          />
          <SummaryItem
            label="Carteira"
            value={transaction.wallet}
            bold
            divider
          />
        </dl>

        <div className="px-6 py-6 sm:px-11">
          <h2 className="mb-3 text-sm font-bold">{config.detailsTitle}</h2>

          <div
            className={cn(
              "grid grid-cols-[1fr_auto] border-b pb-2 text-sm font-bold sm:grid-cols-[1fr_5rem_7rem]",
              isFailed ? "border-error/60" : "border-primary",
            )}
          >
            <span>NFTs</span>
            <span className="hidden text-center sm:block">Edições</span>
            <span className="text-right">{config.subtotalLabel}</span>
          </div>

          <ul className={cn(isFailed && "opacity-60")}>
            {items.map((item) => (
              <li
                key={item.tokenId}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 py-3 sm:grid-cols-[auto_1fr_5rem_7rem]"
              >
                <img
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
                    {item.subtotal.toFixed(2)} ETH
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="ml-auto mt-2 w-full space-y-1 text-sm sm:w-[70%]">
            <div className="flex justify-between">
              <span>
                {isPending ? "Taxa de rede (estimada)" : "Taxa de rede"}
              </span>
              <span className={cn(isFailed && "line-through")}>
                {transaction.networkFee.toFixed(3)} ETH
              </span>
            </div>
            <div className="flex justify-between font-bold">
              <span>{config.totalLabel}</span>
              <span
                className={cn(
                  isFailed
                    ? "text-font-secondary line-through"
                    : "text-font-accent",
                )}
              >
                {total.toFixed(3)} ETH
              </span>
            </div>
          </div>

          <Separator
            className={cn("my-6", isFailed ? "bg-error/50" : "bg-primary/50")}
          />

          <p className="mt-4 text-center text-xs leading-relaxed text-font-secondary">
            {config.footnote}
          </p>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {isFailed ? (
              <>
                <button
                  type="button"
                  onClick={() => router.history.back()}
                  className="block w-full rounded-sm bg-primary px-4 py-3 text-center text-sm font-bold text-black transition-colors hover:bg-primary-light sm:w-fit"
                >
                  {config.cta}
                </button>
                <Link
                  to="/"
                  className="block w-full rounded-sm border border-primary px-4 py-3 text-center text-sm font-bold text-primary transition-colors hover:bg-primary/10 sm:w-fit"
                >
                  Voltar à loja
                </Link>
              </>
            ) : (
              <a
                href={transaction.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-sm bg-primary px-4 py-3 text-center text-sm font-bold text-black transition-colors hover:bg-primary-light sm:w-fit"
              >
                {config.cta}
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function SummaryItem({
  label,
  value,
  bold,
  divider,
  valueClassName,
}: {
  label: string;
  value: string;
  bold?: boolean;
  divider?: boolean;
  valueClassName?: string;
}) {
  return (
    <div
      className={`px-3 first:pl-0 sm:px-4 ${
        divider ? "sm:border-l sm:border-primary" : ""
      } [&:nth-child(2n)]:border-l [&:nth-child(2n)]:border-primary sm:[&:nth-child(2n)]:border-l-0 sm:[&:nth-child(2n)]:border-primary`}
    >
      <dt
        className={cn("text-secondary", {
          "font-bold": bold,
        })}
      >
        {label}
      </dt>
      <dd className={cn("text-font-secondary", valueClassName)}>{value}</dd>
    </div>
  );
}
