import ProductCard from "./ProductCard";

function Products() {
  const products = Array.from({ length: 10 }, (_, index) => index + 1);

  return (
    <section className=" grid grid-cols-2 gap-x-4 gap-y-6">
      {products.map((product) => (
        <ProductCard key={product} />
      ))}
    </section>
  );
}

export { Products };
