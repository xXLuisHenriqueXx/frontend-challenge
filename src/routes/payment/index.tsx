import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Wallet } from "react-iconly";
import { EllipsisVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/payment/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="relative flex flex-col justify-between w-full h-dvh py-8 px-7">
      <div className="flex flex-col gap-4">
        <header className="flex flex-row items-center">
          <Link to="/">
            <Button
              className="size-8.75 border-border bg-surface-raised hover:bg-surface-dark rounded-full [&_svg]:size-5"
              variant="outline"
              size="icon"
            >
              <ChevronLeft />
            </Button>
          </Link>

          <h1 className="mx-auto text-xl font-bold">Pagamento com carteira</h1>
        </header>

        <div className="flex flex-row justify-between">
          <p className="font-bold">Carteira conectada</p>

          <Button variant="link" size="link">
            Trocar carteira
          </Button>
        </div>

        <div className="space-y-5">
          <Card className="flex flex-row gap-2 items-center justify-between w-full min-h-22.5 px-5 py-4 bg-surface-card rounded-xl">
            <div className="flex flex-row gap-5 items-center">
              <input type="radio" />

              <div>
                <p className="mb-2 font-bold">Reserva</p>
                <p className="text-sm text-font-secondary">nova.kurio.eth</p>
                <p className="text-sm text-font-secondary">Rede Polygon</p>
              </div>
            </div>

            <Button className="[&_svg]:size-5" variant="ghost" size="icon-sm">
              <EllipsisVertical />
            </Button>
          </Card>
          <Card className="flex flex-row gap-2 items-center justify-between w-full min-h-22.5 px-5 py-4 bg-surface-card rounded-xl">
            <div className="flex flex-row gap-5 items-center">
              <input type="radio" />

              <div>
                <p className="mb-2 font-bold">Principal</p>
                <p className="text-sm text-font-secondary">0xA91F…E82C</p>
                <p className="text-sm text-font-secondary">
                  Rede principal Ethereum
                </p>
              </div>
            </div>

            <Button className="[&_svg]:size-5" variant="ghost" size="icon-sm">
              <EllipsisVertical />
            </Button>
          </Card>
        </div>

        <p className="font-bold">Carteira e rede</p>

        <Card className="flex flex-row items-center justify-between w-full min-h-22.5 px-5 py-4 bg-surface-card rounded-xl">
          <div className="flex flex-row gap-3 items-center">
            <div className="flex items-center justify-center size-10 bg-surface-raised border border-border rounded-full text-sm font-bold text-font-accent">
              W
            </div>

            <p className="text-sm">WalletConnect</p>
          </div>

          <input type="radio" />
        </Card>

        <Card className="flex flex-row items-center justify-between w-full min-h-22.5 px-5 py-4 bg-surface-card rounded-xl">
          <div className="flex flex-row gap-3 items-center">
            <div className="flex items-center justify-center size-10 bg-surface-raised border border-border rounded-full text-sm font-bold text-font-accent">
              M
            </div>

            <p className="text-sm">MetaMask</p>
          </div>

          <input type="radio" />
        </Card>

        <Card className="flex flex-row items-center justify-between w-full min-h-22.5 px-5 py-4 bg-surface-card rounded-xl">
          <div className="flex flex-row gap-3 items-center">
            <div className="flex items-center justify-center size-10 bg-surface-raised border border-border rounded-full text-sm font-bold text-font-accent">
              <Wallet />
            </div>

            <p className="text-sm">Coinbase Wallet</p>
          </div>

          <input type="radio" />
        </Card>

        <p className="w-full font-bold text-end">
          Total:
          <span className="ml-7 text-lg font-bold text-font-accent">
            8.936 ETH
          </span>
        </p>
      </div>

      <Button className="w-full rounded-full">Confirmar compra</Button>
    </main>
  );
}
