import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";

import Monkey from "@/assets/monkey.png";

export const Route = createFileRoute("/payment/confirm/")({
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

function RouteComponent() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink p-4">
      <section className="relative w-full max-w-144.5 border-b-10 border-primary bg-surface-card text-foreground">
        <Link
          to="/"
          aria-label="Fechar"
          className="absolute right-4 top-4 text-primary transition-colors hover:text-primary-light"
        >
          <X className="size-5" />
        </Link>

        <header className="flex flex-col items-center gap-4 border-b border-primary px-6 pb-5 pt-8">
          <img src="/icons/thank-you.svg" alt="" className="h-20 w-auto" />
          <h1 className="text-center text-sm font-bold text-font-secondary sm:text-base">
            Seus NFTs agora estão na sua carteira
          </h1>
        </header>

        <dl className="grid grid-cols-2 gap-y-4 border-b border-primary px-6 py-4 text-xs sm:grid-cols-4 sm:px-9 sm:gap-y-0">
          <SummaryItem label="ID da transação" value={transaction.id} bold />
          <SummaryItem label="Data" value={transaction.date} divider />
          <SummaryItem
            label="Total"
            value={`${total.toFixed(3)} ETH`}
            divider
          />
          <SummaryItem
            label="Carteira"
            value={transaction.wallet}
            bold
            divider
          />
        </dl>

        <div className="px-6 py-6 sm:px-11">
          <h2 className="mb-3 text-sm font-bold">Detalhes da transação</h2>

          <div className="grid grid-cols-[1fr_auto] border-b border-border-soft pb-2 text-sm font-bold sm:grid-cols-[1fr_5rem_7rem]">
            <span>NFTs</span>
            <span className="hidden text-center sm:block">Edições</span>
            <span className="text-right">Subtotal</span>
          </div>

          <ul>
            {items.map((item) => (
              <li
                key={item.tokenId}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 py-3 sm:grid-cols-[auto_1fr_5rem_7rem]"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="size-14 rounded-md object-cover sm:size-17.5"
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
                  <span className="text-sm font-bold text-font-accent sm:text-right sm:text-base">
                    {item.subtotal.toFixed(2)} ETH
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="ml-auto mt-2 w-full space-y-1 border-b border-border-soft pb-3 text-sm sm:w-[70%]">
            <div className="flex justify-between">
              <span>Taxa de rede</span>
              <span>{transaction.networkFee.toFixed(3)} ETH</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-font-accent">{total.toFixed(3)} ETH</span>
            </div>
          </div>

          <p className="mt-4 text-center text-xs leading-relaxed text-font-secondary">
            Transação confirmada na Ethereum. A propriedade foi transferida para
            sua carteira conectada e registrada na rede.
          </p>

          <a
            href={transaction.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="mx-auto mt-6 block w-full rounded-sm bg-primary px-4 py-3 text-center text-sm font-bold text-black transition-colors hover:bg-primary-light sm:w-fit"
          >
            Ver no Etherscan
          </a>
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
}: {
  label: string;
  value: string;
  bold?: boolean;
  divider?: boolean;
}) {
  return (
    <div
      className={`px-3 first:pl-0 sm:px-4 ${
        divider ? "sm:border-l sm:border-primary" : ""
      } [&:nth-child(2n)]:border-l [&:nth-child(2n)]:border-primary sm:[&:nth-child(2n)]:border-l-0 sm:[&:nth-child(2n)]:border-primary`}
    >
      <dt
        className={
          bold ? "font-bold text-font-secondary" : "text-font-secondary"
        }
      >
        {label}
      </dt>
      <dd className="text-font-secondary">{value}</dd>
    </div>
  );
}
