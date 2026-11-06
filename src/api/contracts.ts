export interface CatalogSearch {
  q: string;
  collection: string;
  network: string;
  category: string;
  sort: "recent" | "price-asc" | "price-desc";
  page: number;
  min: string;
  max: string;
}
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
export interface Nft {
  id: string;
  name: string;
  price: string;
  collection: string;
  network: string;
  category: string;
  stock: number;
  version: number;
  rating: number;
  reviews: number;
  description: string;
  editions: string[];
  activeEdition: string;
  tokenId: string;
  attributes: string;
  images: string[];
}
export interface Catalog {
  items: Nft[];
  total: number;
  pages: number;
}
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
}
export interface Session {
  user: User;
  expiresAt: number;
}
export interface Wallet {
  id: string;
  name: string;
  address: string;
  network: string;
}
export interface CartLine {
  id: string;
  nftId: string;
  name: string;
  tokenId: string;
  edition: string;
  price: string;
  quantity: number;
  stock: number;
}
export interface Quote {
  id: string;
  items: CartLine[];
  subtotal: string;
  discount: string;
  fee: string;
  total: string;
  coupon: string;
  expiresAt: number;
}
export interface Order {
  id: string;
  userId: string;
  status: "pending" | "confirmed" | "refused";
  quote: Quote;
  wallet: Wallet;
  transactionId: string;
  createdAt: number;
  version: number;
}
export interface ApiError {
  code: string;
  message: string;
  fields?: Record<string, string>;
}
export interface OrderInput {
  quoteId: string;
  walletId: string;
}
export const units = (v: string) => {
  const [whole, fraction = ""] = v.split(".");
  return BigInt(whole) * 10n ** 18n + BigInt(fraction.padEnd(18, "0"));
};
export const decimal = (v: bigint) => {
  const s = (v % 10n ** 18n).toString().padStart(18, "0").replace(/0+$/, "");
  return `${v / 10n ** 18n}${s ? `.${s}` : ""}`;
};
export const multiply = (v: string, quantity: number) =>
  decimal(units(v) * BigInt(quantity));
