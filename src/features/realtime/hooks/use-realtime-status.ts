import { sessionOptions } from "@/features/auth/api/queries";
import type { Catalog } from "@/features/catalog/types/contracts";
import type { Nft } from "@/features/nft/types/contracts";
import type { Order } from "@/features/orders/types/contracts";
import type { ResourceEvent } from "@/features/realtime/types/contracts";
import { queryClient } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { eventGate } from "../api/event-gate";

let closeConnection = () => {};
export function stopRealtime() {
  closeConnection();
}
export function useRealtimeStatus() {
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
          void queryClient.invalidateQueries({ queryKey: queryKeys.catalogs });
          void queryClient.invalidateQueries({ queryKey: queryKeys.nfts });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.user(userId),
          });
        };
        const onEvent = (
          name: "nft.updated" | "order.updated",
          event: ResourceEvent,
        ) => {
          if (name === "nft.updated") {
            const detail = queryClient.getQueryData<Nft>(
              queryKeys.nft(event.resourceId),
            );
            const versions = queryClient
              .getQueriesData<Catalog>({ queryKey: queryKeys.catalogs })
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
            const key = queryKeys.order(userId, order.id);
            const old = queryClient.getQueryData<Order>(key);
            if (
              old &&
              (old.version >= order.version || old.status !== "pending")
            )
              return;
            queryClient.setQueryData(key, order);
            void queryClient.invalidateQueries({
              queryKey: queryKeys.cart(userId),
            });
            void queryClient.invalidateQueries({
              queryKey: queryKeys.quote(userId),
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
  return notice;
}
