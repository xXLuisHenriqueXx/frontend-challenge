import { ArrowRight } from "react-iconly";

import { Button } from "@/components/ui/button";

import Monkey from "@/assets/monkey.png";

function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center gap-2.5 bg-linear-to-r from-primary/20 to-primary/10 p-4 rounded-[30px] overflow-hidden lg:gap-6 lg:p-12">
      <div className="size-62 bg-linear-to-b from-primary-light/43 to-primary/4 rounded-full absolute -top-7.75 -left-20 animate-pulse"></div>
      <div className="size-62 bg-linear-to-b from-primary-light/43 to-primary/4 rounded-full absolute animate-pulse"></div>

      <div className="relative flex w-full flex-row items-center gap-2 lg:justify-between lg:gap-12">
        <div className="flex flex-col gap-1.5 lg:max-w-xl lg:gap-4">
          <p className="text-xs font-medium lg:text-sm">Bem-vindo à Kurio</p>

          <h1 className="text-lg font-bold leading-7.25 lg:text-5xl lg:leading-tight">
            SEJA DONO <span className="lg:hidden">DA CULTURA DIGITAL</span>
            <span className="hidden lg:inline">DO FUTURO DA ARTE DIGITAL</span>
          </h1>

          <p className="text-xs text-secondary lg:text-base">
            <span className="lg:hidden">
              Descubra NFTs selecionados de criadores do mundo todo.
            </span>
            <span className="hidden lg:inline">
              Descubra NFTs selecionados de criadores emergentes e consagrados.
              Colecione arte digital rara, apoie artistas e tenha uma parte da
              cultura da internet.
            </span>
          </p>

          <Button className="lg:hidden" variant="link" size="link">
            EXPLORAR <ArrowRight />
          </Button>

          <Button className="hidden self-start bg-primary lg:inline-flex">
            EXPLORAR
          </Button>
        </div>

        <img
          className="w-34.5 h-36.5 rounded-[16px] object-cover lg:size-72 xl:size-80"
          src={Monkey}
          alt="Macaco de óculos escuros e jaqueta verde"
        />
      </div>

      <div className="relative flex flex-row gap-1.5 items-center">
        <div className="size-1.75 bg-primary rounded-full"></div>
        <div className="size-1.75 bg-primary rounded-full"></div>
        <div className="size-1.75 bg-primary rounded-full"></div>
      </div>
    </section>
  );
}

export { Hero };
