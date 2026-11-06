import { Card } from "@/components/ui/card";

import Monkey from "@/assets/monkey.png";
import { Button } from "@/components/ui/button";

function ProductCard() {
  return (
    <Card className="flex flex-row items-center justify-between w-full min-h-25 pr-4 bg-surface-card rounded-xl">
      <div className="flex flex-row items-center gap-2">
        <img className="h-25 aspect-square" src={Monkey} alt="Monkey" />

        <div className="space-y-4">
          <div>
            <h2 className="text-[15px] font-bold">Emeral Ape #042</h2>
            <p className="text-sm text-secondary">Edição: 1/50</p>
          </div>

          <p className="text-lg font-bold text-font-accent">1.19 ETH</p>
        </div>
      </div>

      <div className="flex flex-row items-center gap-3">
        <Button className="size-6 rounded-full" variant="outline" size="icon">
          -
        </Button>
        <span className="text-lg font-medium tabular-nums">1</span>
        <Button className="size-6 rounded-full" variant="outline" size="icon">
          +
        </Button>
      </div>
    </Card>
  );
}

export { ProductCard };
