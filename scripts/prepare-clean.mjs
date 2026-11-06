import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const destination = path.resolve(".verification/clean");
await fs.mkdir(destination, { recursive: true });
// A fresh destination is mandatory: never reuse node_modules from an earlier verification.
try {
  await fs.access(path.join(destination, "package.json"));
  throw new Error(
    "Clean verification directory already exists; use a new checkout.",
  );
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);
for (const file of new Set(files)) {
  if (
    file.startsWith("reports/") ||
    file.startsWith(".verification/") ||
    /^\.env(?!\.example$)/.test(file)
  )
    continue;
  const target = path.join(destination, file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(file, target);
}
console.log(`Fresh source copy: ${destination}`);
