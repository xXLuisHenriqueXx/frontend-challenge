import type {
  CartLine,
  Nft,
  Order,
  Quote,
  Session,
  User,
  Wallet,
} from "../api/contracts";
import Monkey from "../assets/monkey.png";

interface Account extends User {
  passwordHash: string;
  salt: string;
}
interface Database {
  users: Account[];
  nfts: Nft[];
  carts: Partial<Record<string, CartLine[]>>;
  coupons: Partial<Record<string, string>>;
  favorites: Partial<Record<string, string[]>>;
  wallets: Partial<Record<string, Wallet[]>>;
  quotes: Partial<Record<string, { owner: string; quote: Quote }>>;
  orders: Partial<Record<string, Order>>;
  attempts: Partial<Record<string, { body: string; orderId: string }>>;
  session: Session | null;
  scenario: string;
}
const storageKey = "kurio.mock.v1";
export async function hash(password: string, salt: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${salt}:${password}`),
  );
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export let db: Database;
export function save() {
  localStorage.setItem(storageKey, JSON.stringify(db));
}
export async function reset(scenario = "success") {
  const users = await Promise.all(
    ["ana", "bruno"].map(async (name, i) => ({
      id: `user-${i + 1}`,
      email: `${name}@kurio.test`,
      username: name,
      displayName: name,
      avatar: "",
      salt: `fixture-${name}`,
      passwordHash: await hash("Kurio123!", `fixture-${name}`),
    })),
  );
  const names = [
    "Emerald Ape #042",
    "Sage Nomad #009",
    "Neon Vessel #552",
    "Cosmic Bloom #118",
    "Violet Nomad #314",
    "Ivory Baron #088",
    "Golden Beat #207",
    "Golden Pulse #133",
    "Golden Signal #160",
  ];
  const collections = [
    "Arte digital",
    "Fotografia",
    "Música",
    "Arte 3D",
    "Colecionáveis",
    "Generativa",
    "Jogos",
    "Assinaturas",
    "Utilidade",
  ];
  db = {
    users,
    nfts: Array.from({ length: 36 }, (_, i) => ({
      id: String(i + 1),
      name: names[i % 9] + (i > 8 ? ` · ${i + 1}` : ""),
      price: [
        "1.19",
        "1.69",
        "1.99",
        "1.29",
        "1.39",
        "1.79",
        "0.99",
        "0.79",
        "0.39",
      ][i % 9],
      collection: collections[i % 9],
      network: ["Ethereum", "Polygon", "Solana"][i % 3],
      category: i % 2 ? "new" : "hot",
      stock: 10 + i,
      version: 1,
      rating: 4.8,
      reviews: 19,
      description: "Colecionável digital da coleção Kurio Editions.",
      editions: ["1/50"],
      activeEdition: "1/50",
      tokenId: `#${String(i + 1).padStart(4, "0")}`,
      attributes: "Raro",
      images: [Monkey, Monkey, Monkey, Monkey],
    })),
    carts: {},
    coupons: {},
    favorites: {},
    wallets: Object.fromEntries(
      users.map((u) => [
        u.id,
        [
          {
            id: `${u.id}-principal`,
            name: "Principal",
            address: `0x${u.id === "user-1" ? "a" : "b"}`.padEnd(42, "0"),
            network: "Ethereum",
          },
        ],
      ]),
    ),
    quotes: {},
    orders: {},
    attempts: {},
    session: null,
    scenario,
  };
  save();
}
export async function initialize() {
  const raw = localStorage.getItem(storageKey);
  if (raw) {
    try {
      db = JSON.parse(raw) as Database;
    } catch {
      await reset();
    }
  } else await reset();
  if (new URLSearchParams(location.search).get("reset") === "1") await reset();
  const scenario = new URLSearchParams(location.search).get("scenario");
  if (scenario) {
    db.scenario = scenario;
    save();
  }
}
export function publicUser(u: Account): User {
  const { passwordHash: _hash, salt: _salt, ...user } = u;
  return user;
}
