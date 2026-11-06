import { useQuery } from "@tanstack/react-query";
import { catalogOptions } from "@/api/client";
import { RemoteState } from "@/api/hooks";
import { Route } from "../index";
import ProductCard from "./ProductCard";

function Products() {
  const query = useQuery(catalogOptions(Route.useSearch()));
  return (
    <>
      <RemoteState query={query} />
      {query.data?.items.length === 0 && (
        <p role="status">Nenhum NFT encontrado.</p>
      )}
      <section className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:gap-x-6 lg:gap-y-8">
        {query.data?.items.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            price={product.price + " ETH"}
          />
        ))}
      </section>
    </>
  );
}
export { Products };
