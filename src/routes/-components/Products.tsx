import ProductCard from "./ProductCard";

const PRODUCTS = [
  { id: "1", name: "Emerald Ape #042", price: "1.19 ETH" },
  { id: "2", name: "Sage Nomad #009", price: "1.69 ETH" },
  {
    id: "3",
    name: "Neon Vessel #552",
    price: "1.99 ETH",
    oldPrice: "2.29 ETH",
  },
  { id: "4", name: "Cosmic Bloom #118", price: "1.29 ETH" },
  { id: "5", name: "Violet Nomad #314", price: "1.39 ETH" },
  { id: "6", name: "Ivory Baron #088", price: "1.79 ETH" },
  { id: "7", name: "Golden Beat #207", price: "0.99 ETH" },
  { id: "8", name: "Golden Pulse #133", price: "0.79 ETH" },
  { id: "9", name: "Golden Signal #160", price: "0.39 ETH" },
];

function Products() {
  return (
    <section className="grid grid-cols-2 gap-x-4 gap-y-6 max-md:[&>:nth-child(9)]:hidden md:grid-cols-3 lg:gap-x-6 lg:gap-y-8">
      {PRODUCTS.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </section>
  );
}

export { Products };
