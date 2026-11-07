import emerald from "./monkey.webp";
import golden from "./nft-golden.webp";
import neon from "./nft-neon.webp";
import sage from "./nft-sage.webp";

// Exact crops of the provided reference, never generated replacement artwork.
export const artwork = { emerald, sage, neon, golden };

const editions = [
  emerald,
  sage,
  neon,
  sage,
  sage,
  neon,
  golden,
  golden,
  golden,
];
export function artworkForToken(id: string) {
  const index = Number(id) - 1;
  return Number.isInteger(index) && index >= 0
    ? editions[index % editions.length]
    : emerald;
}
