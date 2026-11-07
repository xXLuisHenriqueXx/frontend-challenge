import { Badge } from "@/components/ui/badge";
import { EthPrice } from "@/shared/components/eth-price";
import { Star } from "react-iconly";
import type { NftPageModel } from "../types/nft-page-model";

export function NftDescription({ nft }: Pick<NftPageModel, "nft">) {
  return (
    <section className="flex h-full w-full flex-col gap-3 rounded-t-[31px] bg-surface-card p-6 pt-8 pb-18 lg:contents">
      <div className="flex flex-row items-start justify-between gap-4 lg:order-1 lg:border-b lg:border-border lg:pb-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold lg:text-3xl">{nft.name}</h1>
          <p className="hidden text-2xl font-bold text-font-accent lg:block">
            <EthPrice value={nft.price} />
          </p>
        </div>

        <Badge
          className="shrink-0 border-primary [&_svg]:text-amber"
          variant="outline"
        >
          <Star filled /> {nft.rating}{" "}
          <span className="font-normal text-secondary">
            <span className="lg:hidden">({nft.reviews})</span>
            <span className="hidden lg:inline">· {nft.reviews} avaliações</span>
          </span>
        </Badge>
      </div>

      <div className="space-y-3 lg:order-2">
        <h2 className="hidden text-[15px] font-bold lg:block">
          Sobre este NFT:
        </h2>
        <p className="text-sm text-secondary">{nft.description}</p>
      </div>

      <div className="space-y-2 lg:order-3">
        <h2 className="text-[15px] font-bold">Edição:</h2>

        <div className="flex flex-row flex-wrap gap-3">
          {nft.editions.map((edition) => {
            const active = edition === nft.activeEdition;
            return (
              <Badge
                key={edition}
                className={
                  active
                    ? "border-font-accent text-font-accent"
                    : "text-secondary"
                }
                variant="outline"
              >
                {edition}
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:order-5">
        <p className="text-[15px] text-secondary">ID do token: {nft.tokenId}</p>
        <p className="text-[15px] text-secondary">Coleção: {nft.collection}</p>
        <p className="text-[15px] text-secondary">
          Atributos: {nft.attributes}
        </p>
      </div>

      <div className="hidden items-center gap-3 text-sm lg:order-6 lg:flex">
        <span className="font-bold">Compartilhar este NFT:</span>
        <a
          className="text-secondary hover:text-font-accent"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(location.href)}`}
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        <a
          className="text-secondary hover:text-font-accent"
          href={`mailto:?subject=${encodeURIComponent(nft.name)}&body=${encodeURIComponent(location.href)}`}
          rel="noopener noreferrer"
        >
          E-mail
        </a>
        <a
          className="text-secondary hover:text-font-accent"
          href={`https://x.com/intent/post?url=${encodeURIComponent(location.href)}`}
          rel="noopener noreferrer"
        >
          X
        </a>
      </div>
    </section>
  );
}
