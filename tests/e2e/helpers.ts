import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Browser fetches pass through the real service worker. APIRequestContext does not.
export async function api(
  page: Page,
  path: string,
  body?: unknown,
  method = body === undefined ? "GET" : "POST",
) {
  return page.evaluate(
    async (input) => {
      const response = await fetch(`/api${input.path}`, {
        method: input.method,
        headers: { "Content-Type": "application/json" },
        body: input.body === undefined ? undefined : JSON.stringify(input.body),
      });
      return { status: response.status, data: await response.json() };
    },
    { path, body, method },
  );
}
export async function reset(page: Page) {
  await page.goto("/?reset=1&scenario=success");
  await expect(
    page.getByRole("link", { name: /Emerald Ape/ }).first(),
  ).toBeVisible();
  await api(page, "/mock/reset", { scenario: "success" });
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /Emerald Ape/ }).first(),
  ).toBeVisible();
}
export const scenario = (page: Page, name: string) =>
  api(page, "/mock/scenario", { scenario: name });
export async function login(page: Page, user = "ana", password = "Kurio123!") {
  await page.goto("/login");
  await page
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill(`${user}@kurio.test`);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).not.toHaveURL(/\/login/);
}
export async function add(page: Page, id = "1") {
  await page.goto(`/product/${id}`);
  await page.getByRole("button", { name: /^(Comprar|Comprar NFT)$/ }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "adicionado" }),
  ).toBeVisible();
}
export async function checkout(page: Page) {
  await login(page);
  await page.goto("/");
  await page
    .getByRole("link", { name: /Emerald Ape/ })
    .first()
    .click();
  await page.getByRole("button", { name: /^(Comprar|Comprar NFT)$/ }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "adicionado" }),
  ).toBeVisible();
  await page.goto("/payment");
  await expect(
    page.getByText("1.206 ETH").filter({ visible: true }).first(),
  ).toBeVisible();
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
}
export async function review(page: Page) {
  await page
    .getByRole("button", { name: "Revisar compra", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Confirmar compra", exact: true }),
  ).toBeVisible();
}
export async function receipt(page: Page, refused = false) {
  await expect(page).toHaveURL(/payment\/confirm\?orderId=/);
  await expect(
    page.getByRole("heading", {
      name: refused
        ? "Pagamento recusado"
        : "Seus NFTs agora estão na sua carteira",
      exact: true,
    }),
  ).toBeVisible();
  const id = new URL(page.url()).searchParams.get("orderId")!;
  return { id, ...(await api(page, `/orders/${id}`)).data };
}
