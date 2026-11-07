import { EthPrice } from "@/shared/components/eth-price";
import { NftImage } from "@/shared/components/nft-image";
import { RemoteState } from "@/shared/components/remote-state";
import { Footer } from "@/shared/components/site-footer";
import { Header } from "@/shared/components/site-header";
import { DetailSkeleton } from "@/shared/components/skeleton";
import { message } from "@/shared/lib/errors";
import { multiply } from "@/shared/lib/money";
import { Link } from "@tanstack/react-router";
import type { useNftPage } from "../hooks/use-nft-page";
import { NftDescription } from "./nft-description";
import { NftDetailsTabs } from "./nft-details-tabs";
import { NftGallery } from "./nft-gallery";
import { NftPurchaseControls } from "./nft-purchase-controls";

export function NftPageView({
  related,
  query,
  cart,
  favorite,
  quantity,
  setQuantity,
  imageIndex,
  setImageIndex,
  tab,
  setTab,
  nft,
}: ReturnType<typeof useNftPage>) {
  if (query.isPending)
    return (
      <>
        <Header />
        <DetailSkeleton />
      </>
    );
  if (!nft)
    return (
      <main className="mx-auto max-w-300 p-8">
        <h1>NFT indisponivel</h1>
        <RemoteState query={query} />
      </main>
    );
  const relatedNfts = (related.data?.items ?? [])
    .filter((n) => n.id !== nft.id)
    .slice(0, 5)
    .map((n) => ({ name: n.name, price: n.price, image: n.images[0] }));
  const total = multiply(nft.price, quantity);
  const add = () =>
    cart.mutation.mutate({
      nftId: nft.id,
      edition: nft.activeEdition,
      quantity,
    });
  return (
    <>
      <Header />
      <main className="detail-page w-full min-h-dvh pt-6 lg:mx-auto lg:max-w-300 lg:px-6 lg:pt-8 lg:pb-16">
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
          <NftGallery
            favorite={favorite}
            nft={nft}
            imageIndex={imageIndex}
            setImageIndex={setImageIndex}
          />

          <div className="flex flex-col lg:gap-5">
            <NftDescription nft={nft} />

            <NftPurchaseControls
              quantity={quantity}
              setQuantity={setQuantity}
              nft={nft}
              total={total}
              cart={cart}
              add={add}
              favorite={favorite}
            />
          </div>
        </div>

        <NftDetailsTabs tab={tab} setTab={setTab} nft={nft} />

        <section className="mt-16 hidden lg:block">
          <h2 className="border-b border-border pb-3 text-lg font-bold text-font-accent">
            Mais desta coleção
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
