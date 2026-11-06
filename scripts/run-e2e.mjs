import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import path from "node:path";

// Spawn Node directly: a nested npm/cmd preview process can outlive the test runner on Windows.
const vite = path.resolve("node_modules/vite/bin/vite.js");
const playwright = path.resolve("node_modules/@playwright/test/cli.js");
const children = new Set();
const launch = (file, args, env = process.env) => {
  const child = spawn(process.execPath, [file, ...args], {
    stdio: "inherit",
    windowsHide: true,
    env,
  });
  children.add(child);
  child.once("exit", () => children.delete(child));
  return child;
};
const run = async (file, args, env) => {
  const child = launch(file, args, env);
  const [code] = await once(child, "exit");
  return code ?? 1;
};
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    for (const child of children) child.kill();
    process.exitCode = 1;
  });
let preview;
try {
  const build = await run(vite, ["build"]);
  if (build) throw new Error(`Build failed (${build})`);
  const reusable = process.env.E2E_REUSE_SERVER === "true";
  if (!reusable) {
    const occupied = await fetch("http://127.0.0.1:3100", {
      signal: AbortSignal.timeout(1000),
    }).then(
      () => true,
      () => false,
    );
    if (occupied)
      throw new Error(
        "Port 3100 is occupied. Stop that preview or explicitly set E2E_REUSE_SERVER=true.",
      );
    preview = launch(vite, [
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      "3100",
      "--strictPort",
    ]);
  }
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (preview && preview.exitCode !== null)
      throw new Error(
        "Preview exited before becoming ready. Check whether port 3100 is occupied.",
      );
    try {
      const response = await fetch("http://127.0.0.1:3100", {
        signal: AbortSignal.timeout(1000),
      });
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      /* wait for the local preview */
    }
    await delay(200);
  }
  if (!ready) throw new Error("Preview did not become ready on port 3100");
  process.exitCode = await run(
    playwright,
    ["test", "--config", "playwright.config.ts", ...process.argv.slice(2)],
    { ...process.env, E2E_EXTERNAL_SERVER: "true" },
  );
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (preview && preview.exitCode === null) {
    const closed = once(preview, "exit");
    preview.kill();
    await Promise.race([closed, delay(5000, undefined, { ref: false })]);
    if (preview.exitCode === null) preview.kill("SIGKILL");
  }
}
