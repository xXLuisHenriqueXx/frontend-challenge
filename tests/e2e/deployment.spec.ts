import { expect, test } from "@playwright/test";
import { checkout, receipt, reset, review } from "./helpers";

test.beforeEach(async ({ page }) => reset(page));

test("production worker is JavaScript and unknown routes survive refresh", async ({
  page,
}) => {
  const worker = await page.request.get("/mockServiceWorker.js");
  expect(worker.status()).toBe(200);
  expect(worker.headers()["content-type"]).toMatch(/javascript/);
  expect(await worker.text()).toContain("Mock Service Worker");
  await page.goto("/rota-inexistente");
  await expect(
    page.getByRole("heading", { name: "Página não encontrada" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Página não encontrada" }),
  ).toBeVisible();
});

test("deep links and refresh recover cart, account, checkout and the same receipt", async ({
  page,
}) => {
  test.setTimeout(120000);
  await checkout(page);
  await page.goto("/product/1");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Emerald Ape #042", exact: true }),
  ).toBeVisible();
  await page.goto("/cart");
  await page.reload();
  await expect(
    page.getByText("1.206 ETH").filter({ visible: true }).first(),
  ).toBeVisible();
  for (const route of ["/profile", "/wallets"]) {
    await page.goto(route);
    const field = page.getByRole("textbox").first();
    await expect(field).toBeVisible();
    const value = await field.inputValue();
    await page.reload();
    await expect(field).toHaveValue(value);
  }
  await page.goto("/payment");
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: /Nome de exibição/ }),
  ).toHaveValue("ana");
  await page
    .getByRole("textbox", { name: /Código de indicação/ })
    .fill("KURIO");
  await page
    .getByRole("button", { name: "Conectar carteira", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Desconectar carteira", exact: true }),
  ).toBeVisible();
  await review(page);
  await page
    .getByRole("button", { name: "Confirmar compra", exact: true })
    .click();
  const original = await receipt(page);
  const url = page.url();
  await page.reload();
  expect((await receipt(page)).id).toBe(original.id);
  await page.goto(url);
  expect((await receipt(page)).id).toBe(original.id);
});
