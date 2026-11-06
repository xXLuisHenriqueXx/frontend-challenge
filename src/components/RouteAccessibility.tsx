import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

const titles: Record<string, string> = {
  "/": "Mercado de NFTs",
  "/login": "Entrar",
  "/register": "Criar perfil de colecionador",
  "/cart": "Carrinho de NFTs",
  "/payment": "Pagamento com carteira",
  "/payment/confirm": "Seu pedido",
  "/profile": "Perfil do colecionador",
  "/wallets": "Suas carteiras",
};
export function RouteAccessibility() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname.replace(/\/$/, "") || "/",
  });
  useEffect(() => {
    document.title = `${titles[pathname] ?? (pathname.startsWith("/product/") ? "Detalhes do NFT" : "Página não encontrada")} | Kurio`;
    let focused = false;
    let focusedTarget: HTMLElement | null = null;
    let lastMain: HTMLElement | null = null;
    const update = () => {
      const main = document.querySelector<HTMLElement>("main");
      if (!main) return;
      if (focusedTarget && !focusedTarget.isConnected) {
        focused = false;
        focusedTarget = null;
      }
      if (main !== lastMain) {
        focused = false;
        lastMain = main;
      }
      main.id = "main-content";
      main.tabIndex = -1;
      const heading = main.querySelector<HTMLElement>("h1");
      if (heading) {
        heading.tabIndex = -1;
        heading.id ||= "page-heading";
        main.setAttribute("aria-labelledby", heading.id);
        if (!focused) {
          focused = true;
          const target =
            heading.getBoundingClientRect().width > 1 ? heading : main;
          target.focus({ preventScroll: true });
          focusedTarget = target;
        }
        if (pathname.startsWith("/product/"))
          document.title = `${heading.textContent} | Kurio`;
      } else if (!focused && main.getAttribute("aria-busy") !== "true") {
        focused = true;
        main.focus({ preventScroll: true });
        focusedTarget = main;
      }
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.getElementById("app")!, {
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [pathname]);
  return (
    <a href="#main-content" className="skip-link">
      Pular para o conteúdo
    </a>
  );
}
