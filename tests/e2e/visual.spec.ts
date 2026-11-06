import { test, expect } from "@playwright/test";
import { add, api, login, reset } from "./helpers";

test.beforeEach(async ({ page }) => {
  await reset(page);
  await page.clock.setFixedTime(new Date("2026-11-06T12:00:00Z"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await api(page, "/mock/timing", { latency: 0 });
});

test("visual reference: home, detail, cart and payment", async ({ page }) => {
  const snapshot = async (name: string) => {
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map((img) => img.decode().catch(() => {})),
      );
    });
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  };
  await snapshot("home");
  await page.goto("/product/1");
  await expect(
    page.getByRole("heading", { name: "Emerald Ape #042", exact: true }),
  ).toBeVisible();
  await snapshot("detail");
  await add(page);
  await page.goto("/cart");
  await expect(
    page.getByText("1.206 ETH").filter({ visible: true }).first(),
  ).toBeVisible();
  await snapshot("cart");
  await login(page);
  await page.goto("/payment");
  await expect(
    page.getByRole("textbox", { name: /Nome de exibição/ }),
  ).toHaveValue("ana");
  await expect(
    page.getByText("1.206 ETH").filter({ visible: true }).first(),
  ).toBeVisible();
  await snapshot("payment");
});
