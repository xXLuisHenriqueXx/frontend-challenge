import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Buy, ChevronLeft, Heart, Star } from "react-iconly";

import { Button } from "@/components/ui/button";

import Monkey from "@/assets/monkey.png";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/product/$productId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { productId } = useParams({ strict: false });
  console.log(productId);

  return (
    <main className="w-full min-h-dvh pt-6">
      <section className="flex flex-col gap-2 px-6">
        <header className="flex flex-row items-center justify-between w-full">
          <Link to="/">
            <Button
              className="size-8.75 rounded-full"
              variant="outline"
              size="icon"
            >
              <ChevronLeft />
            </Button>
          </Link>

          <Button
            className="size-8.75 rounded-full"
            variant="outline"
            size="icon"
          >
            <Heart />
          </Button>
        </header>

        <img className="w-full rounded-t-[24px]" src={Monkey} alt="Monkey" />
      </section>

      <section className="flex flex-col gap-3 w-full h-full pt-8 pb-18 p-6 rounded-t-[31px] bg-surface-card">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-xl font-bold">Emeral Ape #042</h1>

          <Badge
            className="border-primary [&_svg]:text-amber"
            variant="outline"
          >
            <Star filled /> 4.8{" "}
            <span className="text-secondary font-normal">{"(1.2k)"}</span>
          </Badge>
        </div>

        <p className="text-sm text-secondary">
          Um colecionável digital 1/50 finalizado à mão da coleção Kurio
          Editions, verificado na Ethereum.
        </p>

        <div className="space-y-2">
          <h2 className="text-[15px] font-bold">Edição:</h2>

          <div className="flex flex-row gap-3">
            <Badge className="text-secondary" variant="outline">
              1/10
            </Badge>
            <Badge className="text-secondary" variant="outline">
              1/25
            </Badge>
            <Badge
              className="border-font-accent text-font-accent"
              variant="outline"
            >
              1/50
            </Badge>
            <Badge className="text-secondary" variant="outline">
              ABERTO
            </Badge>
          </div>
        </div>

        <p className="text-[15px] text-secondary">ID do token: #0042</p>
        <p className="text-[15px] text-secondary">Coleção: Kurio Apes</p>
        <p className="text-[15px] text-secondary">
          Atributos: Óculos, Esmeralda, Raro
        </p>
      </section>

      <section className="flex flex-col gap-5 w-full h-full pt-5 pb-9 p-6 -mt-10 rounded-t-[40px] bg-surface-card drop-shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-3">
            <span className="text-[15px] font-medium text-secondary">Qtd.</span>
            <Button className="size-6 rounded-full" size="icon">
              -
            </Button>
            <span className="text-lg font-medium tabular-nums">1</span>
            <Button className="size-6 rounded-full" size="icon">
              +
            </Button>
          </div>

          <p className="text-xl font-bold text-font-accent">0.05 ETH</p>
        </div>

        <div className="flex flex-row items-center gap-3">
          <Button className="rounded-full">Comprar NFT</Button>
          <Button className="rounded-full" variant="outline" size="icon">
            <Buy filled />
          </Button>
        </div>
      </section>
    </main>
  );
}
