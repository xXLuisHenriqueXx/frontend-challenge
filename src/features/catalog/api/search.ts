import type { CatalogSearch } from "../types/contracts";

export const parseSearch = (s: Record<string, unknown>): CatalogSearch => ({
  q: String(s.q ?? "").slice(0, 100),
  collection: String(s.collection ?? ""),
  network: String(s.network ?? ""),
  category: ["new", "hot"].includes(String(s.category))
    ? String(s.category)
    : "",
  sort: s.sort === "price-asc" || s.sort === "price-desc" ? s.sort : "recent",
  page: Math.min(10000, Math.max(1, Math.floor(Number(s.page) || 1))),
  min: /^\d+(\.\d{1,18})?$/.test(String(s.min)) ? String(s.min) : "0",
  max: /^\d+(\.\d{1,18})?$/.test(String(s.max)) ? String(s.max) : "100",
});
