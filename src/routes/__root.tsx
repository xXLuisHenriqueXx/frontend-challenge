import { Realtime } from "@/features/realtime/components/realtime-status";
import { RouteAccessibility } from "@/shared/components/route-accessibility";
import { Outlet, createRootRoute } from "@tanstack/react-router";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import "../styles.css";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => (
    <main className="p-8">
      <h1>Página não encontrada</h1>
      <a href="/">Voltar ao início</a>
    </main>
  ),
});

function RootComponent() {
  return (
    <>
      <RouteAccessibility />
      <Realtime />
      <Outlet />
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  );
}
