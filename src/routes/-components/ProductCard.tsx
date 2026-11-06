import { NftImage } from "@/components/NftImage";
import { Link } from "@tanstack/react-router";

import { Card } from "@/components/ui/card";

import Monkey from "@/assets/monkey.webp";

interface Props {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  priority?: boolean;
}

function ProductCard({ id, name, price, oldPrice, priority = false }: Props) {
  return (
    <Link to="/product/$productId" params={{ productId: id }}>
      <Card className="hover:-translate-y-1 transition-transform duration-300">
        <NftImage
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className="w-full aspect-square rounded-[16px] object-cover"
          src={Monkey}
          alt={name}
        />
        <h2 className="text-[15px] lg:text-sm">{name}</h2>
        <p className="font-bold text-font-accent leading-4">
          {price}
          {oldPrice && (
            <span className="ml-2 text-xs font-normal text-secondary line-through">
              {oldPrice}
            </span>
          )}
        </p>
      </Card>
    </Link>
  );
}

export default ProductCard;
