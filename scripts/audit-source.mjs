import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = path.resolve("src");
async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? walk(path.join(directory, entry.name))
          : path.join(directory, entry.name),
      ),
    )
  ).flat();
}
const files = (await walk(root)).filter((file) => /\.tsx?$/.test(file));
const known = new Set(files),
  graph = new Map(),
  largeFunctions = [];
const relative = (file) =>
  path.relative(process.cwd(), file).replaceAll("\\", "/");
for (const file of files) {
  const source = await fs.readFile(file, "utf8");
  const parsed = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const edges = [];
  for (const node of parsed.statements) {
    if (
      ts.isFunctionDeclaration(node) &&
      node.name &&
      node.getText().split("\n").length > 150
    )
      largeFunctions.push({
        file: relative(file),
        name: node.name.text,
        lines: node.getText().split("\n").length,
      });
    if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node))
      continue;
    if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier))
      continue;
    if (
      node.isTypeOnly ||
      (ts.isImportDeclaration(node) && node.importClause?.isTypeOnly)
    )
      continue;
    const id = node.moduleSpecifier.text;
    const base = id.startsWith("@/")
      ? path.join(root, id.slice(2))
      : id.startsWith(".")
        ? path.resolve(path.dirname(file), id)
        : undefined;
    if (!base) continue;
    const resolved = [
      base,
      base + ".ts",
      base + ".tsx",
      path.join(base, "index.ts"),
      path.join(base, "index.tsx"),
    ].find((candidate) => known.has(candidate));
    if (resolved) edges.push(resolved);
  }
  graph.set(file, edges);
}
const visited = new Set(),
  visiting = new Set(),
  cycles = [];
function visit(file, stack) {
  if (visiting.has(file)) {
    cycles.push([...stack.slice(stack.indexOf(file)), file].map(relative));
    return;
  }
  if (visited.has(file)) return;
  visiting.add(file);
  for (const target of graph.get(file) ?? []) visit(target, [...stack, file]);
  visiting.delete(file);
  visited.add(file);
}
for (const file of files) visit(file, []);
const report = {
  files: files.length,
  staticRuntimeCycles: cycles,
  functionsOver150Lines: largeFunctions,
  excludes:
    "Type-only imports; dynamic lifecycle imports are not static graph edges.",
};
await fs.mkdir("reports/fidelity", { recursive: true });
await fs.writeFile(
  "reports/fidelity/code-audit.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
if (cycles.length || largeFunctions.length) process.exitCode = 1;
