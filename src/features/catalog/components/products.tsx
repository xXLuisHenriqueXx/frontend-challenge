import ProductCard from "@/features/catalog/components/product-card";
import { useNfts } from "@/features/catalog/hooks/use-nfts";
import { RemoteState } from "@/shared/components/remote-state";
import { CatalogSkeleton } from "@/shared/components/skeleton";
import { getRouteApi } from "@tanstack/react-router";

const Route = getRouteApi("/");

function Products() {
  const query = useNfts(Route.useSearch());
  if (query.isPending) return <CatalogSkeleton />;
  return (
    <>
      <RemoteState query={query} />
      {query.data?.items.length === 0 && (
        <p role="status">Nenhum NFT encontrado.</p>
      )}
      <section
        id="catalog"
        tabIndex={-1}
        aria-label="Catálogo de NFTs"
        className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:gap-x-6 lg:gap-y-8"
      >
        {query.data?.items.map((product, index) => (
          <ProductCard
            key={product.id}
            {...product}
            priority={index < 2}
            price={product.price + " ETH"}
          />
        ))}
      </section>
    </>
  );
}
export { Products };
