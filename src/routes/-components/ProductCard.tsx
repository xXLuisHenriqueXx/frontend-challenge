import { Link } from "@tanstack/react-router";

import { Card } from "@/components/ui/card";

import Monkey from "@/assets/monkey.png";

function ProductCard() {
  return (
    <Link to="/product/$productId" params={{ productId: "1" }}>
      <Card className="hover:-translate-y-1 transition-transform duration-300">
        <img
          className="w-full aspect-square rounded-[16px]"
          src={Monkey}
          alt="Monkey"
        />
        <h2 className="text-[15px]">Emerald Ape #042</h2>
        <p className="font-bold text-font-accent leading-4">1.19 ETH</p>
      </Card>
    </Link>
  );
}

export default ProductCard;
