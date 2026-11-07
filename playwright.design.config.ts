import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig({
  ...base,
  testDir: "./tests/design",
  testIgnore: [],
  timeout: 90000,
  outputDir: "test-results/design",
  projects: [390, 768, 1440].map((width) => ({
    name: `design-${width}`,
    use: { viewport: { width, height: width === 1440 ? 1080 : 896 } },
  })),
});
