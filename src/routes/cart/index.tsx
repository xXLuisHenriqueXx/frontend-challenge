import { buttonVariants, Button } from "@/components/ui/button";
import { SummarySkeleton } from "@/components/Skeleton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, createFileRoute, Link } from "@tanstack/react-router";
import {
  quoteOptions,
  message,
  catalogOptions,
  queryClient,
  send,
} from "@/api/client";
import { useCart, useIdentity, RemoteState } from "@/api/hooks";
import { parseSearch } from "@/api/contracts";
import type { Quote } from "@/api/contracts";
import { useState } from "react";

import { ChevronLeft } from "react-iconly";

import { Input } from "@/components/ui/input";
import { ProductCard } from "./-components/ProductCard";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/cart/")({
  component: RouteComponent,
});

function RouteComponent() {
  const related = useQuery(catalogOptions(parseSearch({})));
  const cart = useCart();
  const { id } = useIdentity();
  const navigate = useNavigate();
  const quote = useQuery(quoteOptions(id));
  const [coupon, setCoupon] = useState("");
  const [cartNotice, setCartNotice] = useState("");
  const couponMutation = useMutation({
    mutationFn: (value: string) => send<Quote>("/quote", { coupon: value }),
    onSuccess: (value) => {
      queryClient.setQueryData(quoteOptions(id).queryKey, value);
      setCartNotice(value.coupon ? "Cupom aplicado." : "Cupom removido.");
    },
  });
  const items = cart.data?.items ?? [];
  const RELATED = (related.data?.items ?? [])
    .slice(0, 5)
    .map((n) => ({ name: n.name, price: n.price, image: n.images[0] }));
  const subtotal = quote.data?.subtotal;
  const total = quote.data?.total;
  function changeQuantity(itemId: string, delta: number) {
    const item = items.find((i) => i.id === itemId)!;
    cart.mutation.mutate(
      { item, quantity: item.quantity + delta },
      { onSuccess: () => setCartNotice("Quantidade atualizada.") },
    );
  }
  function removeItem(itemId: string) {
    const index = items.findIndex((item) => item.id === itemId);
    cart.mutation.mutate(
      {
        item: items.find((i) => i.id === itemId),
        remove: true,
      },
      {
        onSuccess: () => {
          setCartNotice("NFT removido do carrinho.");
          requestAnimationFrame(() => {
            const lines = Array.from(
              document.querySelectorAll<HTMLElement>("[data-cart-line]"),
            );
            const next = lines.at(Math.min(index, lines.length - 1));
            const target =
              next?.querySelector<HTMLElement>("button:not(:disabled)") ??
              document.querySelector<HTMLElement>("main");
            target?.focus();
          });
        },
      },
    );
  }
  return (
    <>
      {" "}
      <main className="relative flex flex-col gap-3 w-full h-dvh pt-8 lg:h-auto lg:min-h-dvh lg:max-w-300 lg:mx-auto lg:gap-8 lg:px-8 lg:pt-10 lg:pb-16">
        <h1 className="sr-only">Carrinho de NFTs</h1>
        <p role="status" aria-live="polite" className="sr-only">
          {cartNotice}
        </p>
        <RemoteState query={cart} />
        <RemoteState query={quote} />
        {(cart.mutation.isError || couponMutation.isError) && (
          <p role="alert">
            {message(cart.mutation.error ?? couponMutation.error)}
          </p>
        )}
        <header className="flex flex-row items-center px-7 lg:hidden">
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
            aria-label="Voltar ao início"
          >
            <ChevronLeft />
          </Link>

          <p className="mx-auto text-xl font-bold">Carrinho de NFTs</p>
        </header>

        <nav aria-label="breadcrumb" className="hidden lg:block text-sm">
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
          >
            Início
          </Link>{" "}
          / <span>Mercado</span> / <span className="font-bold">Carrinho</span>
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

          <aside
            aria-label="Resumo do carrinho"
            aria-busy={quote.isPending}
            className="fixed bottom-0 left-0 right-0 flex flex-col gap-8 p-6 pb-9 bg-surface-card rounded-t-[40px] lg:sticky lg:top-10 lg:gap-6 lg:p-0 lg:bg-transparent lg:rounded-none"
          >
            {quote.isPending && <SummarySkeleton />}
            <h2 className="hidden lg:block pb-3 border-b border-border text-lg font-bold">
              Resumo da carteira
            </h2>

            <div className="flex flex-col gap-3">
              <label
                className="sr-only lg:not-sr-only lg:block text-sm font-bold"
                htmlFor="promo"
              >
                Código promocional
              </label>

              <div className="group/input flex flex-row items-center gap-2 pl-4 bg-surface-card border border-border focus-within:border-primary transition-colors duration-300 rounded-full outline-none lg:pl-3 lg:gap-0 lg:rounded-md lg:overflow-hidden">
                <Input
                  id="promo"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 border-transparent focus-visible:border-transparent font-bold p-0"
                  placeholder="Digite o código promocional ..."
                />

                <Button
                  disabled={couponMutation.isPending}
                  onClick={() => {
                    const removing =
                      !!quote.data?.coupon &&
                      (!coupon || coupon === quote.data.coupon);
                    couponMutation.mutate(removing ? "" : coupon);
                    if (removing) setCoupon("");
                  }}
                  className="rounded-full lg:rounded-none"
                >
                  {quote.data?.coupon &&
                  (!coupon || coupon === quote.data.coupon)
                    ? "Remover"
                    : "Aplicar"}
                </Button>
              </div>

              <div className="flex flex-row justify-between">
                <p className="text-[15px]">Subtotal</p>
                <span>{subtotal} ETH</span>
              </div>
              <div className="flex flex-row justify-between">
                <p className="text-[15px]">Desconto do lançamento</p>
                <span className="text-[15px]">
                  ( - ) {quote.data?.discount}
                </span>
              </div>
              <div className="flex flex-row justify-between">
                <p className="text-[15px]">Taxa de rede</p>

                <div className="flex flex-col items-end">
                  <span>{quote.data?.fee} ETH</span>
                  <span className="text-xs text-font-accent">
                    Taxa estimada
                  </span>
                </div>
              </div>
              <div className="flex flex-row justify-between lg:pt-3">
                <p className="font-bold">Total</p>
                <span className="text-lg font-bold text-font-accent">
                  {total} ETH
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                className="w-full rounded-full lg:rounded-md"
                disabled={
                  items.length === 0 ||
                  cart.mutation.isPending ||
                  quote.isError ||
                  quote.isFetching ||
                  items.some((i) => i.quantity > i.stock)
                }
                onClick={() => void navigate({ to: "/payment" })}
              >
                Conectar e finalizar
              </Button>

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
      </main>
      <div className="mx-auto mt-30 hidden w-full max-w-300 px-8 pb-16 lg:block">
        <Footer />
      </div>
    </>
  );
}
