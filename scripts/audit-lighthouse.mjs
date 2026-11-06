import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { createHash } from "node:crypto";
import lighthouse from "lighthouse";
import net from "node:net";
import configs from "../lighthouse.config.mjs";

if (
  !process.env.PLAYWRIGHT_BROWSERS_PATH &&
  existsSync(".npm-cache/playwright")
)
  process.env.PLAYWRIGHT_BROWSERS_PATH = path.resolve(".npm-cache/playwright");
const { chromium } = await import("@playwright/test");
const argument = (name, fallback) =>
  process.argv.find((x) => x.startsWith(`--${name}=`))?.split("=")[1] ??
  fallback;
const runs = Number(argument("runs", "3"));
const label = argument("label", "final");
if (!Number.isInteger(runs) || runs < 1 || !/^[a-z0-9-]+$/.test(label))
  throw new Error("Invalid runs/label");
const directory = path.resolve("reports/lighthouse", label);
await fs.mkdir(directory, { recursive: true });
const results = [];
async function freePort() {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}
for (const [page, route] of [
  ["home", "/"],
  ["detail", "/product/1"],
]) {
  for (const [profile, config] of Object.entries(configs)) {
    for (let run = 1; run <= runs; run++) {
      const port = await freePort();
      const chrome = await chromium.launch({
        executablePath: process.env.CHROME_PATH ?? chromium.executablePath(),
        headless: true,
        args: [`--remote-debugging-port=${port}`],
      });
      try {
        const url = `http://127.0.0.1:3200${route}?reset=1&scenario=success`;
        const result = await lighthouse(
          url,
          { port, logLevel: "error" },
          config,
        );
        if (!result || result.lhr.runtimeError)
          throw new Error(JSON.stringify(result?.lhr.runtimeError));
        const basename = `${page}-${profile}-${run}`;
        await fs.writeFile(
          path.join(directory, `${basename}.html`),
          result.report[0],
        );
        await fs.writeFile(
          path.join(directory, `${basename}.json`),
          result.report[1],
        );
        const lhr = result.lhr;
        const row = {
          page,
          profile,
          run,
          url,
          lighthouseVersion: lhr.lighthouseVersion,
          browser: lhr.environment.hostUserAgent,
          fetchedAt: lhr.fetchTime,
          settings: lhr.configSettings,
          scores: Object.fromEntries(
            Object.entries(lhr.categories).map(([key, value]) => [
              key,
              Math.round(value.score * 100),
            ]),
          ),
          lcp: lhr.audits["largest-contentful-paint"].numericValue,
          cls: lhr.audits["cumulative-layout-shift"].numericValue,
          tbt: lhr.audits["total-blocking-time"].numericValue,
          warnings: lhr.runWarnings,
        };
        results.push(row);
        console.log(
          basename,
          JSON.stringify({
            ...row.scores,
            lcp: row.lcp,
            cls: row.cls,
            tbt: row.tbt,
          }),
        );
      } finally {
        await chrome.close();
      }
    }
  }
}
const median = (values) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const medians = [];
for (const page of ["home", "detail"])
  for (const profile of ["mobile", "desktop"]) {
    const rows = results.filter(
      (row) => row.page === page && row.profile === profile,
    );
    medians.push({
      page,
      profile,
      runs: rows.length,
      scores: Object.fromEntries(
        Object.keys(rows[0].scores).map((key) => [
          key,
          median(rows.map((row) => row.scores[key])),
        ]),
      ),
      ...Object.fromEntries(
        ["lcp", "cls", "tbt"].map((key) => [
          key,
          median(rows.map((row) => row[key])),
        ]),
      ),
    });
  }
const summary = {
  environment: {
    node: process.version,
    platform: process.platform,
    release: os.release(),
    cpu: os.cpus()[0]?.model,
    logicalCpus: os.cpus().length,
    memoryGiB: os.totalmem() / 1024 ** 3,
  },
  conditions:
    "Optimized Vite preview on loopback; fresh Chrome profile per measurement; cold browser cache; default success MSW 120ms; actual images/fonts/Socket.IO; standard Lighthouse simulated throttling; sequential runs; shared Windows workstation without CPU/memory isolation; no audit-only application behavior.",
  medians,
  results,
};
async function sourceFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? sourceFiles(path.join(directory, entry.name))
        : path.join(directory, entry.name),
    ),
  );
  return nested.flat();
}
const inputs = [
  ...(await sourceFiles("src")),
  ...(await sourceFiles("public")),
  "index.html",
  "vite.config.ts",
  "tsconfig.json",
  "package.json",
  "package-lock.json",
  "lighthouse.config.mjs",
].sort();
const digest = createHash("sha256");
for (const file of inputs) {
  digest.update(file.replaceAll("\\", "/"));
  digest.update(await fs.readFile(file));
}
summary.sourceSha256 = digest.digest("hex");
summary.toolVersions = Object.fromEntries(
  await Promise.all(
    ["lighthouse", "@playwright/test", "vite", "sharp"].map(async (name) => [
      name,
      JSON.parse(await fs.readFile(`node_modules/${name}/package.json`, "utf8"))
        .version,
    ]),
  ),
);
summary.targets = {
  performance: 90,
  accessibility: 95,
  "best-practices": 95,
  seo: 90,
};
summary.meetsTargets = medians.every((row) =>
  Object.entries(summary.targets).every(
    ([category, target]) => row.scores[category] >= target,
  ),
);
await fs.writeFile(
  path.join(directory, "summary.json"),
  JSON.stringify(summary, null, 2) + "\n",
);
console.log("Medians:", JSON.stringify(medians));
