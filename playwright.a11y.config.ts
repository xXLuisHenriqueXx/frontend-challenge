import { defineConfig } from "@playwright/test";
import path from "node:path";
import { existsSync } from "node:fs";

if (
  !process.env.PLAYWRIGHT_BROWSERS_PATH &&
  existsSync(path.resolve(".npm-cache/playwright"))
)
  process.env.PLAYWRIGHT_BROWSERS_PATH = path.resolve(".npm-cache/playwright");
export default defineConfig({
  testDir: "./tests/a11y",
  timeout: 60000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    browserName: "chromium",
  },
  projects: [390, 768, 1440].map((width) => ({
    name: `chromium-${width}`,
    use: { viewport: { width, height: 1000 } },
  })),
  webServer:
    process.env.A11Y_EXTERNAL_SERVER === "true"
      ? undefined
      : {
          command:
            "npm run build && npm run preview -- --host 127.0.0.1 --port 3100 --strictPort",
          url: "http://127.0.0.1:3100",
          reuseExistingServer: process.env.A11Y_REUSE_SERVER === "true",
          timeout: 120000,
        },
});
