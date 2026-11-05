import { Card } from "@/components/ui/card";

import Monkey from "@/assets/monkey.png";
import { Button } from "@/components/ui/button";

function ProductCard() {
  return (
    <Card className="flex flex-row gap-2 items-center w-full min-h-25 bg-surface-card rounded-xl">
      <img className="h-full aspect-square" src={Monkey} alt="Monkey" />

      <div className="space-y-4">
        <div>
          <h2 className="text-[15px] font-bold">Emeral Ape #042</h2>
          <p className="text-sm text-secondary">Edição: 1/50</p>
        </div>

        <p className="text-lg font-bold text-font-accent">1.19 ETH</p>
      </div>

      <div className="space-x-3">
        <Button
          className="border-border bg-surface-raised hover:bg-surface-dark rounded-full [&_svg]:size-5"
          variant="outline"
          size="icon-xs"
        >
          -
        </Button>
        <span className="text-lg font-medium tabular-nums">1</span>
        <Button
          className="border-border bg-surface-raised hover:bg-surface-dark rounded-full [&_svg]:size-5"
          variant="outline"
          size="icon-xs"
        >
          +
        </Button>
      </div>
    </Card>
  );
}

export { ProductCard };
