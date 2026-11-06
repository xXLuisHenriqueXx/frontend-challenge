import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useIdentity, useCart } from "@/api/hooks";
import { clearPrivate, queryClient, send } from "@/api/client";
import { useState } from "react";
import { cn } from "cn";
import { Buy, Login, Search } from "react-iconly";

import { Button } from "@/components/ui/button";

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
  const logout = useMutation({
    mutationFn: async () => {
      await send("/auth/logout");
      await clearPrivate();
      await queryClient.invalidateQueries();
    },
  });
  const [active, setActive] = useState("home");

  return (
    <header className="sticky top-0 z-40 hidden border-b border-primary/20 bg-background/90 backdrop-blur lg:block">
      <div className="mx-auto grid h-16 max-w-300 grid-cols-3 items-center px-8">
        <span className="text-sm font-bold tracking-widest">KURIO</span>

        <nav
          className="flex h-full items-center justify-center gap-8"
          aria-label="Navegação principal"
        >
          {LINKS.map((link) => (
            <button
              key={link.id}
              className={cn(
                "flex h-full items-center border-b-2 border-transparent text-sm transition-colors hover:text-primary",
                { "border-primary text-primary": active === link.id },
              )}
              aria-current={active === link.id ? "page" : undefined}
              onClick={() => setActive(link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3">
          {session.data && (
            <button
              onClick={() => void navigate({ to: "/profile" })}
              aria-label="Meu perfil"
            >
              {session.data.user.displayName}
            </button>
          )}
          <Button
            className="[&>svg]:size-5.5"
            variant="ghost"
            size="icon"
            aria-label="Buscar"
          >
            <Search />
          </Button>

          <Button
            className="relative [&>svg]:size-5.5"
            variant="ghost"
            size="icon"
            aria-label="Carrinho"
            onClick={() => void navigate({ to: "/cart" })}
          >
            <Buy />
            <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-foreground">
              {cart.data?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0}
            </span>
          </Button>

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
