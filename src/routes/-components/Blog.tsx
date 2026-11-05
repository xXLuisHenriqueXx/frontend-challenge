import { BlogCard } from "./BlogCard";

import Monkey from "@/assets/monkey.png";

const CARDS_DATA = [
  {
    title: "Como funciona a propriedade de NFTs",
    description: "Aprenda a colecionar, negociar e verificar ativos digitais.",
    image: Monkey,
    link: "/newer",
    publishedAt: "2023-01-01",
    durationInMinutes: 5,
  },
  {
    title: "Como funciona a propriedade de NFTs",
    description: "Aprenda a colecionar, negociar e verificar ativos digitais.",
    image: Monkey,
    link: "/newer",
    publishedAt: "2023-01-01",
    durationInMinutes: 5,
  },
  {
    title: "Como funciona a propriedade de NFTs",
    description: "Aprenda a colecionar, negociar e verificar ativos digitais.",
    image: Monkey,
    link: "/newer",
    publishedAt: "2023-01-01",
    durationInMinutes: 5,
  },
  {
    title: "Como funciona a propriedade de NFTs",
    description: "Aprenda a colecionar, negociar e verificar ativos digitais.",
    image: Monkey,
    link: "/newer",
    publishedAt: "2023-01-01",
    durationInMinutes: 5,
  },
  {
    title: "Como funciona a propriedade de NFTs",
    description: "Aprenda a colecionar, negociar e verificar ativos digitais.",
    image: Monkey,
    link: "/newer",
    publishedAt: "2023-01-01",
    durationInMinutes: 5,
  },
];

function Blog() {
  return (
    <section className="flex flex-col items-center gap-10">
      <header className="flex flex-col items-center gap-2">
        <h2 className="text-[28px] font-bold text-font-primary">
          Diário da Cunhagem
        </h2>
        <p className="text-sm text-secondary text-center">
          Histórias, guias e insights para colecionadores sobre o universo da
          propriedade digital.
        </p>
      </header>

      <div className="flex flex-row gap-6 w-full overflow-x-auto">
        {CARDS_DATA.map((card) => (
          <BlogCard {...card} />
        ))}
      </div>
    </section>
  );
}

export { Blog };
