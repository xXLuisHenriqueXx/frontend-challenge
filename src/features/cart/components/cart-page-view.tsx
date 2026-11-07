import { buttonVariants } from "@/components/ui/button";
import { CartLineCard } from "@/features/cart/components/cart-line";
import { EthPrice } from "@/shared/components/eth-price";
import { NftImage } from "@/shared/components/nft-image";
import { RemoteState } from "@/shared/components/remote-state";
import { Footer } from "@/shared/components/site-footer";
import { Header } from "@/shared/components/site-header";
import { message } from "@/shared/lib/errors";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "react-iconly";
import type { useCartPage } from "../hooks/use-cart-page";
import { CartSummary } from "./cart-summary";

export function CartPageView({
  cart,
  navigate,
  quote,
  coupon,
  setCoupon,
  cartNotice,
  couponMutation,
  items,
  relatedNfts,
  subtotal,
  total,
  changeQuantity,
  removeItem,
}: ReturnType<typeof useCartPage>) {
  return (
    <>
      <Header />
      <main className="cart-page relative flex flex-col gap-3 w-full h-dvh pt-8 lg:h-auto lg:min-h-dvh lg:max-w-300 lg:mx-auto lg:gap-8 lg:px-8 lg:pt-10 lg:pb-16">
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
                <CartLineCard
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

          <CartSummary
            quote={quote}
            coupon={coupon}
            setCoupon={setCoupon}
            couponMutation={couponMutation}
            subtotal={subtotal}
            total={total}
            items={items}
            cart={cart}
            navigate={navigate}
          />
        </div>

        <section className="mt-30 hidden lg:block">
          <h2 className="border-b border-border pb-3 text-lg font-bold text-font-accent">
            Colecionadores também viram
          </h2>

          <ul className="grid grid-cols-5 gap-6 pt-6">
            {relatedNfts.map((item) => (
              <li key={item.name} className="space-y-2">
                <div className="rounded-xl bg-surface-card p-3">
                  <NftImage
                    className="aspect-4/5 w-full rounded-lg object-cover"
                    src={item.image}
                    alt={item.name}
                  />
                </div>
                <p className="text-sm">{item.name}</p>
                <p className="text-sm font-bold text-font-accent">
                  <EthPrice value={item.price} />
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
