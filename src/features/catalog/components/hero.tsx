import { NftImage } from "@/shared/components/nft-image";
import { ArrowRight } from "react-iconly";

import { Button } from "@/components/ui/button";

import { artwork } from "@/assets/artwork";
import Monkey from "@/assets/monkey.webp";

function Hero() {
  return (
    <section className="catalog-hero relative flex flex-col items-center justify-center gap-2.5 bg-linear-to-r from-primary/20 to-primary/10 p-4 rounded-[30px] overflow-hidden lg:gap-6 lg:p-12">
      <div className="hero-decoration size-62 bg-linear-to-b from-primary-light/43 to-primary/4 rounded-full absolute -top-7.75 -left-20 animate-pulse"></div>
      <div className="hero-decoration size-62 bg-linear-to-b from-primary-light/43 to-primary/4 rounded-full absolute animate-pulse"></div>

      <div className="hero-content relative flex w-full flex-row items-center gap-2 lg:justify-between lg:gap-12">
        <div className="hero-copy flex flex-col gap-1.5 lg:max-w-xl lg:gap-4">
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

          <Button
            onClick={() => {
              const catalog = document.getElementById("catalog");
              catalog?.scrollIntoView();
              catalog?.focus();
            }}
            className="lg:hidden"
            variant="link"
            size="link"
          >
            EXPLORAR <ArrowRight />
          </Button>

          <Button
            onClick={() => {
              const catalog = document.getElementById("catalog");
              catalog?.scrollIntoView();
              catalog?.focus();
            }}
            className="hidden self-start bg-primary lg:inline-flex"
          >
            EXPLORAR
          </Button>
        </div>

        <div className="hero-artwork relative shrink-0">
          <NftImage
            sizes="(min-width: 1024px) 450px, 138px"
            fetchPriority="high"
            className="hero-art w-34.5 h-36.5 rounded-[16px] object-cover lg:size-72 xl:size-80"
            src={Monkey}
            alt="Macaco de óculos escuros e jaqueta verde"
          />
          <NftImage
            src={artwork.sage}
            sizes="60px"
            className="hero-mini absolute bottom-0 left-3 size-15 rounded-xl lg:hidden"
            alt=""
          />
        </div>
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
