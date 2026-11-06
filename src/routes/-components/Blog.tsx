import { BlogCard } from "./BlogCard";

import Monkey from "@/assets/monkey.webp";

const CARDS_DATA = [
  {
    title: "Como funciona a propriedade de NFTs",
    description: "Aprenda a colecionar, negociar e verificar ativos digitais.",
    image: Monkey,
    link: "/newer",
    publishedAt: "2026-09-12",
    durationInMinutes: 6,
  },
  {
    title: "10 artistas digitais para acompanhar",
    description: "Conheça criadores que moldam a cultura digital.",
    image: Monkey,
    link: "/newer",
    publishedAt: "2026-09-13",
    durationInMinutes: 2,
  },
  {
    title: "Raridade, atributos e procedência",
    description:
      "Entenda raridade, procedência, direitos autorais e utilidade.",
    image: Monkey,
    link: "/newer",
    publishedAt: "2026-09-15",
    durationInMinutes: 3,
  },
  {
    title: "Como proteger sua carteira",
    description: "Proteja sua carteira, seus ativos e sua identidade.",
    image: Monkey,
    link: "/newer",
    publishedAt: "2026-09-15",
    durationInMinutes: 2,
  },
  {
    title: "Como funciona a propriedade de NFTs",
    description: "Aprenda a colecionar, negociar e verificar ativos digitais.",
    image: Monkey,
    link: "/newer",
    publishedAt: "2026-09-18",
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

      <div className="flex flex-row gap-6 w-full overflow-x-auto lg:grid lg:grid-cols-4 lg:overflow-visible lg:[&>:nth-child(n+5)]:hidden">
        {CARDS_DATA.map((card, index) => (
          <BlogCard key={index} {...card} />
        ))}
      </div>
    </section>
  );
}

export { Blog };
