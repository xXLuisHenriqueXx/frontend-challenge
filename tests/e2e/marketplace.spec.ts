import { test, expect } from "@playwright/test";
import {
  add,
  api,
  checkout,
  login,
  receipt,
  reset,
  review,
  scenario,
} from "./helpers";

test.beforeEach(async ({ page }) => reset(page));

test("search, combined filters, ordering, pagination and browser history", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Próxima página" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(
    page.getByRole("button", { name: "2", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page
      .getByRole("region", { name: "Catálogo de NFTs" })
      .getByRole("link")
      .first(),
  ).toHaveAttribute("href", "/product/10");
  await page
    .getByRole("combobox", { name: /Ordenar por/ })
    .selectOption("price-asc");
  await expect(
    page
      .getByRole("region", { name: "Catálogo de NFTs" })
      .getByRole("link")
      .first(),
  ).toContainText("0.39 ETH");
  await page
    .getByRole("combobox", { name: /Ordenar por/ })
    .selectOption("recent");
  await page.getByRole("textbox", { name: "Buscar NFTs" }).fill("Emerald");
  await expect(page).toHaveURL(/page=1/);
  await page.getByRole("button", { name: "Abrir filtros" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: /^Arte digital/ }).click();
  await dialog.getByRole("button", { name: /^Ethereum/ }).click();
  await dialog.getByRole("button", { name: "Concluir filtros" }).click();
  await page
    .getByRole("combobox", { name: /Ordenar por/ })
    .selectOption("price-desc");
  await expect(page).toHaveURL(/sort=price-desc/);
  const search = new URL(page.url()).searchParams;
  expect(search.get("collection")).toBe("Arte digital");
  expect(search.get("network")).toBe("Ethereum");
  const result = await api(page, `/nfts?${search}`);
  expect(result.data.items.length).toBeGreaterThan(0);
  expect(
    result.data.items.every(
      (n: { name: string; collection: string; network: string }) =>
        n.name.includes("Emerald") &&
        n.collection === "Arte digital" &&
        n.network === "Ethereum",
    ),
  ).toBe(true);
  await expect(
    page.getByRole("link", { name: /Emerald Ape/ }).first(),
  ).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("combobox", { name: /Ordenar por/ })).toHaveValue(
    "recent",
  );
  await page.goForward();
  await expect(page.getByRole("combobox", { name: /Ordenar por/ })).toHaveValue(
    "price-desc",
  );
});

test("out-of-order searches keep the latest result and empty state recovers", async ({
  page,
}) => {
  await scenario(page, "out-of-order");
  const search = page.getByRole("textbox", { name: "Buscar NFTs" });
  const obsolete = page.waitForRequest(
    (request) =>
      new URL(request.url()).pathname === "/api/nfts" &&
      new URL(request.url()).searchParams.get("q") === "E",
  );
  await search.fill("E");
  await obsolete;
  await search.fill("Golden");
  const catalog = page.getByRole("region", { name: "Catálogo de NFTs" });
  await expect(catalog.getByRole("link")).toHaveCount(9);
  await expect(
    catalog.getByRole("link").filter({ hasNotText: "Golden" }),
  ).toHaveCount(0);
  await search.fill("inexistente");
  await expect(
    page.getByRole("status").filter({ hasText: "Nenhum NFT encontrado" }),
  ).toBeVisible();
  await search.fill("Golden");
  await expect(catalog.getByRole("link")).toHaveCount(9);
  await expect(search).toHaveValue("Golden");
});

test("direct detail, gallery and missing resource", async ({ page }) => {
  await page.goto("/product/1");
  await expect(
    page.getByRole("heading", { name: "Emerald Ape #042", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Emerald Ape #042 | Kurio");
  await page.goto("/product/missing");
  await expect(page.getByRole("alert")).toContainText(/encontrado/i);
});

test("register validates, creates an account and starts an isolated session", async ({
  page,
}) => {
  await page.goto("/register");
  await page.getByRole("button", { name: /Criar/ }).click();
  await expect(
    page.getByRole("textbox", { name: "E-mail", exact: true }),
  ).toHaveAttribute("aria-invalid", "true");
  await page
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill("nova@kurio.test");
  await page
    .getByRole("textbox", { name: "Nome de usuário", exact: true })
    .fill("nova");
  await page.getByLabel("Senha", { exact: true }).fill("NovaSenha123!");
  await page
    .getByLabel("Confirmar senha", { exact: true })
    .fill("NovaSenha123!");
  await page.getByRole("button", { name: /Criar/ }).click();
  await expect(page).not.toHaveURL(/register/);
  expect((await api(page, "/auth/session")).data.user.email).toBe(
    "nova@kurio.test",
  );
  expect((await api(page, "/cart")).data.items).toEqual([]);
});

test("favorites roll back on failure; logout, switch and expired session never leak private data", async ({
  page,
}) => {
  await login(page);
  await add(page);
  const favorite = page.getByRole("button", {
    name: /^(Favoritar|Favoritado|Remover dos favoritos)$/,
  });
  await scenario(page, "favorite-failure");
  await favorite.click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(favorite).toHaveAttribute("aria-pressed", "false");
  expect((await api(page, "/favorites")).data).toEqual([]);
  await scenario(page, "success");
  await favorite.click();
  await expect(favorite).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => (await api(page, "/favorites")).data)
    .toEqual(["1"]);
  await page.goto("/profile");
  await page
    .getByRole("navigation", { name: "Meu perfil" })
    .getByRole("button", { name: "Sair", exact: true })
    .click();
  await login(page, "bruno");
  await page.goto("/cart");
  await expect(page.locator("[data-cart-line]")).toHaveCount(0);
  expect((await api(page, "/favorites")).data).toEqual([]);
  await page.goto("/profile");
  await expect(
    page.getByRole("textbox", { name: /Nome de exibição/ }),
  ).toHaveValue("bruno");
  await api(page, "/mock/expire", {});
  await page.goto("/wallets");
  await expect(page).toHaveURL(/login/);
  await login(page);
  await page.goto("/cart");
  await expect(page.locator("[data-cart-line]")).toHaveCount(1);
  expect((await api(page, "/favorites")).data).toEqual(["1"]);
});

test("cart quantities, coupon errors/removal and guest merge survive refresh and login", async ({
  page,
}) => {
  await add(page);
  await page.goto("/cart");
  await page
    .getByRole("button", {
      name: "Aumentar quantidade de Emerald Ape #042",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("2.396 ETH").filter({ visible: true }).first(),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("2.396 ETH").filter({ visible: true }).first(),
  ).toBeVisible();
  await login(page);
  await page.goto("/cart");
  await expect(
    page.getByText("2.396 ETH").filter({ visible: true }).first(),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Código promocional" })
    .fill("INVALIDO");
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(/inválido/i);
  await page
    .getByRole("textbox", { name: "Código promocional" })
    .fill("KURIO10");
  await page.getByRole("button", { name: "Aplicar", exact: true }).click();
  await expect(
    page.getByText("2.158 ETH").filter({ visible: true }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Remover", exact: true }).click();
  await expect(
    page.getByText("2.396 ETH").filter({ visible: true }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Diminuir quantidade de Emerald Ape #042",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("1.206 ETH").filter({ visible: true }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remover Emerald Ape #042", exact: true })
    .click();
  await expect(page.locator("[data-cart-line]")).toHaveCount(0);
  expect((await api(page, "/cart")).data.items).toEqual([]);
});

test("full purchase, repeated click and immutable receipt survive refresh", async ({
  page,
}) => {
  await checkout(page);
  await scenario(page, "old-events");
  const requests: { key: string | null; body: unknown }[] = [];
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      new URL(request.url()).pathname === "/api/orders"
    )
      requests.push({
        key: request.headers()["idempotency-key"],
        body: request.postDataJSON(),
      });
  });
  // Two synchronous user clicks exercise the submit lock before React can render pending.
  await page
    .getByRole("button", { name: "Confirmar compra", exact: true })
    .evaluate((el: HTMLButtonElement) => {
      el.click();
      el.click();
    });
  const order = await receipt(page);
  await expect(
    page.getByRole("status").filter({ hasText: "Pedido confirmado." }),
  ).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(requests[0].key).toBeTruthy();
  expect(order.status).toBe("confirmed");
  expect(order.quote.total).toBe("1.206");
  expect(order.transactionId).toMatch(/^simulated-/);
  await expect(
    page.getByText(order.transactionId, { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("1.206 ETH").filter({ visible: true }).first(),
  ).toBeVisible();
  expect((await api(page, "/cart")).data.items).toEqual([]);
  expect((await api(page, "/nfts/1")).data.stock).toBe(9);
  await api(page, "/mock/nft", { id: "1", price: "9.19" });
  await page.reload();
  expect((await receipt(page)).id).toBe(order.id);
  await expect(
    page.getByText("1.206 ETH").filter({ visible: true }).first(),
  ).toBeVisible();
  expect((await api(page, "/nfts/1")).data.stock).toBe(9);
});

test("refused payment preserves cart and stock", async ({ page }) => {
  await checkout(page);
  await scenario(page, "payment-refused");
  await page
    .getByRole("button", { name: "Confirmar compra", exact: true })
    .click();
  const order = await receipt(page, true);
  expect(order.status).toBe("refused");
  expect((await api(page, "/cart")).data.items[0].quantity).toBe(1);
  expect((await api(page, "/nfts/1")).data.stock).toBe(10);
});

test("timeout retries the exact same purchase rather than creating another order", async ({
  page,
}) => {
  await checkout(page);
  await scenario(page, "order-timeout");
  const attempts: { key: string; body: unknown }[] = [];
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      new URL(request.url()).pathname === "/api/orders"
    )
      attempts.push({
        key: request.headers()["idempotency-key"],
        body: request.postDataJSON(),
      });
  });
  await page
    .getByRole("button", { name: "Confirmar compra", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Recuperar tentativa" }),
  ).toBeEnabled();
  await scenario(page, "success");
  await page.reload();
  await page.getByRole("button", { name: "Recuperar tentativa" }).click();
  await receipt(page);
  expect(attempts).toHaveLength(2);
  expect(attempts[1]).toEqual(attempts[0]);
  expect((await api(page, "/nfts/1")).data.stock).toBe(9);
});

for (const eventScenario of ["duplicate-events", "old-events"]) {
  test(`real Socket.IO ${eventScenario}: price invalidates review, sold-out prevents purchase`, async ({
    page,
  }) => {
    await checkout(page);
    await scenario(page, eventScenario);
    await api(page, "/mock/nft", { id: "1", price: "2.19" });
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "Preço ou disponibilidade atualizados" }),
    ).toBeVisible();
    await expect(
      page.getByText("2.206 ETH").filter({ visible: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Revisar compra", exact: true }),
    ).toBeVisible();
    await review(page);
    await api(page, "/mock/nft", { id: "1", stock: 0 });
    await expect(page.getByRole("alert").first()).toContainText(
      /esgotada|indisponível/i,
    );
    await expect(
      page.getByRole("button", { name: "Confirmar compra", exact: true }),
    ).toHaveCount(0);
    expect((await api(page, "/cart")).data.items[0].quantity).toBe(1);
  });
}

test("disconnection during pending order, refresh and reconciliation preserve one order", async ({
  page,
}) => {
  await checkout(page);
  await scenario(page, "pending-orders");
  await page
    .getByRole("button", { name: "Confirmar compra", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Aguardando confirmação da rede",
      exact: true,
    }),
  ).toBeVisible();
  const id = new URL(page.url()).searchParams.get("orderId")!;
  await scenario(page, "socket-offline");
  await api(page, "/mock/timing", { settlementPaused: true });
  await expect(
    page.getByRole("status").filter({ hasText: "Conexão interrompida" }),
  ).toBeVisible();
  await scenario(page, "pending-orders");
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Aguardando confirmação da rede",
      exact: true,
    }),
  ).toBeVisible();
  await scenario(page, "success");
  expect((await receipt(page)).id).toBe(id);
  expect((await api(page, "/nfts/1")).data.stock).toBe(9);
});

test("profile, avatar, password and saved wallet validate and persist", async ({
  page,
}) => {
  await login(page);
  await page.goto("/profile");
  const name = page.getByRole("textbox", { name: /Nome de exibição/ });
  await name.fill("");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await name.fill("Ana Colecionadora");
  await page.getByLabel("Alterar avatar").setInputFiles({
    name: "invalid.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("invalid"),
  });
  await expect(page.getByRole("alert")).toContainText(/PNG/);
  await page.getByLabel("Alterar avatar").setInputFiles({
    name: "avatar.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(page.getByRole("img", { name: "Seu avatar" })).toBeVisible();
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect
    .poll(async () => (await api(page, "/profile")).data.displayName)
    .toBe("Ana Colecionadora");
  await page.reload();
  await expect(name).toHaveValue("Ana Colecionadora");
  await expect(page.getByRole("img", { name: "Seu avatar" })).toHaveAttribute(
    "src",
    /^data:image\/png/,
  );
  await page.getByLabel(/^Senha atual/).fill("errada123");
  await page.getByLabel(/^Nova senha/).fill("NovaSenha123!");
  await page.getByLabel(/^Confirmar nova senha/).fill("NovaSenha123!");
  await page.getByRole("button", { name: "Salvar senha" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByLabel(/^Senha atual/).fill("Kurio123!");
  await page.getByRole("button", { name: "Salvar senha" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: /salv|sucesso/i }),
  ).toBeVisible();
  await page.goto("/wallets");
  const form = page.locator("form").filter({
    has: page.getByRole("heading", {
      name: "Carteira principal",
      exact: true,
    }),
  });
  const address = form.getByRole("textbox", { name: /Endereço da carteira/ });
  await address.fill("inválido");
  await form.getByRole("button", { name: "Salvar carteira" }).click();
  await expect(address).toHaveAttribute("aria-invalid", "true");
  const savedAddress = `0x${"c".repeat(40)}`;
  await address.fill(savedAddress);
  await form
    .getByRole("textbox", { name: /Nome de exibição/ })
    .fill("Minha carteira");
  await form.getByRole("button", { name: "Salvar carteira" }).click();
  await expect
    .poll(async () => (await api(page, "/wallets")).data[0].address)
    .toBe(savedAddress);
  await page.reload();
  await expect(address).toHaveValue(savedAddress);
  const secondary = page.locator("form").filter({
    has: page.getByRole("heading", {
      name: "Carteira secundária",
      exact: true,
    }),
  });
  await secondary
    .getByRole("textbox", { name: /Nome de exibição/ })
    .fill("Reserva");
  await secondary
    .getByRole("combobox", { name: /Rede/ })
    .selectOption("Polygon");
  await secondary
    .getByRole("textbox", { name: /Endereço da carteira/ })
    .fill(`0x${"d".repeat(40)}`);
  await secondary.getByRole("button", { name: "Salvar carteira" }).click();
  await expect
    .poll(async () => (await api(page, "/wallets")).data.length)
    .toBe(2);
  await page.reload();
  await expect(
    secondary.getByRole("textbox", { name: /Nome de exibição/ }),
  ).toHaveValue("Reserva");
  await page.goto("/profile");
  await page
    .getByRole("navigation", { name: "Meu perfil" })
    .getByRole("button", { name: "Sair", exact: true })
    .click();
  await login(page, "ana", "NovaSenha123!");
});

test("slow skeleton, server error and retry recover without losing navigation", async ({
  page,
}) => {
  await scenario(page, "slow");
  await page.goto("/product/2");
  await expect(
    page.getByRole("main", { name: "Carregando NFT" }),
  ).toHaveAttribute("aria-busy", "true");
  await expect(
    page.getByRole("heading", { name: "Sage Nomad #009", exact: true }),
  ).toBeVisible();
  await add(page);
  await page.goto("/cart");
  await expect(
    page.getByRole("status", { name: "Carregando resumo" }),
  ).toHaveAttribute("aria-busy", "true");
  await expect(
    page.getByText("1.206 ETH").filter({ visible: true }).first(),
  ).toBeVisible();
  await scenario(page, "http-500");
  await page.goto("/product/3");
  await expect(page.getByRole("alert")).toContainText(/Indisponibilidade/);
  await scenario(page, "success");
  await page.getByRole("button", { name: /Tentar novamente/ }).click();
  await expect(
    page.getByRole("heading", { name: "Neon Vessel #552", exact: true }),
  ).toBeVisible();
});
