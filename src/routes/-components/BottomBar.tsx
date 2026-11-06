import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "cn";
import { Buy, Heart, Home, Scan, User } from "react-iconly";

import { Button } from "@/components/ui/button";

const BUTTONS_NAV = [
  { id: "home", icon: Home, label: "Início" },
  { id: "favorites", icon: Heart, label: "Favoritos" },
  null,
  { id: "cart", icon: Buy, label: "Carrinho" },
  { id: "profile", icon: User, label: "Perfil" },
] as const;

export function BottomBar() {
  const navigate = useNavigate();
  const [active, setActive] = useState("home");

  return (
    <nav
      className="fixed md:hidden bottom-0 left-0 right-0 z-50"
      aria-label="Navegação principal"
    >
      <div className="relative drop-shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex h-30">
          <div className="flex-1 rounded-tl-[48px] bg-surface-card" />

          <svg
            className="-mx-px h-full w-30 shrink-0 fill-surface-card"
            viewBox="0 0 120 120"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d="M0,0 C18,0 24,4 30,14 C36,26 46,32 60,32 C74,32 84,26 90,14 C96,4 102,0 120,0 L120,120 L0,120 Z" />
          </svg>

          <div className="flex-1 rounded-tr-[48px] bg-surface-card" />
        </div>

        <div className="absolute inset-0 grid grid-cols-5 items-center px-4">
          {BUTTONS_NAV.map((item) => {
            if (!item) return <div key="center" />;

            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <Button
                key={item.id}
                className={cn("mx-auto rounded-full [&>svg]:size-5.5", {
                  "text-primary": isActive,
                })}
                variant="ghost"
                size="icon"
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  setActive(item.id);
                  if (item.id === "profile") void navigate({ to: "/profile" });
                  if (item.id === "cart") void navigate({ to: "/cart" });
                }}
              >
                <Icon filled />
              </Button>
            );
          })}
        </div>
      </div>

      <Button
        className="absolute -top-9 left-1/2 z-10 -translate-x-1/2 rounded-full bg-linear-to-b from-primary/10 to-primary text-foreground"
        size="icon"
        aria-label="Abrir scanner"
        onClick={() => console.log("Scanner")}
      >
        <Scan size={26} />
      </Button>
    </nav>
  );
}
