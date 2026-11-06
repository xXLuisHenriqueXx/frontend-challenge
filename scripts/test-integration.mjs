import assert from "node:assert/strict";
import { createServer } from "vite";
import { setupServer } from "msw/node";
import axios from "axios";
import { createServer as createHttpServer } from "node:http";

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
  server: { middlewareMode: true },
  appType: "custom",
});
const { initialize, reset } = await vite.ssrLoadModule(
  "/src/mocks/database.ts",
);
await initialize();
const { handlers } = await vite.ssrLoadModule("/src/mocks/handlers.ts");
const appServer = createHttpServer(vite.middlewares);
await new Promise((resolve) => appServer.listen(0, "127.0.0.1", resolve));
const appUrl = `http://127.0.0.1:${appServer.address().port}`;
const server = setupServer(...handlers);
server.listen({
  onUnhandledRequest(request, print) {
    if (new URL(request.url).pathname.startsWith("/api/")) print.error();
  },
});
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  validateStatus: () => true,
  timeout: 8000,
});
const post = (path, body = {}, config) => api.post(path, body, config);
const scenario = (name) => post("/mock/scenario", { scenario: name });
const login = (name) =>
  post("/auth/login", { email: `${name}@kurio.test`, password: "Kurio123!" });
let checks = 0;
const check = (condition, label) => {
  assert.ok(condition, label);
  checks++;
  console.log(`PASS ${label}`);
};
try {
  const source = await axios.get(`${appUrl}/src/api/hooks.tsx`);
  check(
    source.status === 200 && source.data.includes("useMutation"),
    "Vite source under src/api bypasses mocks",
  );
  const route = await axios.get(
    `${appUrl}/src/routes/index.tsx?tsr-split=component`,
  );
  check(route.status === 200, "lazy route module bypasses mocks");
  await reset();
  const catalog = await api.get("/nfts");
  check(
    catalog.data.total === 36 && catalog.data.pages === 4,
    "catalog pagination",
  );
  const filtered = await api.get("/nfts", {
    params: {
      q: "Emerald",
      collection: "Arte digital",
      network: "Ethereum",
      sort: "price-desc",
    },
  });
  check(filtered.data.items.length === 4, "combined filters sent over HTTP");
  check((await api.get("/nfts/unknown")).status === 404, "NFT missing");
  await post("/cart/items", { nftId: "1", edition: "1/50", quantity: 2 });
  check(
    (await post("/cart/items", { nftId: "1", edition: "1/50", quantity: 1000 }))
      .status === 409,
    "stock limit",
  );
  check((await login("ana")).status === 200, "login");
  check(
    (await api.get("/cart")).data.items[0].quantity === 2,
    "guest cart merged",
  );
  check(
    (await api.get("/auth/session")).data.user.email === "ana@kurio.test",
    "session recovery",
  );
  await api.put("/favorites/1");
  check((await api.get("/favorites")).data.includes("1"), "favorite persisted");
  await scenario("favorite-failure");
  check((await api.delete("/favorites/1")).status === 503, "favorite failure");
  await scenario("success");
  const quote = (await post("/quote", { coupon: "KURIO10" })).data;
  check(
    quote.subtotal === "2.38" &&
      quote.discount === "0.238" &&
      quote.total === "2.158",
    "exact decimal quote",
  );
  await scenario("coupon-expired");
  check(
    (await post("/quote", { coupon: "KURIO10" })).status === 422,
    "expired coupon",
  );
  await scenario("success");
  const wallets = (await api.get("/wallets")).data;
  const payload = { quoteId: quote.id, walletId: wallets[0].id };
  const key = { headers: { "Idempotency-Key": "test-attempt" } };
  const created = await post("/orders", payload, key);
  check(
    created.status === 201 && created.data.status === "pending",
    "pending order created",
  );
  check(
    (await post("/orders", payload, key)).data.id === created.data.id,
    "same key and payload same order",
  );
  check(
    (await post("/orders", { ...payload, walletId: "different" }, key))
      .status === 409,
    "same key different payload conflict",
  );
  await new Promise((r) => setTimeout(r, 1600));
  check(
    (await api.get(`/orders/${created.data.id}`)).data.status === "confirmed",
    "order settles via REST",
  );
  check(
    (await api.get("/cart")).data.items.length === 0,
    "only purchased quantities removed",
  );
  await post("/auth/logout");
  await login("bruno");
  check((await api.get("/favorites")).data.length === 0, "favorites isolated");
  check(
    (await api.get(`/orders/${created.data.id}`)).status === 403,
    "receipt permission denied",
  );
  check((await api.get("/cart")).data.items.length === 0, "cart isolated");
  check(
    (await api.patch("/profile", { displayName: "Bruno atualizado" }))
      .status === 200,
    "profile persisted",
  );
  check(
    (await api.patch("/profile", { displayName: "" })).status === 422,
    "profile validation",
  );
  check(
    (
      await post("/profile/password", {
        currentPassword: "wrong",
        password: "new-password",
      })
    ).status === 422,
    "password validation",
  );
  check(
    (
      await post("/wallets", {
        name: "Reserva",
        address: "0x" + "c".repeat(40),
        network: "Polygon",
      })
    ).status === 200,
    "wallet create",
  );
  await post("/mock/expire");
  check((await api.get("/profile")).status === 401, "expired session");
  await reset();
  check((await api.get("/nfts")).data.total === 36, "reset fixtures");
  check(
    ![...storage.values()].join("").includes("Kurio123!"),
    "password never persisted in plaintext",
  );
  for (const [name, status] of [
    ["empty", 200],
    ["http-400", 400],
    ["http-500", 503],
  ]) {
    await scenario(name);
    const response = await api.get("/nfts");
    check(
      response.status === status &&
        (name !== "empty" || response.data.total === 0),
      `scenario ${name}`,
    );
  }
  await scenario("offline");
  await assert.rejects(api.get("/nfts"));
  checks++;
  console.log("PASS network failure");
  await reset();
  await login("ana");
  await post("/cart/items", { nftId: "1", edition: "1/50", quantity: 1 });
  const fresh = (await post("/quote")).data;
  await scenario("price-changed");
  check(
    (
      await post(
        "/orders",
        { quoteId: fresh.id, walletId: "user-1-principal" },
        { headers: { "Idempotency-Key": "price-attempt" } },
      )
    ).status === 409,
    "price changed requires review",
  );
  await scenario("sold-out");
  const sold = (await post("/quote")).data;
  check(
    (
      await post(
        "/orders",
        { quoteId: sold.id, walletId: "user-1-principal" },
        { headers: { "Idempotency-Key": "sold-attempt" } },
      )
    ).status === 409,
    "sold out requires review",
  );
  await reset();
  await login("ana");
  await post("/cart/items", { nftId: "1", edition: "1/50", quantity: 1 });
  await scenario("payment-refused");
  const refusalQuote = (await post("/quote")).data;
  const refused = (
    await post(
      "/orders",
      { quoteId: refusalQuote.id, walletId: "user-1-principal" },
      { headers: { "Idempotency-Key": "refuse-attempt" } },
    )
  ).data;
  await new Promise((r) => setTimeout(r, 1600));
  check(
    (await api.get(`/orders/${refused.id}`)).data.status === "refused",
    "payment refused",
  );
  check((await api.get("/cart")).data.items.length === 1, "refusal keeps cart");
  await scenario("order-timeout");
  const timeoutQuote = (await post("/quote")).data;
  const timeoutBody = {
    quoteId: timeoutQuote.id,
    walletId: "user-1-principal",
  };
  const timeoutConfig = {
    timeout: 300,
    headers: { "Idempotency-Key": "timeout-attempt" },
  };
  await assert.rejects(post("/orders", timeoutBody, timeoutConfig));
  const recovered = await post("/orders", timeoutBody, timeoutConfig);
  check(
    recovered.status === 200 && Boolean(recovered.data.id),
    "timeout recovers original order",
  );
  await scenario("success");
  check(
    (
      await post("/auth/register", {
        email: "new@kurio.test",
        username: "newuser",
        password: "NewPassword1!",
      })
    ).status === 201,
    "register account",
  );
  check(
    (
      await post("/auth/register", {
        email: "new@kurio.test",
        username: "newuser",
        password: "NewPassword1!",
      })
    ).status === 409,
    "register conflict",
  );
  check(
    (
      await post("/auth/register", {
        email: "bad",
        username: "x",
        password: "short",
      })
    ).status === 422,
    "register validation",
  );
  await scenario("unauthorized");
  check((await api.get("/favorites")).status === 401, "unauthorized scenario");
  await reset();
  check((await api.get("/auth/session")).status === 401, "reset ends session");
  await scenario("out-of-order");
  const resultOrder = [];
  await Promise.all([
    api.get("/nfts?q=a").then(() => resultOrder.push("slow")),
    api.get("/nfts?q=aa").then(() => resultOrder.push("fast")),
  ]);
  check(resultOrder.join(",") === "fast,slow", "out of order responses");
  await scenario("slow");
  const controller = new AbortController();
  const pending = api.get("/nfts", { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, (error) => axios.isCancel(error));
  checks++;
  console.log("PASS Axios cancellation");
  await reset();
  await initialize();
  check(
    (await api.get("/nfts")).data.total === 36,
    "database reload persistence",
  );
  console.log(`${checks} integration checks passed through Axios and MSW`);
} finally {
  server.close();
  appServer.closeAllConnections();
  await new Promise((resolve) => appServer.close(resolve));
  await vite.close();
}
