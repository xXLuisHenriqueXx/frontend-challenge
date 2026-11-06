import { test, expect } from "@playwright/test";
import { add, api, login, reset } from "./helpers";

test.beforeEach(async ({ page }) => {
  await reset(page);
  await page.clock.setFixedTime(new Date("2026-11-06T12:00:00Z"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await api(page, "/mock/timing", { latency: 0 });
});

test("visual reference: home, detail, cart and payment", async ({ page }) => {
  test.setTimeout(120000);
  const snapshot = async (name: string) => {
    // Exercise native lazy loading by visiting the actual images. Hidden responsive
    // images are intentionally not requested by the browser and must not block QA.
    for (const img of await page.locator("img").all()) {
      if (!(await img.isVisible())) continue;
      await img.scrollIntoViewIfNeeded();
      await img.evaluate((element: HTMLImageElement) => element.decode());
    }
    await page.evaluate(async () => {
      await document.fonts.ready;
      window.scrollTo(0, 0);
    });
    if (name === "cart") {
      await expect(
        page.getByRole("button", { name: "Conectar e finalizar" }),
      ).toBeInViewport();
    }
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: name !== "cart" || page.viewportSize()!.width >= 1024,
    });
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
