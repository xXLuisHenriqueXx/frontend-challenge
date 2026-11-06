import { ws } from "msw";
import { toSocketIo } from "@mswjs/socket.io-binding";
import { db } from "./database";
import { subscribe } from "./events";
import { completeOrders } from "./handlers";

const channel = ws.link("wss://kurio.mock");
export const socketHandlers = [
  channel.addEventListener("connection", (connection) => {
    const io = toSocketIo(connection);
    let userId = "guest",
      token = "",
      authenticated = false;
    io.client.on(
      "subscribe",
      (_event, credentials: { userId: string; token?: string }) => {
        userId = credentials.userId;
        token = credentials.token ?? "";
        authenticated =
          userId === "guest" ||
          (!!db.session &&
            db.session.user.id === userId &&
            db.session.token === token &&
            db.session.expiresAt > Date.now());
        if (!authenticated) {
          connection.client.close(1008, "Invalid session");
          return;
        }
        io.client.emit("ready");
      },
    );
    const unsubscribe = subscribe((name, event) => {
      if (!authenticated) return;
      if (
        userId !== "guest" &&
        (db.session?.user.id !== userId ||
          db.session.token !== token ||
          db.session.expiresAt <= Date.now())
      ) {
        connection.client.close(1008, "Expired session");
        return;
      }
      if (event.userId && event.userId !== userId) return;
      io.client.emit(name, { ...event, sessionToken: token });
      if (db.scenario === "duplicate-events")
        io.client.emit(name, { ...event, sessionToken: token });
      if (db.scenario === "old-events")
        io.client.emit(name, {
          ...event,
          eventId: event.eventId + "-old",
          version: Math.max(0, event.version - 1),
          data:
            name === "nft.updated"
              ? { ...event.data, price: "0.01", stock: 999 }
              : { ...event.data, status: "pending" },
          sessionToken: token,
        });
    });
    const timer = setInterval(() => {
      if (
        authenticated &&
        userId !== "guest" &&
        (db.session?.user.id !== userId ||
          db.session.token !== token ||
          db.session.expiresAt <= Date.now())
      ) {
        connection.client.close(1008, "Expired session");
        return;
      }
      completeOrders();
      if (db.scenario === "socket-offline")
        connection.client.close(1011, "Simulated interruption");
    }, 250);
    const heartbeat = setInterval(() => connection.client.send("2"), 10000);
    connection.client.addEventListener("close", () => {
      clearInterval(timer);
      clearInterval(heartbeat);
      unsubscribe();
    });
  }),
];
