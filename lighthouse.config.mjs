import desktop from "lighthouse/core/config/desktop-config.js";

// Lighthouse's standard simulated mobile Slow 4G/4x CPU and desktop Dense 4G.
// Audit the delivered application, with all assets, MSW and Socket.IO enabled.
const settings = {
  onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  locale: "pt-BR",
  throttlingMethod: "simulate",
  disableStorageReset: false,
  output: ["html", "json"],
};
export default {
  mobile: { extends: "lighthouse:default", settings },
  desktop: { ...desktop, settings: { ...desktop.settings, ...settings } },
};
