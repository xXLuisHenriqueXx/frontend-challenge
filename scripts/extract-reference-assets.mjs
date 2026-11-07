import sharp from "sharp";

// Coordinates are native pixels of the supplied 1440×1754 reference.
for (const [name, left] of [
  ["sage", 369],
  ["neon", 615],
  ["golden", 859],
]) {
  await sharp("docs/design/cart-desktop.png")
    .extract({ left, top: 695, width: 212, height: 212 })
    .webp({ lossless: true })
    .toFile(`src/assets/nft-${name}.webp`);
}
await sharp("docs/design/home-desktop.png")
  .webp({ quality: 90 })
  .toFile("src/assets/auth-backdrop.webp");
