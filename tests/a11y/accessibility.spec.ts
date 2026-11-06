import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

async function reset(page: Page) {
  await page.goto("/?reset=1&scenario=success");
  await expect(
    page.getByRole("link", { name: /Emerald Ape/ }).first(),
  ).toBeVisible();
}
async function login(page: Page) {
  await page.goto("/login");
  await page
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill("ana@kurio.test");
  await page.getByLabel("Senha", { exact: true }).fill("Kurio123!");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).not.toHaveURL(/login/);
}
async function audit(page: Page, label: string) {
  await expect(page.locator("main")).toHaveCount(1);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
    .analyze();
  await test.info().attach(`${label}-axe.json`, {
    body: JSON.stringify(result, null, 2),
    contentType: "application/json",
  });
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
    label,
  ).toEqual([]);
}
test("axe on catalog, detail, cart, authentication and account screens", async ({
  page,
}) => {
  test.setTimeout(120000);
  await reset(page);
  await audit(page, "home");
  await page.goto("/product/1");
  await expect(
    page.getByRole("heading", { name: "Emerald Ape #042", exact: true }),
  ).toBeVisible();
  await audit(page, "detail");
  await page.getByRole("button", { name: /^(Comprar|Comprar NFT)$/ }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "adicionado" }),
  ).toBeVisible();
  await page.goto("/cart");
  await expect(page.getByText("1.206 ETH")).toBeVisible();
  await audit(page, "cart");
  await page
    .getByRole("button", { name: "Remover Emerald Ape #042", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-cart-line]")).toHaveCount(0);
  await expect(page.getByRole("main")).toBeFocused();
  await page.goto("/product/1");
  await page.getByRole("button", { name: /^(Comprar|Comprar NFT)$/ }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "adicionado" }),
  ).toBeVisible();
  await page.goto("/register");
  await audit(page, "register");
  await page.goto("/login");
  await audit(page, "login");
  await login(page);
  await page.goto("/profile");
  await expect(
    page.getByRole("textbox", { name: /Nome de exibição/ }),
  ).toHaveValue("ana");
  await audit(page, "profile");
  await page.goto("/wallets");
  await expect(
    page.getByRole("heading", { name: "Carteira principal" }),
  ).toBeVisible();
  await audit(page, "wallets");
  await page.goto("/payment");
  await expect(
    page.getByRole("button", { name: "Conectar carteira", exact: true }),
  ).toBeEnabled();
  await audit(page, "payment");
  await page
    .getByRole("textbox", { name: /Código de indicação/ })
    .fill("KURIO");
  await page
    .getByRole("button", { name: "Conectar carteira", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Desconectar carteira", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Revisar compra", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirmar compra", exact: true })
    .click();
  await expect(page).toHaveURL(/payment\/confirm/);
  await expect(
    page.getByRole("heading", {
      name: "Seus NFTs agora estão na sua carteira",
    }),
  ).toBeVisible();
  await audit(page, "confirmed-receipt");
});
test("keyboard modal focus, Escape and return to trigger", async ({ page }) => {
  await reset(page);
  const trigger = page.getByRole("button", { name: "Abrir filtros" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Filtrar NFTs" });
  await expect(dialog).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Fechar", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Concluir filtros" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Fechar", exact: true }),
  ).toBeFocused();
  await audit(page, "filters-open");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
test("associated validation and API errors with first error focus", async ({
  page,
}) => {
  await reset(page);
  await page.goto("/login");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  const email = page.getByRole("textbox", { name: "E-mail", exact: true });
  await expect(email).toBeFocused();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toHaveAccessibleDescription(/Preencha/);
  await email.fill("ana@kurio.test");
  await page.getByLabel("Senha", { exact: true }).fill("SenhaErrada123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(email).toHaveAccessibleDescription(/Credenciais/);
  await expect(email).toBeFocused();
  await audit(page, "api-error");
});
test("route title, focus, tab keyboard and selected favorite state", async ({
  page,
}) => {
  await reset(page);
  await page
    .getByRole("link", { name: /Emerald Ape/ })
    .first()
    .focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveTitle("Emerald Ape #042 | Kurio");
  await expect(
    page.getByRole("heading", { name: "Emerald Ape #042", exact: true }),
  ).toBeFocused();
  if (page.viewportSize()!.width >= 1024) {
    const tab = page.getByRole("tab", { name: "Detalhes do NFT" });
    await tab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { selected: true })).toContainText(
      "Avaliações",
    );
    await page.keyboard.press("Home");
    await expect(tab).toHaveAttribute("aria-selected", "true");
  }
  await login(page);
  await page.goto("/product/1");
  const favorite = page.getByRole("button", {
    name: /^(Favoritar|Favoritado|Remover dos favoritos)$/,
  });
  await favorite.focus();
  await page.keyboard.press("Space");
  await expect(favorite).toHaveAttribute("aria-pressed", "true");
  await expect(favorite).toHaveAccessibleName(
    /Favoritado|Remover dos favoritos/,
  );
});
test("200 percent reflow preserves controls without horizontal overflow", async ({
  page,
}) => {
  await reset(page);
  const width = page.viewportSize()!.width;
  await page.setViewportSize({ width: Math.floor(width / 2), height: 1000 });
  for (const path of ["/", "/product/1", "/cart", "/login", "/register"]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("body *")]
        .filter(
          (el) =>
            el.getBoundingClientRect().right > innerWidth + 1 &&
            el.getClientRects().length,
        )
        .map((el) => ({
          tag: el.tagName,
          cls: el.className,
          right: el.getBoundingClientRect().right,
          width: el.getBoundingClientRect().width,
        }))
        .slice(0, 30),
    );
    await test.info().attach(`reflow-${path.replaceAll("/", "_")}.json`, {
      body: JSON.stringify(overflow),
      contentType: "application/json",
    });
    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth + 1,
          ),
        { message: `overflow at 200%: ${path}` },
      )
      .toBe(true);
  }
  await login(page);
  await page.goto("/product/1");
  await page.getByRole("button", { name: /^(Comprar|Comprar NFT)$/ }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "adicionado" }),
  ).toBeVisible();
  for (const path of ["/profile", "/wallets", "/payment"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth + 1,
          ),
        { message: `private route overflow at 200%: ${path}` },
      )
      .toBe(true);
  }
  await page
    .getByRole("textbox", { name: /Código de indicação/ })
    .fill("KURIO");
  await page
    .getByRole("button", { name: "Conectar carteira", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Desconectar carteira", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Revisar compra", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirmar compra", exact: true })
    .click();
  await expect(page).toHaveURL(/payment\/confirm/);
  await expect(
    page.getByRole("heading", {
      name: "Seus NFTs agora estão na sua carteira",
    }),
  ).toBeVisible();
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth + 1,
        ),
      { message: "confirmed receipt overflow at 200%" },
    )
    .toBe(true);
});
test("skeleton busy state and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?reset=1&scenario=slow");
  const loading = page.getByRole("status", { name: "Carregando catálogo" });
  await expect(loading).toHaveAttribute("aria-busy", "true");
  const animation = await loading
    .locator(".skeleton")
    .first()
    .evaluate((el) => getComputedStyle(el, "::after").animationDuration);
  expect(["0s", "1e-05s", "0.00001s"]).toContain(animation);
  await expect(
    page.getByRole("link", { name: /Emerald Ape/ }).first(),
  ).toBeVisible();
});
