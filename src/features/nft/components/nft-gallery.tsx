import { Button, buttonVariants } from "@/components/ui/button";
import { NftImage } from "@/shared/components/nft-image";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, Heart } from "react-iconly";
import type { NftPageModel } from "../types/nft-page-model";

export function NftGallery({
  favorite,
  nft,
  imageIndex,
  setImageIndex,
}: Pick<NftPageModel, "favorite" | "nft" | "imageIndex" | "setImageIndex">) {
  return (
    <section className="flex flex-col gap-2 px-6 lg:flex-row lg:gap-4 lg:px-0">
      <header className="flex w-full flex-row items-center justify-between lg:hidden">
        <Link
          to="/"
          search={{
            q: "",
            collection: "",
            network: "",
            category: "",
            sort: "recent",
            page: 1,
            min: "0",
            max: "100",
          }}
          className={buttonVariants({
            className: "size-8.75 rounded-full",
            variant: "outline",
            size: "icon",
          })}
          aria-label="Voltar"
        >
          <ChevronLeft />
        </Link>

        <Button
          className="size-8.75 rounded-full"
          variant="outline"
          size="icon"
          aria-label={favorite.selected ? "Remover dos favoritos" : "Favoritar"}
          aria-pressed={favorite.selected}
          onClick={favorite.toggle}
          disabled={favorite.mutation.isPending}
        >
          <Heart filled={favorite.selected} />
        </Button>
      </header>

      <div className="hidden w-25 shrink-0 flex-col gap-3 lg:flex">
        {nft.images.map((src, index) => (
          <button
            key={index}
            type="button"
            className="gallery-thumb overflow-hidden rounded-xl border border-border focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Ver imagem ${index + 1}`}
            aria-pressed={imageIndex === index}
            onClick={() => setImageIndex(index)}
          >
            <NftImage
              sizes="100px"
              loading="lazy"
              className="aspect-square w-full object-cover"
              src={src}
              alt=""
            />
          </button>
        ))}
      </div>

      <div className="lg:flex-1 lg:rounded-3xl lg:bg-surface-card lg:p-5">
        <NftImage
          sizes="(min-width: 1024px) 480px, calc(100vw - 48px)"
          fetchPriority="high"
          className="w-full rounded-t-[24px] lg:rounded-3xl"
          src={nft.images[imageIndex]}
          alt={nft.name}
        />
      </div>
    </section>
  );
}
