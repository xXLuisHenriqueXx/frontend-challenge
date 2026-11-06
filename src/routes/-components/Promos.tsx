import PromoCard from "./PromoCard";

import Monkey from "@/assets/monkey.webp";

const CARDS_DATA = [
  {
    title: "Lançamento gênesis de edição limitada",
    description:
      "Colecione edições escassas diretamente dos criadores antes da revelação pública.",
    image: Monkey,
    link: "/newer",
  },
  {
    title: "Arte digital selecionada e muito mais",
    description:
      "Explore novos artistas, coleções verificadas e obras digitais que marcam.",
    image: Monkey,
    link: "/hot",
  },
];

function Promos() {
  return (
    <section className="flex flex-row items-center gap-4 min-w-full overflow-x-auto lg:grid lg:grid-cols-2 lg:gap-6 lg:overflow-visible">
      {CARDS_DATA.map((card) => (
        <PromoCard key={card.link} {...card} />
      ))}
    </section>
  );
}

export { Promos };
