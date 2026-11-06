import { DetailSkeleton } from "@/components/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { nftOptions, message, catalogOptions } from "@/api/client";
import { multiply, parseSearch } from "@/api/contracts";
import { useCart, useFavorites, RemoteState } from "@/api/hooks";
import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Buy, ChevronLeft, Heart, Star } from "react-iconly";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

import Monkey from "@/assets/monkey.png";

export const Route = createFileRoute("/product/$productId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { productId } = useParams({ strict: false });
  const related = useQuery(catalogOptions(parseSearch({})));
  const query = useQuery(nftOptions(productId ?? ""));
  const cart = useCart();
  const favorite = useFavorites(productId ?? "");

  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<"details" | "reviews">("details");

  const PRODUCT = query.data;
  if (query.isPending) return <DetailSkeleton />;
 if (!PRODUCT) return <RemoteState query={query} />;
  const RELATED = (related.data?.items ?? [])
    .filter((n) => n.id !== PRODUCT.id)
    .slice(0, 5)
    .map((n) => ({ name: n.name, price: n.price, image: n.images[0] }));
  const total = multiply(PRODUCT.price, quantity);
  const add = () =>
    cart.mutation.mutate({
      nftId: PRODUCT.id,
      edition: PRODUCT.activeEdition,
      quantity,
    });

  return (
    <main className="w-full min-h-dvh pt-6 lg:mx-auto lg:max-w-300 lg:px-6 lg:pt-8 lg:pb-16">
      <RemoteState query={query} />
      {cart.mutation.isError && (
        <p role="alert">{message(cart.mutation.error)}</p>
      )}
      {cart.mutation.isSuccess && (
        <p role="status">NFT adicionado ao carrinho.</p>
      )}
      {favorite.mutation.isError && (
        <p role="alert">{message(favorite.mutation.error)}</p>
      )}
      <nav
        aria-label="Breadcrumb"
        className="mb-4 hidden text-sm font-bold lg:block"
      >
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
        / <span>Mercado</span>
      </nav>

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
        <section className="flex flex-col gap-2 px-6 lg:flex-row lg:gap-4 lg:px-0">
          <header className="flex w-full flex-row items-center justify-between lg:hidden">
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
              <Button
                className="size-8.75 rounded-full"
                variant="outline"
                size="icon"
                aria-label="Voltar"
              >
                <ChevronLeft />
              </Button>
            </Link>

            <Button
              className="size-8.75 rounded-full"
              variant="outline"
              size="icon"
              aria-label="Favoritar"
              aria-pressed={favorite.selected}
              onClick={favorite.toggle}
              disabled={favorite.mutation.isPending}
            >
              <Heart />
            </Button>
          </header>

          <div className="hidden w-25 shrink-0 flex-col gap-3 lg:flex">
            {PRODUCT.images.map((src, index) => (
              <button
                key={index}
                type="button"
                className="overflow-hidden rounded-xl border border-border focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={`Ver imagem ${index + 1}`}
              >
                <img
                  className="aspect-square w-full object-cover"
                  src={src}
                  alt=""
                />
              </button>
            ))}
          </div>

          <div className="lg:flex-1 lg:rounded-3xl lg:bg-surface-card lg:p-5">
            <img
              className="w-full rounded-t-[24px] lg:rounded-3xl"
              src={Monkey}
              alt={PRODUCT.name}
            />
          </div>
        </section>

        <div className="flex flex-col lg:gap-5">
          <section className="flex h-full w-full flex-col gap-3 rounded-t-[31px] bg-surface-card p-6 pt-8 pb-18 lg:contents">
            <div className="flex flex-row items-start justify-between gap-4 lg:order-1 lg:border-b lg:border-border lg:pb-4">
              <div className="space-y-1">
                <h1 className="text-xl font-bold lg:text-3xl">
                  {PRODUCT.name}
                </h1>
                <p className="hidden text-2xl font-bold text-font-accent lg:block">
                  {PRODUCT.price} ETH
                </p>
              </div>

              <Badge
                className="shrink-0 border-primary [&_svg]:text-amber"
                variant="outline"
              >
                <Star filled /> {PRODUCT.rating}{" "}
                <span className="font-normal text-secondary">
                  <span className="lg:hidden">({PRODUCT.reviews})</span>
                  <span className="hidden lg:inline">
                    · {PRODUCT.reviews} avaliações
                  </span>
                </span>
              </Badge>
            </div>

            <div className="space-y-3 lg:order-2">
              <h2 className="hidden text-[15px] font-bold lg:block">
                Sobre este NFT:
              </h2>
              <p className="text-sm text-secondary">{PRODUCT.description}</p>
            </div>

            <div className="space-y-2 lg:order-3">
              <h2 className="text-[15px] font-bold">Edição:</h2>

              <div className="flex flex-row flex-wrap gap-3">
                {PRODUCT.editions.map((edition) => {
                  const active = edition === PRODUCT.activeEdition;
                  return (
                    <Badge
                      key={edition}
                      className={
                        active
                          ? "border-font-accent text-font-accent"
                          : "text-secondary"
                      }
                      variant="outline"
                    >
                      {edition}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:order-5">
              <p className="text-[15px] text-secondary">
                ID do token: {PRODUCT.tokenId}
              </p>
              <p className="text-[15px] text-secondary">
                Coleção: {PRODUCT.collection}
              </p>
              <p className="text-[15px] text-secondary">
                Atributos: {PRODUCT.attributes}
              </p>
            </div>

            <div className="hidden items-center gap-3 text-sm lg:order-6 lg:flex">
              <span className="font-bold">Compartilhar este NFT:</span>
              <a className="text-secondary hover:text-font-accent" href="#">
                LinkedIn
              </a>
              <a className="text-secondary hover:text-font-accent" href="#">
                E-mail
              </a>
              <a className="text-secondary hover:text-font-accent" href="#">
                X
              </a>
            </div>
          </section>

          <section className="-mt-10 flex h-full w-full flex-col gap-5 rounded-t-[40px] bg-surface-card p-6 pt-5 pb-9 drop-shadow-[0_-4px_20px_rgba(0,0,0,0.4)] lg:order-4 lg:mt-0 lg:flex-row lg:items-center lg:justify-between lg:rounded-none lg:bg-transparent lg:p-0 lg:drop-shadow-none">
            <div className="flex flex-row items-center justify-between lg:justify-start">
              <div className="flex flex-row items-center gap-3">
                <span className="text-[15px] font-medium text-secondary lg:hidden">
                  Qtd.
                </span>
                <Button
                  className="size-6 rounded-full lg:size-9"
                  size="icon"
                  aria-label="Diminuir quantidade"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  -
                </Button>
                <span className="text-lg font-medium tabular-nums">
                  {quantity}
                </span>
                <Button
                  className="size-6 rounded-full lg:size-9"
                  size="icon"
                  aria-label="Aumentar quantidade"
                  disabled={quantity >= PRODUCT.stock}
                  onClick={() =>
                    setQuantity((q) => Math.min(PRODUCT.stock, q + 1))
                  }
                >
                  +
                </Button>
              </div>

              <p className="text-xl font-bold text-font-accent lg:hidden">
                {total} ETH
              </p>
            </div>

            <div className="flex flex-row items-center gap-3">
              <Button
                disabled={cart.mutation.isPending || PRODUCT.stock === 0}
                onClick={add}
                className="flex-1 rounded-full lg:flex-none lg:px-10"
              >
                <span className="lg:hidden">Comprar NFT</span>
                <span className="hidden lg:inline">Comprar</span>
              </Button>

              <Button
                className="rounded-full lg:hidden"
                variant="outline"
                size="icon"
                aria-label="Adicionar ao carrinho"
                onClick={add}
                disabled={cart.mutation.isPending || PRODUCT.stock === 0}
              >
                <Buy filled />
              </Button>

              <Button
                aria-pressed={favorite.selected}
                onClick={favorite.toggle}
                disabled={favorite.mutation.isPending}
                className="hidden rounded-full lg:inline-flex"
                variant="outline"
              >
                <Heart /> Favoritar
              </Button>
            </div>
          </section>
        </div>
      </div>

      <section className="mt-16 hidden lg:block">
        <div role="tablist" className="flex gap-8 border-b border-border">
          <TabButton
            active={tab === "details"}
            onClick={() => setTab("details")}
          >
            Detalhes do NFT
          </TabButton>
          <TabButton
            active={tab === "reviews"}
            onClick={() => setTab("reviews")}
          >
            Avaliações de colecionadores ({PRODUCT.reviews})
          </TabButton>
        </div>

        <div role="tabpanel" className="space-y-5 pt-5 text-sm text-secondary">
          {tab === "details" ? (
            <>
              <p>
                {PRODUCT.name} é uma obra digital 1/50 finalizada à mão da
                coleção Kurio Editions. Cada atributo fica armazenado nos
                metadados do token e verificado na Ethereum.
              </p>
              <p>
                A propriedade inclui a arte em alta resolução, lançamentos
                exclusivos para colecionadores e um registro permanente de
                procedência registrada na rede.
              </p>

              <div>
                <h3 className="font-bold text-foreground">Rede:</h3>
                <p>
                  Cunhado na Ethereum com procedência imutável e metadados
                  armazenados no IPFS.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-foreground">Contrato:</h3>
                <p>
                  Direitos autorais do criador: 5% nas vendas secundárias, pagos
                  automaticamente pelos mercados compatíveis.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-foreground">
                  Direitos autorais:
                </h3>
                <p>0x7A42...19E8 · Contrato inteligente ERC-721 verificado.</p>
              </div>
            </>
          ) : (
            <p>Nenhuma avaliação para exibir ainda.</p>
          )}
        </div>
      </section>

      <section className="mt-16 hidden lg:block">
        <h2 className="border-b border-border pb-3 text-lg font-bold text-font-accent">
          Mais desta coleção
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

      <div className="hidden lg:block mt-30">
        <Footer />
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        active
          ? "-mb-px border-b-2 border-font-accent pb-3 font-bold text-font-accent"
          : "pb-3 text-secondary hover:text-foreground"
      }
    >
      {children}
    </button>
  );
}
