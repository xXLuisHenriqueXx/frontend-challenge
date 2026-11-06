import sharp from "sharp";
import fs from "node:fs/promises";

// Keep the Figma-exported original; derivatives preserve its composition and colors.
for (const width of [256, 512, 768]) {
  await sharp("src/assets/monkey.png")
    .resize(width)
    .webp({ lossless: true, effort: 6 })
    .toFile(`src/assets/monkey-${width}.webp`);
}
await sharp("src/assets/monkey.png")
  .webp({ lossless: true, effort: 6 })
  .toFile("src/assets/monkey.webp");
const original = await sharp("src/assets/monkey.png").raw().toBuffer();
const converted = await sharp("src/assets/monkey.webp").raw().toBuffer();
if (!original.equals(converted))
  throw new Error("Full-size derivative changed decoded pixels");
console.log(
  "Lossless source pixels verified. Generated:",
  (await fs.readdir("src/assets")).filter((name) => name.endsWith(".webp")),
);
