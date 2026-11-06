import { Input } from "./ui/input";
import { Button } from "./ui/button";

import Facebook from "@/assets/icons/facebook.svg";
import Instagram from "@/assets/icons/instagram.svg";
import Twitter from "@/assets/icons/twitter.svg";
import Linkedin from "@/assets/icons/linkedin.svg";
import Youtube from "@/assets/icons/youtube.svg";
import { Link } from "@tanstack/react-router";

const FEATURES = [
  {
    letter: "W",
    title: "Segurança da carteira",
    text: "Proteja sua carteira e colecione arte digital verificada com confiança.",
  },
  {
    letter: "C",
    title: "Criadores em destaque",
    text: "Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.",
  },
  {
    letter: "D",
    title: "Alertas de lançamentos",
    text: "Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.",
  },
];

const LINK_GROUPS = [
  {
    title: "Meu perfil",
    links: [
      "Meu perfil",
      "Minha coleção",
      "Atividade",
      "Estúdio do criador",
      "Lista de interesse",
    ],
  },
  {
    title: "Central de ajuda",
    links: [
      "Central de ajuda",
      "Como comprar NFTs",
      "Carteira e segurança",
      "Política do mercado",
      "Denunciar item",
    ],
  },
  {
    title: "Coleções",
    links: ["Arte digital", "Fotografia", "Música", "Arte 3D", "Utilidade"],
  },
];

const SOCIALS = [
  { label: "Facebook", image: Facebook },
  { label: "Instagram", image: Instagram },
  { label: "Twitter", image: Twitter },
  { label: "LinkedIn", image: Linkedin },
  { label: "YouTube", image: Youtube },
];

export function Footer() {
  return (
    <>
      <footer className="bg-surface-card">
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:gap-0 lg:px-8">
          {FEATURES.map(({ letter, title, text }) => (
            <div
              key={title}
              className="flex flex-col gap-3 border-l-0 lg:border-l lg:border-primary lg:px-4 lg:first:border-l-0"
            >
              <div
                aria-hidden
                className="flex items-center justify-center size-16 rounded-full bg-primary text-2xl font-bold text-ink"
              >
                {letter}
              </div>
              <h3 className="text-[17px] font-bold">{title}</h3>
              <p className="text-sm text-secondary">{text}</p>
            </div>
          ))}

          <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1 lg:border-l lg:border-primary lg:pl-4">
            <h3 className="text-lg font-bold">
              Antecipe-se ao próximo lançamento
            </h3>

            <form
              className="flex h-10 rounded-sm overflow-hidden bg-surface-dark"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                className="h-10 min-w-0 flex-1 border-0"
                type="email"
                placeholder="digite seu e-mail..."
                required
              />
              <Button className="h-10 px-2 rounded-none" type="submit">
                Enviar
              </Button>
            </form>
            <p className="text-[13px] text-secondary">
              Receba lançamentos selecionados, histórias de criadores e
              novidades do mercado.
            </p>
          </div>
        </section>

        <section className="bg-surface-dark">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 py-6 text-sm sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:gap-12 lg:items-center">
            <strong className="font-bold tracking-wider">KURIO</strong>
            <p>Feito para colecionadores, criadores e cultura</p>
            <p>contato@email.com</p>
            <p>+55 11 4002 8922</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-8 px-4 py-8 sm:px-8 lg:grid-cols-4">
          {LINK_GROUPS.map(({ title, links }) => (
            <nav key={title} aria-label={title}>
              <h4 className="mb-2 text-lg font-bold">{title}</h4>
              <ul className="flex flex-col gap-1 text-sm">
                {links.map((label) => (
                  <li key={label}>
                    <Link to="/">
                      <Button
                        className="font-normal text-foreground"
                        variant="link"
                        size="link"
                      >
                        {label}
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 flex flex-col gap-6 lg:col-span-1">
            <div>
              <h4 className="mb-3 text-lg font-bold">Redes sociais</h4>
              <ul className="flex gap-2">
                {SOCIALS.map(({ label, image }) => (
                  <li key={label}>
                    <Link to="/">
                      <Button
                        className="size-8 border-primary bg-transparent"
                        variant="outline"
                        size="icon"
                      >
                        <img className="size-4" src={image} alt={label} />
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-lg font-bold">Carteiras compatíveis</h4>
              <div className="w-fit px-3 py-1.75 rounded-md border border-border-soft bg-surface-dark text-[10px] font-bold text-primary">
                <p>METAMASK • WALLETCONNECT • COINBASE</p>
              </div>
            </div>
          </div>
        </section>
      </footer>

      <div className="-mt-10 text-center text-xs text-footer-muted">
        © 2026 Kurio. Propriedade digital para todos.
      </div>
    </>
  );
}
