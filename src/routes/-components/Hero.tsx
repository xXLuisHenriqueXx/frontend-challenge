import { ArrowRight } from "react-iconly";

import { Button } from "@/components/ui/button";

import Monkey from "@/assets/monkey.png";

function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center gap-2.5 bg-linear-to-r from-primary/20 to-primary/10 p-4 rounded-[30px] overflow-hidden">
      <div className="size-62 bg-linear-to-b from-primary-light/43 to-primary/4 rounded-full absolute -top-7.75 -left-20 animate-pulse"></div>
      <div className="size-62 bg-linear-to-b from-primary-light/43 to-primary/4 rounded-full absolute animate-pulse"></div>

      <div className="flex flex-row items-center gap-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium">Bem-vindo à Kurio</p>
          <h1 className="text-lg font-bold leading-7.25">
            SEJA DONO DA CULTURA DIGITAL
          </h1>
          <p className="text-xs text-secondary">
            Descubra NFTs selecionados de criadores do mundo todo.
          </p>

          <Button variant="link" size="link">
            EXPLORAR <ArrowRight />
          </Button>
        </div>

        <img
          className="w-34.5 h-36.5 rounded-[16px]"
          src={Monkey}
          alt="Monkey"
        />
      </div>

      <div className="flex flex-row gap-1.5 items-center">
        <div className="size-1.75 bg-primary rounded-full"></div>
        <div className="size-1.75 bg-primary rounded-full"></div>
        <div className="size-1.75 bg-primary rounded-full"></div>
      </div>
    </section>
  );
}

export { Hero };
