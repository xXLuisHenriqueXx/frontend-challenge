import assert from "node:assert/strict";
import { createServer } from "vite";
import { setupServer } from "msw/node";
import axios from "axios";
const storage = new Map();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (k) => storage.get(k) ?? null,
    setItem: (k, v) => storage.set(k, v),
  },
  configurable: true,
});
globalThis.location = new URL("http://localhost:3000");
const vite = await createServer({
  configFile: false,
  resolve: { tsconfigPaths: true },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: "custom",
});
const { initialize, reset } = await vite.ssrLoadModule(
  "/src/mocks/database.ts",
);
await initialize();
const { handlers } = await vite.ssrLoadModule("/src/mocks/handlers.ts");
const { socketHandlers } = await vite.ssrLoadModule("/src/mocks/socket.ts");

const server = setupServer(...handlers, ...socketHandlers);
server.listen({ onUnhandledRequest: "bypass" });
// Import after interception: exercise the browser WebSocket transport used by the app.
const { eventGate } = await vite.ssrLoadModule("/src/api/realtime.tsx");
const { io } = await import("socket.io-client");
const { WebSocket } = await import("engine.io-client");
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  validateStatus: () => true,
});
const post = (path, body = {}) => api.post(path, body);
const once = (socket, event) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, listener);
      reject(new Error(`Timed out: ${event}`));
    }, 8000);
    const listener = (data) => {
      clearTimeout(timer);
      socket.off(event, listener);
      resolve(data);
    };
    socket.on(event, listener);
  });
const sockets = [];
async function connect(session) {
  const socket = io("wss://kurio.mock", {
    transports: [WebSocket],
    forceNew: true,
    reconnectionDelay: 100,
    reconnectionDelayMax: 200,
  });
  socket.on("connect_error", (error) =>
    console.log("SOCKET ERROR", error.message),
  );
  sockets.push(socket);
  socket.on("connect", () => {
    socket.emit("subscribe", { userId: session.user.id, token: session.token });
  });
  await once(socket, "ready");
  return socket;
}
let checks = 0;
const check = (test, label) => {
  assert.ok(test, label);
  checks++;
  console.log("PASS " + label);
};
try {
  await reset();
  const session = (
    await post("/auth/login", {
      email: "ana@kurio.test",
      password: "Kurio123!",
    })
  ).data;
  const socket = await connect(session);
  check(
    socket.connected,
    "real socket.io-client handshake through MSW binding",
  );
  const updated = once(socket, "nft.updated");
  await post("/mock/nft", { id: "1", price: "1.25", stock: 8 });
  const event = await updated;
  check(
    event.data.price === "1.25" && event.version === 2 && event.eventId,
    "nft.updated carries stable identity and version",
  );
  check(
    (await api.get("/nfts/1")).data.price === event.data.price,
    "REST and Socket.IO share state",
  );
  const accept = eventGate();
  check(
    accept("nft.updated", event) && !accept("nft.updated", event),
    "duplicate rejected",
  );
  check(
    !accept("nft.updated", { ...event, eventId: "old", version: 1 }),
    "old event rejected",
  );
  for (const scenario of ["duplicate-events", "old-events"]) {
    const events = [];
    const listener = (e) => events.push(e);
    socket.on("nft.updated", listener);
    await post("/mock/scenario", { scenario });
    await post("/mock/nft", { id: "1", stock: 8 });
    await new Promise((resolve) => setTimeout(resolve, 100));
    socket.off("nft.updated", listener);
    const gate = eventGate();
    check(
      events.length === 2 &&
        events.filter((e) => gate("nft.updated", e)).length === 1,
      scenario + " filtered after real Socket.IO transport",
    );
  }
  await post("/mock/scenario", { scenario: "success" });
  await post("/cart/items", { nftId: "1", edition: "1/50", quantity: 1 });
  const quote = (await post("/quote")).data;
  const stale = once(socket, "nft.updated");
  await post("/mock/nft", { id: "1", price: "1.30" });
  await stale;
  const oldOrder = await post("/orders", {
    quoteId: quote.id,
    walletId: "user-1-principal",
  });
  check(oldOrder.status === 422, "order requires idempotency key");
  const staleOrder = await api.post(
    "/orders",
    { quoteId: quote.id, walletId: "user-1-principal" },
    { headers: { "Idempotency-Key": "stale" } },
  );
  check(staleOrder.status === 409, "socket change blocks stale checkout quote");
  const fresh = (await post("/quote")).data;
  const terminal = once(socket, "order.updated");
  const order = (
    await api.post(
      "/orders",
      { quoteId: fresh.id, walletId: "user-1-principal" },
      { headers: { "Idempotency-Key": "purchase" } },
    )
  ).data;
  const confirmed = await terminal;
  check(
    confirmed.data.id === order.id && confirmed.data.status === "confirmed",
    "order.updated confirms pending order without polling",
  );
  check(
    accept("order.updated", confirmed) &&
      !accept("order.updated", {
        ...confirmed,
        eventId: "late-pending",
        version: 99,
        data: { ...confirmed.data, status: "pending" },
      }),
    "terminal order never regresses",
  );
  check(
    (await api.get("/cart")).data.items.length === 0,
    "confirmation removes purchased quantity once",
  );
  const receipt = (await api.get("/orders/" + order.id)).data;
  await post("/mock/nft", { id: "1", price: "9" });
  check(
    (await api.get("/orders/" + order.id)).data.quote.total ===
      receipt.quote.total,
    "receipt snapshot immutable",
  );
  await post("/cart/items", { nftId: "1", edition: "1/50", quantity: 1 });
  const nextQuote = (await post("/quote")).data;
  const nextBody = { quoteId: nextQuote.id, walletId: "user-1-principal" };
  const nextHeaders = { headers: { "Idempotency-Key": "reconnect-purchase" } };
  const pending = (await api.post("/orders", nextBody, nextHeaders)).data;
  const disconnected = once(socket, "disconnect");
  await post("/mock/scenario", { scenario: "socket-offline" });
  await disconnected;
  await post("/mock/scenario", { scenario: "success" });
  await once(socket, "ready");
  await new Promise((resolve) => setTimeout(resolve, 1600));
  check(
    (await api.get("/orders/" + pending.id)).data.status === "confirmed",
    "pending order recovered by REST after reconnect",
  );
  check(
    (await api.post("/orders", nextBody, nextHeaders)).data.id === pending.id,
    "reconnect never creates a second purchase",
  );
  const privateEvents = [];
  socket.on("order.updated", (e) => privateEvents.push(e));
  await post("/auth/logout");
  const bruno = (
    await post("/auth/login", {
      email: "bruno@kurio.test",
      password: "Kurio123!",
    })
  ).data;
  const brunoSocket = await connect(bruno);
  const brunoEvent = once(brunoSocket, "order.updated");
  await post("/cart/items", { nftId: "2", edition: "1/50", quantity: 1 });
  const brunoQuote = (await post("/quote")).data;
  await api.post(
    "/orders",
    { quoteId: brunoQuote.id, walletId: "user-2-principal" },
    { headers: { "Idempotency-Key": "bruno-purchase" } },
  );
  check(
    (await brunoEvent).userId === bruno.user.id,
    "new session receives its own order event",
  );
  await post("/mock/nft", { id: "1", stock: 2 });
  await new Promise((resolve) => setTimeout(resolve, 100));
  check(
    privateEvents.every((e) => e.userId === session.user.id),
    "previous session cannot receive another user order",
  );
  console.log(
    `${checks} realtime checks passed through MSW and socket.io-client`,
  );
} finally {
  for (const socket of sockets) {
    socket.removeAllListeners();
    socket.disconnect();
  }
  server.close();
  await vite.close();
}
