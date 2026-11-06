import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { queryClient, sessionOptions } from "./client";
import type { Catalog, Nft, Order, ResourceEvent } from "./contracts";

let closeConnection = () => {};
export function stopRealtime() {
  closeConnection();
}
export function eventGate() {
  const seen = new Set<string>(),
    versions = new Map<string, number>(),
    terminal = new Set<string>();
  return (name: string, event: ResourceEvent) => {
    const key = name + ":" + event.resourceId;
    if (
      seen.has(event.eventId) ||
      event.version <= (versions.get(key) ?? -1) ||
      terminal.has(key)
    )
      return false;
    seen.add(event.eventId);
    if (seen.size > 1000) seen.delete(seen.values().next().value!);
    versions.set(key, event.version);
    if (name === "order.updated" && (event.data as Order).status !== "pending")
      terminal.add(key);
    return true;
  };
}
export function Realtime() {
  const session = useQuery({ ...sessionOptions, refetchInterval: 15000 }),
    userId = session.data?.user.id ?? "guest",
    token = session.data?.token ?? "";
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    setNotice("");
    const accept = eventGate();
    let dispose = () => {};
    const close = () => {
      active = false;
      dispose();
    };
    closeConnection = close;
    void import("socket.io-client")
      .then(({ io }) => {
        if (!active) return;
        const socket = io(
          import.meta.env.VITE_SOCKET_URL ?? "wss://kurio.mock",
          {
            transports: ["websocket"],
            forceNew: true,
            reconnectionDelay: 500,
            reconnectionDelayMax: 2000,
          },
        );
        const reconcile = () => {
          if (!active) return;
          void queryClient.invalidateQueries({ queryKey: ["nfts"] });
          void queryClient.invalidateQueries({ queryKey: ["nft"] });
          void queryClient.invalidateQueries({ queryKey: ["private", userId] });
        };
        const onEvent = (
          name: "nft.updated" | "order.updated",
          event: ResourceEvent,
        ) => {
          if (name === "nft.updated") {
            const detail = queryClient.getQueryData<Nft>([
              "nft",
              event.resourceId,
            ]);
            const versions = queryClient
              .getQueriesData<Catalog>({ queryKey: ["nfts"] })
              .flatMap(
                ([, data]) =>
                  data?.items
                    .filter((n) => n.id === event.resourceId)
                    .map((n) => n.version) ?? [],
              );
            if (event.version <= Math.max(detail?.version ?? -1, ...versions))
              return;
          }
          if (
            !active ||
            event.sessionToken !== token ||
            (event.userId && event.userId !== userId) ||
            !accept(name, event)
          )
            return;
          if (name === "nft.updated") {
            setNotice(
              "Preço ou disponibilidade atualizados. Revise os valores antes de confirmar.",
            );
            reconcile();
          } else {
            const order = event.data as Order;
            const key = ["private", userId, "order", order.id];
            const old = queryClient.getQueryData<Order>(key);
            if (
              old &&
              (old.version >= order.version || old.status !== "pending")
            )
              return;
            queryClient.setQueryData(key, order);
            void queryClient.invalidateQueries({
              queryKey: ["private", userId, "cart"],
            });
            void queryClient.invalidateQueries({
              queryKey: ["private", userId, "quote"],
            });
            setNotice(
              order.status === "confirmed"
                ? "Pedido confirmado."
                : order.status === "refused"
                  ? "Pagamento recusado. Seus itens foram preservados."
                  : "Pedido pendente.",
            );
          }
        };
        const nft = (e: ResourceEvent) => onEvent("nft.updated", e),
          order = (e: ResourceEvent) => onEvent("order.updated", e);
        socket.on("connect", () => socket.emit("subscribe", { userId, token }));
        socket.on("ready", reconcile);
        socket.on("nft.updated", nft);
        socket.on("order.updated", order);
        socket.on("disconnect", () => {
          if (active)
            setNotice(
              "Conexão interrompida. Reconectando e recuperando dados…",
            );
        });
        dispose = () => {
          socket.removeAllListeners();
          socket.disconnect();
        };
      })
      .catch(() => {
        if (active)
          setNotice("Falha ao conectar. Recarregue para tentar novamente.");
      });
    return close;
  }, [userId, token]);
  return notice ? (
    <p
      role="status"
      aria-live="polite"
      className="mx-auto max-w-300 px-6 py-2 text-sm text-font-accent"
    >
      {notice}
    </p>
  ) : null;
}
