import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "react-iconly";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard, type CartItem } from "./-components/ProductCard";
import { Footer } from "@/components/Footer";

import Monkey from "@/assets/monkey.png";

export const Route = createFileRoute("/cart/")({
  component: RouteComponent,
});

const INITIAL_ITEMS: CartItem[] = [
  {
    id: 1,
    name: "Emerald Ape #042",
    tokenId: "#0042",
    edition: "1/50",
    price: 1.19,
    quantity: 2,
  },
  {
    id: 2,
    name: "Violet Nomad #314",
    tokenId: "#0009",
    edition: "1/1",
    price: 1.39,
    quantity: 6,
  },
  {
    id: 3,
    name: "Ivory Baron #088",
    tokenId: "#0552",
    edition: "1/10",
    price: 1.79,
    quantity: 9,
  },
];

const RELATED = [
  { name: "Cosmic Bloom #118", price: "1.29", image: Monkey },
  { name: "Violet Nomad #314", price: "1.39", image: Monkey },
  { name: "Ivory Baron #088", price: "1.79", image: Monkey },
  { name: "Golden Beat #207", price: "0.99", image: Monkey },
  { name: "Golden Signal #160", price: "0.39", image: Monkey },
];

const NETWORK_FEE = 0.016;
const LAUNCH_DISCOUNT = 0;

function RouteComponent() {
  const [items, setItems] = useState(INITIAL_ITEMS);

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const total = subtotal - LAUNCH_DISCOUNT + NETWORK_FEE;

  function changeQuantity(id: number, delta: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i,
      ),
    );
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <main className="relative flex flex-col gap-3 w-full h-dvh pt-8 lg:h-auto lg:min-h-dvh lg:max-w-300 lg:mx-auto lg:gap-8 lg:px-8 lg:pt-10 lg:pb-16">
      <header className="flex flex-row items-center px-7 lg:hidden">
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

      <nav aria-label="breadcrumb" className="hidden lg:block text-sm">
        <Link to="/">Início</Link> / <span>Mercado</span> /{" "}
        <span className="font-bold">Carrinho</span>
      </nav>

      <div className="contents lg:grid lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-24">
        <section className="contents lg:flex lg:flex-col lg:gap-3">
          <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_7rem_9rem_7rem_2.5rem] lg:gap-4 lg:px-4 lg:pb-3 lg:border-b lg:border-border text-sm font-bold">
            <span>NFTs</span>
            <span>Preço</span>
            <span>Edições</span>
            <span>Total</span>
            <span className="sr-only">Remover</span>
          </div>

          <div className="flex flex-col flex-1 min-h-0 gap-5 w-full px-7 pb-96 overflow-y-auto lg:flex-none lg:gap-3 lg:p-0 lg:overflow-visible">
            {items.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onIncrease={() => changeQuantity(item.id, 1)}
                onDecrease={() => changeQuantity(item.id, -1)}
                onRemove={() => removeItem(item.id)}
              />
            ))}

            {items.length === 0 && (
              <p className="py-10 text-center text-secondary">
                Seu carrinho está vazio.
              </p>
            )}
          </div>
        </section>

        <aside className="fixed bottom-0 left-0 right-0 flex flex-col gap-8 p-6 pb-9 bg-surface-card rounded-t-[40px] lg:sticky lg:top-10 lg:gap-6 lg:p-0 lg:bg-transparent lg:rounded-none">
          <h2 className="hidden lg:block pb-3 border-b border-border text-lg font-bold">
            Resumo da carteira
          </h2>

          <div className="flex flex-col gap-3">
            <label
              className="hidden lg:block text-sm font-bold"
              htmlFor="promo"
            >
              Código promocional
            </label>

            <div className="group/input flex flex-row items-center gap-2 pl-4 bg-surface-card border border-border focus-within:border-primary transition-colors duration-300 rounded-full outline-none lg:pl-3 lg:gap-0 lg:rounded-md lg:overflow-hidden">
              <Input
                id="promo"
                className="flex-1 border-transparent focus-visible:border-transparent font-bold p-0"
                placeholder="Digite o código promocional ..."
              />

              <Button className="rounded-full lg:rounded-none">Aplicar</Button>
            </div>

            <div className="flex flex-row justify-between">
              <p className="text-[15px]">Subtotal</p>
              <span>{subtotal.toFixed(2)} ETH</span>
            </div>
            <div className="flex flex-row justify-between">
              <p className="text-[15px]">Desconto do lançamento</p>
              <span className="text-[15px]">
                ( - ) {LAUNCH_DISCOUNT.toFixed(2).padStart(5, "0")}
              </span>
            </div>
            <div className="flex flex-row justify-between">
              <p className="text-[15px]">Taxa de rede</p>

              <div className="flex flex-col items-end">
                <span>{NETWORK_FEE} ETH</span>
                <span className="text-xs text-font-accent">Taxa estimada</span>
              </div>
            </div>
            <div className="flex flex-row justify-between lg:pt-3">
              <p className="font-bold">Total</p>
              <span className="text-lg font-bold text-font-accent">
                {total.toFixed(3)} ETH
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              className="w-full rounded-full lg:rounded-md"
              disabled={items.length === 0}
            >
              Conectar e finalizar
            </Button>

            <Link
              to="/"
              className="hidden lg:block text-center text-sm text-font-accent hover:underline"
            >
              Continuar explorando
            </Link>
          </div>
        </aside>
      </div>

      <section className="mt-30 hidden lg:block">
        <h2 className="border-b border-border pb-3 text-lg font-bold text-font-accent">
          Colecionadores também viram
        </h2>

        <ul className="grid grid-cols-5 gap-6 pt-6">
          {RELATED.map((item) => (
            <li key={item.name} className="space-y-2">
              <div className="rounded-xl bg-surface-card p-3">
                <img
                  className="aspect-4/5 w-full rounded-lg object-cover"
                  src={item.image}
                  alt={item.name}
                />
              </div>
              <p className="text-sm">{item.name}</p>
              <p className="text-sm font-bold text-font-accent">
                {item.price} ETH
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-30 hidden lg:block">
        <Footer />
      </div>
    </main>
  );
}
