import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "react-iconly";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "./-components/ProductCard";

export const Route = createFileRoute("/cart/")({
  component: RouteComponent,
});

function RouteComponent() {
  const ITEMS = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <main className="relative flex flex-col gap-3 w-full h-dvh pt-8">
      <header className="flex flex-row items-center px-7">
        <Link to="/">
          <Button
            className="size-8.75 rounded-full"
            variant="outline"
            size="icon"
          >
            <ChevronLeft />
          </Button>
        </Link>

        <h1 className="mx-auto text-xl font-bold">Carrinho de NFTs</h1>
      </header>

      <div className="flex flex-col gap-5 w-full px-7 pb-96 overflow-y-auto">
        {ITEMS.map((item) => (
          <ProductCard key={item} />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-8 pb-9 p-6 bg-surface-card rounded-t-[40px]">
        <div className="flex flex-col gap-3">
          <div className="group/input flex flex-row items-center gap-2 pl-4 bg-surface-card border border-border focus-within:border-primary transition-colors duration-300 rounded-full outline-none">
            <Input
              className="flex-1 border-transparent focus-visible:border-transparent font-bold p-0"
              placeholder="Digite o código promocional ..."
            />

            <Button className="rounded-full">Aplicar</Button>
          </div>

          <div className="flex flex-row justify-between">
            <p className="text-[15px]">Subtotal</p>
            <span>8.92 ETH</span>
          </div>
          <div className="flex flex-row justify-between">
            <p className="text-[15px]">Desconto do lançamento</p>
            <span className="text-[15px]">( - ) 00.00</span>
          </div>
          <div className="flex flex-row justify-between">
            <p className="text-[15px]">Taxa de rede</p>

            <div className="flex flex-col items-end">
              <span>0.016 ETH</span>
              <span className="text-xs text-font-accent">Taxa estimada</span>
            </div>
          </div>
          <div className="flex flex-row justify-between">
            <p className="font-bold">Total</p>
            <span className="text-lg font-bold text-font-accent">
              8.936 ETH
            </span>
          </div>
        </div>

        <Button className="w-full rounded-full">Conectar e finalizar</Button>
      </div>
    </main>
  );
}
