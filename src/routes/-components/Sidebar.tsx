import { NftImage } from "@/components/NftImage";
import { Route } from "../index";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"; // npx shadcn@latest add slider

import Monkey from "@/assets/monkey.webp";

const COLLECTIONS = [
  { name: "Arte digital", count: 33 },
  { name: "Fotografia", count: 12 },
  { name: "Música", count: 65 },
  { name: "Arte 3D", count: 39 },
  { name: "Colecionáveis", count: 23 },
  { name: "Generativa", count: 17 },
  { name: "Jogos", count: 19 },
  { name: "Assinaturas", count: 13 },
  { name: "Utilidade", count: 18 },
];

const NETWORKS = [
  { name: "Ethereum", count: 119 },
  { name: "Polygon", count: 78 },
  { name: "Solana", count: 86 },
];

const MIN_PRICE = 0.02;
const MAX_PRICE = 12.3;

const formatEth = (value: number) => value.toFixed(2).replace(".", ",");

interface Props {
  mobile?: boolean;
  onApplyPrice?: (range: [number, number]) => void;
}

// Só aparece no desktop (lg+).
function Sidebar({ onApplyPrice, mobile = false }: Props) {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const collection = search.collection;
  const network = search.network;
  const setCollection = (value: string | null) =>
    void navigate({ search: { ...search, collection: value ?? "", page: 1 } });
  const setNetwork = (value: string | null) =>
    void navigate({ search: { ...search, network: value ?? "", page: 1 } });
  const [range, setRange] = useState<number[]>([
    Number(search.min),
    Number(search.max),
  ]);

  return (
    <aside
      aria-label="Filtros do catálogo"
      className={
        mobile ? "flex flex-col gap-6" : "hidden flex-col gap-6 lg:flex"
      }
    >
      <div className="flex flex-col gap-8 rounded-lg bg-surface-card p-4">
        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-font-primary">Coleções</h2>

          <ul>
            {COLLECTIONS.map((item) => (
              <li key={item.name}>
                <button
                  className={`flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-xs transition-colors hover:text-primary ${
                    collection === item.name ? "text-primary" : "text-secondary"
                  }`}
                  aria-pressed={collection === item.name}
                  onClick={() =>
                    setCollection(collection === item.name ? null : item.name)
                  }
                >
                  {item.name}
                  <span className="text-font-primary">({item.count})</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-bold text-font-primary">Faixa de preço</h2>

          <Slider
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={0.01}
            value={range}
            onValueChange={(value) =>
              setRange(typeof value === "number" ? [value, value] : [...value])
            }
            aria-label="Faixa de preço em ETH"
          />

          <p className="text-xs text-secondary">
            Preço: {formatEth(range[0])} - {formatEth(range[1])} ETH
          </p>

          <Button
            className="self-start bg-primary"
            size="sm"
            onClick={() => {
              onApplyPrice?.([range[0], range[1]]);
              void navigate({
                search: {
                  ...search,
                  min: String(range[0]),
                  max: String(range[1]),
                  page: 1,
                },
              });
            }}
          >
            Aplicar
          </Button>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-font-primary">Rede</h2>

          <ul>
            {NETWORKS.map((item) => (
              <li key={item.name}>
                <button
                  className={`flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-xs transition-colors hover:text-primary ${
                    network === item.name ? "text-primary" : "text-secondary"
                  }`}
                  aria-pressed={network === item.name}
                  onClick={() =>
                    setNetwork(network === item.name ? null : item.name)
                  }
                >
                  {item.name}
                  <span className="text-font-primary">({item.count})</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="overflow-hidden rounded-lg bg-surface-card">
        <header className="flex flex-col gap-1 p-4">
          <h2 className="text-lg font-bold text-primary">NFT EM DESTAQUE</h2>
          <p className="text-sm font-semibold text-font-primary">
            OFERTA LIMITADA
          </p>
        </header>

        <NftImage
          loading="lazy"
          sizes="260px"
          className="aspect-4/5 w-full rounded-[16px] object-cover"
          src={Monkey}
          alt="NFT em destaque"
        />
      </section>
    </aside>
  );
}

export { Sidebar };
