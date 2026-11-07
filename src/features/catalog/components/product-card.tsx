import { NftImage } from "@/shared/components/nft-image";
import { Link } from "@tanstack/react-router";

import { Card } from "@/components/ui/card";

import Monkey from "@/assets/monkey.webp";

interface Props {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  priority?: boolean;
  images?: string[];
}

function ProductCard({
  id,
  name,
  price,
  oldPrice,
  images,
  priority = false,
}: Props) {
  return (
    <Link to="/product/$productId" params={{ productId: id }}>
      <Card className="catalog-card hover:-translate-y-1 transition-transform duration-300">
        <div className="nft-artwork-frame">
          <NftImage
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            className="w-full aspect-square rounded-[16px] object-cover"
            src={images?.[0] ?? Monkey}
            alt={name}
          />
        </div>
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
