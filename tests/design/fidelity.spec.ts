import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { add, checkout, login, receipt, reset, scenario } from "../e2e/helpers";

const screens = [
  "home",
  "detail",
  "cart",
  "payment",
  "receipt",
  "login",
  "register",
  "profile",
  "wallets",
] as const;

test("skeleton artwork reserves the loaded geometry", async ({
  page,
}, info) => {
  await reset(page);
  await scenario(page, "slow");
  await page.goto("/");
  const loading = page.getByRole("status", { name: "Carregando catálogo" });
  await expect(loading).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const catalogBefore = await loading
    .locator(".nft-artwork-frame")
    .first()
    .boundingBox();
  await expect(
    page.getByRole("link", { name: /Emerald Ape/ }).first(),
  ).toBeVisible();
  const catalogAfter = await page
    .locator("#catalog .nft-artwork-frame")
    .first()
    .boundingBox();
  await page.goto("/product/1");
  const detailLoading = page.locator("[data-skeleton-artwork]");
  await expect(detailLoading).toBeVisible();
  const detailBefore = await detailLoading.boundingBox();
  await expect(
    page.getByRole("heading", { name: "Emerald Ape #042", exact: true }),
  ).toBeVisible();
  const detailAfter = await page
    .locator(".detail-page section")
    .first()
    .locator("img")
    .last()
    .boundingBox();
  await info.attach("skeleton-geometry", {
    body: JSON.stringify({
      catalogBefore,
      catalogAfter,
      detailBefore,
      detailAfter,
    }),
    contentType: "application/json",
  });
  await fs.mkdir("reports/fidelity/after", { recursive: true });
  await fs.writeFile(
    `reports/fidelity/after/skeleton-${page.viewportSize()!.width}.json`,
    JSON.stringify(
      { catalogBefore, catalogAfter, detailBefore, detailAfter },
      null,
      2,
    ),
  );
  for (const [before, after] of [
    [catalogBefore, catalogAfter],
    [detailBefore, detailAfter],
  ]) {
    expect(before).toBeTruthy();
    expect(after).toBeTruthy();
    for (const key of ["x", "y", "width", "height"] as const)
      expect(before![key], key).toBe(after![key]);
  }
});
for (const screen of screens) {
  test(`reference capture: ${screen}`, async ({ page }, info) => {
    await reset(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    if (screen === "payment" || screen === "receipt") {
      await checkout(page);
      if (screen === "receipt") {
        await page
          .getByRole("button", { name: "Confirmar compra", exact: true })
          .click();
        await receipt(page);
      }
    } else if (screen === "cart") {
      await add(page);
      await page.goto("/cart");
      await expect(
        page.getByText("1.206 ETH").filter({ visible: true }).first(),
      ).toBeVisible();
    } else if (screen === "profile" || screen === "wallets") {
      await login(page);
      await page.goto(`/${screen}`);
      await expect(page.getByRole("textbox").first()).toBeVisible();
    } else if (screen !== "home") {
      await page.goto(screen === "detail" ? "/product/1" : `/${screen}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      if (screen === "detail")
        await expect(
          page.getByRole("heading", { name: "Emerald Ape #042", exact: true }),
        ).toBeVisible();
    }
    const width = page.viewportSize()!.width;
    const phase = process.env.FIDELITY_PHASE === "before" ? "before" : "after";
    const directory = path.resolve("reports/fidelity", phase);
    await fs.mkdir(directory, { recursive: true });
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    if (width === 1440) {
      for (const img of await page.locator("img").all()) {
        if (await img.isVisible()) {
          await img.scrollIntoViewIfNeeded();
          await img.evaluate((el: HTMLImageElement) => el.decode());
        }
      }
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    const screenshot = path.join(directory, `${screen}-${width}.png`);
    await page.screenshot({
      path: screenshot,
      fullPage: width === 1440,
      animations: "disabled",
    });
    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      elements: [
        ...document.querySelectorAll<HTMLElement>(
          "main,h1,h2,header,aside,input,select,button",
        ),
      ]
        .filter((el) => el.getClientRects().length)
        .map((el) => {
          const css = getComputedStyle(el),
            box = el.getBoundingClientRect();
          return {
            tag: el.tagName,
            text: el.textContent.trim().slice(0, 50),
            className: el.className,
            box: { x: box.x, y: box.y, width: box.width, height: box.height },
            font: css.fontFamily,
            size: css.fontSize,
            weight: css.fontWeight,
            lineHeight: css.lineHeight,
            spacing: css.letterSpacing,
            color: css.color,
            background: css.backgroundColor,
            radius: css.borderRadius,
            padding: css.padding,
            gap: css.gap,
          };
        }),
    }));
    await fs.writeFile(
      path.join(directory, `${screen}-${width}.json`),
      JSON.stringify(metrics, null, 2),
    );
    await info.attach(`${screen}-${width}`, {
      path: screenshot,
      contentType: "image/png",
    });
    expect(metrics.overflow).toBe(false);
  });
}
