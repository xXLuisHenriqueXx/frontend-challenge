import { publish } from "./events";
import { http, HttpResponse, delay } from "msw";
import { db, hash, publicUser, reset, save } from "./database";
import { decimal, parseSearch, units } from "../api/contracts";
import type { CartLine, OrderInput, Quote, Wallet } from "../api/contracts";

// Controls affect the mock server only; UI still uses its normal REST/socket clients.
let latency: number | undefined;
let settlementPaused = false;

class Fault extends Error {
  constructor(
    public status: number,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}
function fail(
  status: number,
  message: string,
  fields?: Record<string, string>,
): never {
  throw new Fault(status, message, fields);
}
function sessionUser(request: Request) {
  const token = request.headers.get("X-Session-Token");
  if (token && token !== db.session?.token) fail(401, "Sessão substituída");
  if (
    request.headers.get("X-Session-User") &&
    request.headers.get("X-Session-User") !== db.session?.user.id
  )
    fail(401, "Sessao substituida");
  if (
    db.scenario === "unauthorized" ||
    db.scenario === "expired" ||
    !db.session ||
    db.session.expiresAt <= Date.now()
  ) {
    db.session = null;
    save();
    fail(401, "Sua sessão expirou. Entre novamente.");
  }
  return db.session.user;
}

function lines(id: string): CartLine[] {
  return (db.carts[id] ?? []).map((line) => {
    const nft = db.nfts.find((n) => n.id === line.nftId)!;
    return { ...line, price: nft.price, stock: nft.stock };
  });
}
function quote(id: string, coupon: string): Quote {
  if (coupon && (db.scenario === "coupon-invalid" || coupon !== "KURIO10"))
    fail(422, "Cupom inválido", { coupon: "Código inválido" });
  if (coupon && db.scenario === "coupon-expired")
    fail(422, "Cupom expirado", { coupon: "Código expirado" });
  const items = lines(id);
  if (items.some((i) => i.quantity > i.stock))
    fail(409, "Edição esgotada ou quantidade indisponível");
  const subtotal = items.reduce(
    (sum, i) => sum + units(i.price) * BigInt(i.quantity),
    0n,
  );
  const discount = coupon ? subtotal / 10n : 0n;
  const fee = items.length ? units("0.016") : 0n;
  return {
    id: crypto.randomUUID(),
    items,
    subtotal: decimal(subtotal),
    discount: decimal(discount),
    fee: decimal(fee),
    total: decimal(subtotal - discount + fee),
    coupon,
    expiresAt: Date.now() + 60000,
  };
}
export function completeOrders() {
  if (settlementPaused || db.scenario === "pending-orders") return;
  for (const order of Object.values(db.orders)) {
    if (
      !order ||
      order.status !== "pending" ||
      Date.now() - order.createdAt < 1500
    )
      continue;
    order.status = !order.quote.items.every(
      (i) => (db.nfts.find((n) => n.id === i.nftId)?.stock ?? 0) >= i.quantity,
    )
      ? "refused"
      : (order.outcome ??
        (db.scenario === "payment-refused" ? "refused" : "confirmed"));
    order.version++;
    if (order.status === "confirmed") {
      for (const item of order.quote.items) {
        const nft = db.nfts.find((n) => n.id === item.nftId)!;
        nft.stock -= item.quantity;
        nft.version++;
        publish("nft.updated", {
          eventId: crypto.randomUUID(),
          resourceId: nft.id,
          version: nft.version,
          data: structuredClone(nft),
        });
      }
      db.carts[order.userId] = (db.carts[order.userId] ?? []).flatMap((i) => {
        const bought =
          order.quote.items.find((x) => x.id === i.id)?.quantity ?? 0;
        return i.quantity > bought
          ? [{ ...i, quantity: i.quantity - bought }]
          : [];
      });
    }
    publish("order.updated", {
      eventId: crypto.randomUUID(),
      resourceId: order.id,
      version: order.version,
      userId: order.userId,
      data: structuredClone(order),
    });
  }
  save();
}

export const handlers = [
  // Match /api at the origin root, never source modules such as /src/api/hooks.tsx.
  http.all(/^https?:\/\/[^/]+\/api\/.*$/, async ({ request }) => {
    const user = () => sessionUser(request);
    const owner = () => (db.session ? user().id : "guest");
    const url = new URL(request.url);
    const path = url.pathname.slice(4);
    const method = request.method;
    let body: Record<string, unknown> = {};
    if (method !== "GET" && method !== "DELETE") {
      const raw = await request.text();
      try {
        body = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      } catch {
        return HttpResponse.json(
          { code: "400", message: "JSON invalido" },
          { status: 400 },
        );
      }
    }
    try {
      if (path === "/mock/reset") {
        latency = undefined;
        settlementPaused = false;
        await reset(String(body.scenario ?? "success"));
        return HttpResponse.json({ ok: true });
      }
      if (path === "/mock/timing") {
        if (typeof body.latency === "number")
          latency = Math.max(0, body.latency);
        if (typeof body.settlementPaused === "boolean")
          settlementPaused = body.settlementPaused;
        return HttpResponse.json({ latency, settlementPaused });
      }
      if (path === "/mock/scenario") {
        db.scenario = String(body.scenario ?? "success");
        save();
        return HttpResponse.json({ scenario: db.scenario });
      }
      if (path === "/mock/expire") {
        if (db.session) db.session.expiresAt = 0;
        save();
        return HttpResponse.json({ ok: true });
      }
      if (path === "/mock/nft") {
        const nft = db.nfts.find((n) => n.id === String(body.id));
        if (!nft) fail(404, "NFT não encontrado");
        if (body.price !== undefined) {
          if (!/^\d+(\.\d{1,18})?$/.test(String(body.price)))
            fail(422, "Preço inválido");
          nft.price = String(body.price);
        }
        if (body.stock !== undefined) {
          if (!Number.isInteger(body.stock) || Number(body.stock) < 0)
            fail(422, "Estoque inválido");
          nft.stock = Number(body.stock);
        }
        nft.version++;
        save();
        publish("nft.updated", {
          eventId: crypto.randomUUID(),
          resourceId: nft.id,
          version: nft.version,
          data: structuredClone(nft),
        });
        return HttpResponse.json(nft);
      }
      await delay(
        latency ??
          (db.scenario === "slow"
            ? 1800
            : db.scenario === "out-of-order"
              ? (url.searchParams.get("q")?.length ?? 0) % 2
                ? 1500
                : 100
              : 120),
      );
      if (db.scenario === "offline") return HttpResponse.error();
      if (db.scenario === "http-500")
        fail(503, "Indisponibilidade transitória");
      if (db.scenario === "http-400") fail(400, "Solicitação inválida");
      if (path === "/auth/register" && method === "POST") {
        const email = String(body.email ?? "")
            .trim()
            .toLowerCase(),
          username = String(body.username ?? "").trim(),
          password = String(body.password ?? "");
        if (
          !/^\S+@\S+\.\S+$/.test(email) ||
          username.length < 3 ||
          password.length < 8
        )
          fail(422, "Revise os campos", {
            email: "E-mail válido",
            username: "Mínimo 3 caracteres",
            password: "Mínimo 8 caracteres",
          });
        if (
          db.scenario === "register-conflict" ||
          db.users.some((u) => u.email === email || u.username === username)
        )
          fail(409, "E-mail ou usuário já cadastrado");
        const salt = crypto.randomUUID();
        db.users.push({
          id: crypto.randomUUID(),
          email,
          username,
          displayName: username,
          avatar: "",
          salt,
          passwordHash: await hash(password, salt),
        });
        save();
        return HttpResponse.json({ ok: true }, { status: 201 });
      }
      if (path === "/auth/login" && method === "POST") {
        const account = db.users.find(
          (u) => u.email === String(body.email).toLowerCase(),
        );
        if (
          !account ||
          account.passwordHash !==
            (await hash(String(body.password), account.salt))
        )
          fail(401, "Credenciais inválidas");
        db.session = {
          token: crypto.randomUUID(),
          user: publicUser(account),
          expiresAt: Date.now() + 30 * 60000,
        };
        const cart = db.carts[account.id] ?? [];
        for (const guest of db.carts.guest ?? []) {
          const existing = cart.find((i) => i.id === guest.id);
          const stock = db.nfts.find((n) => n.id === guest.nftId)!.stock;
          if (existing)
            existing.quantity = Math.min(
              stock,
              existing.quantity + guest.quantity,
            );
          else
            cart.push({ ...guest, quantity: Math.min(stock, guest.quantity) });
        }
        db.carts[account.id] = cart.filter((i) => i.quantity > 0);
        db.carts.guest = [];
        save();
        return HttpResponse.json(db.session);
      }
      if (path === "/auth/session")
        return HttpResponse.json({
          user: user(),
          expiresAt: db.session!.expiresAt,
          token: db.session!.token,
        });
      if (path === "/auth/logout") {
        if (request.headers.has("X-Session-Token")) sessionUser(request);
        db.session = null;
        save();
        return HttpResponse.json({ ok: true });
      }
      if (path === "/nfts" && method === "GET") {
        const s = parseSearch(Object.fromEntries(url.searchParams));
        let items =
          db.scenario === "empty"
            ? []
            : db.nfts.filter(
                (n) =>
                  n.name.toLowerCase().includes(s.q.toLowerCase()) &&
                  (!s.collection || n.collection === s.collection) &&
                  (!s.network || n.network === s.network) &&
                  (!s.category || n.category === s.category) &&
                  units(n.price) >= units(s.min) &&
                  units(n.price) <= units(s.max),
              );
        if (s.sort !== "recent")
          items = [...items].sort(
            (a, b) =>
              (units(a.price) < units(b.price)
                ? -1
                : units(a.price) > units(b.price)
                  ? 1
                  : 0) * (s.sort === "price-desc" ? -1 : 1),
          );
        return HttpResponse.json({
          items: items.slice((s.page - 1) * 9, s.page * 9),
          total: items.length,
          pages: Math.ceil(items.length / 9),
        });
      }
      if (path.startsWith("/nfts/")) {
        const nft = db.nfts.find((n) => n.id === path.split("/")[2]);
        if (!nft) fail(404, "NFT não encontrado");
        return HttpResponse.json(nft);
      }
      if (path.startsWith("/favorites")) {
        const id = user().id;
        const nftId = path.split("/")[2];
        const favorites = db.favorites[id] ?? [];
        if (method !== "GET") {
          if (db.scenario === "favorite-failure")
            fail(503, "Não foi possível salvar favorito");
          if (!db.nfts.some((n) => n.id === nftId))
            fail(404, "NFT não encontrado");
          db.favorites[id] =
            method === "DELETE"
              ? favorites.filter((x) => x !== nftId)
              : [...new Set([...favorites, nftId])];
          save();
        }
        return HttpResponse.json(db.favorites[id] ?? []);
      }
      if (path === "/cart" && method === "GET")
        return HttpResponse.json({
          items: lines(owner()),
          coupon: db.coupons[owner()] ?? "",
        });
      if (path.startsWith("/cart/items")) {
        const id = owner();
        const cart = db.carts[id] ?? [];
        const lineId = decodeURIComponent(path.split("/")[3] ?? "");
        if (method === "DELETE")
          db.carts[id] = cart.filter((i) => i.id !== lineId);
        else {
          const nft = db.nfts.find((n) => n.id === String(body.nftId));
          if (!nft) fail(404, "NFT não encontrado");
          const quantity =
            Number(body.quantity) +
            (body.mode === "add"
              ? (cart.find(
                  (i) =>
                    i.nftId === nft.id && i.edition === String(body.edition),
                )?.quantity ?? 0)
              : 0);
          const edition = String(body.edition);
          if (
            typeof body.quantity !== "number" ||
            body.quantity < 1 ||
            !Number.isInteger(quantity) ||
            quantity < 1
          )
            fail(422, "Quantidade deve ser inteira e positiva");
          if (!nft.editions.includes(edition) || quantity > nft.stock)
            fail(409, "Edição ou quantidade indisponível");
          const key = `${nft.id}:${edition}`;
          const item = {
            id: key,
            nftId: nft.id,
            name: nft.name,
            tokenId: nft.tokenId,
            edition,
            price: nft.price,
            quantity,
            stock: nft.stock,
          };
          db.carts[id] = [...cart.filter((i) => i.id !== key), item];
        }
        save();
        return HttpResponse.json({
          items: lines(id),
          coupon: db.coupons[id] ?? "",
        });
      }
      if (path === "/quote") {
        const id = owner();
        const coupon = String(body.coupon ?? db.coupons[id] ?? "");
        const result = quote(id, coupon);
        db.coupons[id] = coupon;
        db.quotes[result.id] = { owner: id, quote: result };
        save();
        return HttpResponse.json(result);
      }
      if (path === "/wallet-connection") {
        const id = user().id;
        if (method === "DELETE") {
          for (const [key, connection] of Object.entries(db.connections))
            if (connection?.userId === id) delete db.connections[key];
          save();
          return HttpResponse.json({ ok: true });
        }
        if (db.scenario === "wallet-refused")
          fail(422, "Conexão recusada pelo colecionador");
        const wallet = (db.wallets[id] ?? []).find(
          (w) => w.id === body.walletId,
        );
        if (!wallet || wallet.network !== body.network)
          fail(422, "Selecione carteira e rede compatíveis");
        const connectionId = crypto.randomUUID();
        db.connections[connectionId] = {
          userId: id,
          walletId: wallet.id,
          token: db.session?.token,
          network: wallet.network,
        };
        save();
        return HttpResponse.json({ connectionId });
      }
      if (path === "/profile/password") {
        const account = db.users.find((u) => u.id === user().id)!;
        if (
          (await hash(String(body.currentPassword), account.salt)) !==
          account.passwordHash
        )
          fail(422, "Senha atual incorreta");
        if (typeof body.password !== "string" || body.password.length < 8)
          fail(422, "Mínimo 8 caracteres");
        account.passwordHash = await hash(String(body.password), account.salt);
        save();
        return HttpResponse.json({ ok: true });
      }
      if (path === "/profile") {
        const account = db.users.find((u) => u.id === user().id)!;
        if (method === "PATCH") {
          const updated = { ...account };
          if (String(body.displayName ?? "").trim().length < 2)
            fail(422, "Nome obrigatório", {
              displayName: "Mínimo 2 caracteres",
            });
          updated.displayName = String(body.displayName);
          if (body.ens !== undefined) updated.ens = String(body.ens);
          if (body.walletNickname !== undefined)
            updated.walletNickname = String(body.walletNickname);
          if (body.email !== undefined) {
            const email = String(body.email).trim().toLowerCase();
            if (!/^\S+@\S+\.\S+$/.test(email))
              fail(422, "E-mail inválido", {
                email: "Informe um e-mail válido",
              });
            if (db.users.some((u) => u.id !== account.id && u.email === email))
              fail(409, "E-mail já cadastrado");
            updated.email = email;
          }
          if (body.username !== undefined) {
            const username = String(body.username).trim();
            if (username.length < 3)
              fail(422, "Usuário inválido", {
                username: "Mínimo 3 caracteres",
              });
            if (
              db.users.some(
                (u) => u.id !== account.id && u.username === username,
              )
            )
              fail(409, "Usuário já cadastrado");
            updated.username = username;
          }
          if (body.avatar !== undefined) {
            if (String(body.avatar).length > 1400000)
              fail(422, "Avatar excede 1 MB");
            if (
              !/^data:image\/(png|jpeg|webp);base64,/.test(
                String(body.avatar),
              ) &&
              body.avatar !== ""
            )
              fail(422, "Avatar deve ser uma imagem local");
            updated.avatar = String(body.avatar);
          }
          Object.assign(account, updated);
          db.session!.user = publicUser(account);
          save();
        }
        return HttpResponse.json(publicUser(account));
      }
      if (path.startsWith("/wallets")) {
        const id = user().id;
        const wallets = db.wallets[id] ?? [];
        if (method === "POST" || method === "PATCH") {
          const wallet = body as unknown as Wallet;
          if (
            typeof wallet.name !== "string" ||
            wallet.name.trim().length < 2 ||
            !/^0x[a-fA-F0-9]{40}$/.test(wallet.address) ||
            !["Ethereum", "Polygon", "Solana"].includes(wallet.network)
          )
            fail(422, "Revise nome, endereço e rede");
          const walletId = path.split("/")[2];
          if (method === "POST" && wallets.length >= 2)
            fail(409, "Limite de duas carteiras");
          if (method === "PATCH" && !wallets.some((w) => w.id === walletId))
            fail(404, "Carteira não encontrada");
          db.wallets[id] = [
            ...wallets.filter((w) => w.id !== walletId),
            {
              role:
                wallet.role ??
                (method === "POST" && wallets.length ? "secondary" : "primary"),
              nickname: wallet.nickname,
              profileName: wallet.profileName,
              ens: wallet.ens,
              name: wallet.name,
              address: wallet.address,
              network: wallet.network,
              id: method === "POST" ? crypto.randomUUID() : walletId,
            },
          ];
          db.wallets[id].sort(
            (a, b) =>
              (a.role === "secondary" ? 1 : 0) -
              (b.role === "secondary" ? 1 : 0),
          );
          save();
        }
        return HttpResponse.json(db.wallets[id] ?? []);
      }
      if (path === "/orders" && method === "POST") {
        const id = user().id;
        const key = request.headers.get("Idempotency-Key");
        if (!key) fail(422, "Idempotency-Key obrigatória");
        const input = body as unknown as OrderInput;
        const canonical = JSON.stringify({
          quoteId: input.quoteId,
          walletId: input.walletId,
          collector: input.collector,
          connectionId: input.connectionId,
        });
        const previous = db.attempts[`${id}:${key}`];
        if (previous) {
          if (previous.body !== canonical)
            fail(409, "Chave reutilizada com conteúdo diferente");
          completeOrders();
          return HttpResponse.json(db.orders[previous.orderId]);
        }
        const stored = db.quotes[input.quoteId];
        if (!stored) fail(404, "Cotação não encontrada");
        if (stored.owner !== id) fail(403, "Cotação de outro usuário");
        if (db.scenario === "price-changed" || db.scenario === "sold-out") {
          const nft = db.nfts.find(
            (n) => n.id === stored.quote.items[0]?.nftId,
          );
          if (nft) {
            nft.price =
              db.scenario === "price-changed"
                ? decimal(units(nft.price) + units("0.1"))
                : nft.price;
            nft.stock = db.scenario === "sold-out" ? 0 : nft.stock;
            nft.version++;
            publish("nft.updated", {
              eventId: crypto.randomUUID(),
              resourceId: nft.id,
              version: nft.version,
              data: structuredClone(nft),
            });
          }
          db.scenario = "success";
          save();
        }
        const current = quote(id, stored.quote.coupon);
        if (input.collector) {
          const fields: Record<string, string> = {};
          for (const name of [
            "displayName",
            "username",
            "profileName",
            "email",
            "network",
            "walletAddress",
            "walletType",
            "referralCode",
            "ensName",
          ])
            if (!input.collector[name]?.trim())
              fields[name] = "Campo obrigatório";
          if (!/^\S+@\S+\.\S+$/.test(input.collector.email ?? ""))
            fields.email = "E-mail inválido";
          if (Object.keys(fields).length)
            fail(422, "Revise os dados do colecionador", fields);
          const connection = db.connections[input.connectionId ?? ""];
          if (
            !connection ||
            connection.userId !== id ||
            connection.walletId !== input.walletId ||
            connection.token !== db.session?.token ||
            connection.network !== input.collector.network
          )
            fail(422, "Conecte a carteira na rede selecionada");
        }
        if (!current.items.length) fail(422, "Carrinho vazio");
        if (
          stored.quote.expiresAt < Date.now() ||
          current.total !== stored.quote.total ||
          JSON.stringify(current.items) !== JSON.stringify(stored.quote.items)
        )
          fail(
            409,
            "Cotação alterada. Revise os valores e confirme novamente.",
          );
        for (const item of current.items) {
          const reserved = Object.values(db.orders)
            .filter((o) => o?.status === "pending")
            .reduce(
              (sum, o) =>
                sum +
                (o?.quote.items
                  .filter((i) => i.nftId === item.nftId)
                  .reduce((n, i) => n + i.quantity, 0) ?? 0),
              0,
            );
          if (item.quantity + reserved > item.stock)
            fail(409, "Estoque reservado por pedido pendente");
        }
        const wallet = (db.wallets[id] ?? []).find(
          (w) => w.id === input.walletId,
        );
        if (!wallet) fail(422, "Selecione uma carteira cadastrada");
        if (input.collector && input.collector.walletAddress !== wallet.address)
          fail(422, "Endereco diferente da carteira conectada", {
            walletAddress: "Revise a carteira selecionada",
          });
        const orderId = crypto.randomUUID();
        db.orders[orderId] = {
          id: orderId,
          userId: id,
          status: "pending",
          outcome: db.scenario === "payment-refused" ? "refused" : "confirmed",
          quote: structuredClone(stored.quote),
          wallet: structuredClone(wallet),
          transactionId: `simulated-${orderId}`,
          createdAt: Date.now(),
          version: 1,
        };
        db.attempts[`${id}:${key}`] = { body: canonical, orderId };
        save();
        if (db.scenario === "order-timeout") {
          await delay(6000);
          return HttpResponse.error();
        }
        return HttpResponse.json(db.orders[orderId], { status: 201 });
      }
      if (path.startsWith("/orders/")) {
        const id = user().id;
        completeOrders();
        const order = db.orders[path.split("/")[2]];
        if (!order) fail(404, "Pedido não encontrado");
        if (order.userId !== id) fail(403, "Pedido de outro usuário");
        return HttpResponse.json(order);
      }
      fail(404, "Recurso não encontrado");
    } catch (error) {
      if (error instanceof Fault)
        return HttpResponse.json(
          {
            code: String(error.status),
            message: error.message,
            fields: error.fields,
          },
          { status: error.status },
        );
      throw error;
    }
  }),
];
