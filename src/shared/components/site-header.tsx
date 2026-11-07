import { useIdentity } from "@/features/auth/hooks/use-identity";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useCart } from "@/features/cart/hooks/use-cart";
import { parseSearch } from "@/features/catalog/api/search";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { cn } from "cn";
import { Buy, Login, Search } from "react-iconly";

import { Button, buttonVariants } from "@/components/ui/button";

const LINKS = [
  { id: "home", label: "Início" },
  { id: "market", label: "Mercado" },
  { id: "creators", label: "Criadores" },
  { id: "learn", label: "Aprenda" },
];

// Só aparece no desktop (lg+). No mobile quem navega é a BottomBar.
export function Header() {
  const navigate = useNavigate();
  const session = useIdentity();
  const cart = useCart();
  const logout = useLogout();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="site-header sticky top-0 z-40 hidden border-b border-primary/20 bg-background/90 backdrop-blur lg:block">
      <div className="mx-auto grid h-16 max-w-300 grid-cols-3 items-center px-8">
        <span className="text-sm font-bold tracking-widest">KURIO</span>

        <nav
          className="flex h-full items-center justify-center gap-8"
          aria-label="Navegação principal"
        >
          {LINKS.map((link) =>
            link.id === "creators" || link.id === "learn" ? (
              <span
                key={link.id}
                aria-disabled="true"
                className="flex h-full items-center text-sm"
                title="Fora do escopo"
              >
                {link.label}
              </span>
            ) : (
              <Link
                key={link.id}
                to="/"
                search={parseSearch({})}
                hash={link.id === "market" ? "catalog" : undefined}
                aria-current={
                  pathname === "/" && link.id === "home" ? "page" : undefined
                }
                className={cn(
                  "flex h-full items-center border-b-2 border-transparent text-sm hover:text-primary",
                  {
                    "border-primary text-primary":
                      pathname === "/" && link.id === "home",
                  },
                )}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center justify-end gap-3">
          {session.data && (
            <Link
              to="/profile"
              aria-label={`Meu perfil, ${session.data.user.displayName}`}
            >
              {session.data.user.displayName}
            </Link>
          )}
          <Button
            className="[&>svg]:size-5.5"
            variant="ghost"
            size="icon"
            aria-label="Buscar"
            onClick={async () => {
              await navigate({
                to: "/",
                search: {
                  q: "",
                  collection: "",
                  network: "",
                  category: "",
                  sort: "recent",
                  page: 1,
                  min: "0",
                  max: "100",
                },
              });
              document
                .querySelector<HTMLInputElement>(
                  'input[aria-label="Buscar NFTs"]',
                )
                ?.focus();
            }}
          >
            <Search />
          </Button>

          <Link
            to="/cart"
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "relative [&>svg]:size-5.5",
            })}
            aria-label={`Carrinho, ${cart.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0} itens`}
          >
            <Buy />
            <span
              aria-hidden="true"
              className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-foreground"
            >
              {cart.data?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0}
            </span>
          </Link>

          <Button
            onClick={() =>
              session.data
                ? logout.mutate()
                : void navigate({
                    to: "/login",
                    search: { returnTo: location.pathname + location.search },
                  })
            }
            className="bg-primary"
            size="sm"
          >
            <Login /> {session.data ? "Sair" : "Entrar"}
          </Button>
        </div>
      </div>
    </header>
  );
}
