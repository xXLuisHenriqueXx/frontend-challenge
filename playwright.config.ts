import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
import path from "node:path";

if (
  !process.env.PLAYWRIGHT_BROWSERS_PATH &&
  existsSync(".npm-cache/playwright")
)
  process.env.PLAYWRIGHT_BROWSERS_PATH = path.resolve(".npm-cache/playwright");

export default defineConfig({
  testDir: "./tests",
  testIgnore: "**/design/**",
  timeout: 60000,
  expect: {
    timeout: 15000,
    toHaveScreenshot: { animations: "disabled", maxDiffPixels: 0 },
  },
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    browserName: "chromium",
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    ...[390, 1440].map((width) => ({
      name: `chromium-${width}`,
      use: { viewport: { width, height: 1000 } },
    })),
    {
      name: "chromium-768",
      testMatch: /a11y.*spec\.ts/,
      use: { viewport: { width: 768, height: 1000 } },
    },
  ],
  webServer:
    process.env.E2E_EXTERNAL_SERVER === "true"
      ? undefined
      : {
          command:
            "node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 3100 --strictPort",
          url: "http://127.0.0.1:3100",
          reuseExistingServer: process.env.E2E_REUSE_SERVER === "true",
        },
});
