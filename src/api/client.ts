import axios from "axios";
import { QueryClient, queryOptions } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import type {
  ApiError,
  Catalog,
  CatalogSearch,
  CartLine,
  Nft,
  Order,
  OrderInput,
  Quote,
  Session,
  User,
  Wallet,
} from "./contracts";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15000,
      gcTime: 300000,
      retry: (count, error) =>
        count < 1 &&
        (!axios.isAxiosError(error) ||
          !error.response ||
          error.response.status >= 500),
      refetchOnWindowFocus: true,
    },
    mutations: { retry: false },
  },
});
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 4000,
});
http.interceptors.request.use((config) => {
  const session = queryClient.getQueryData<Session | null>(["session"]);
  if (session) config.headers.set("X-Session-User", session.user.id);
  return config;
});
export const message = (error: unknown) =>
  axios.isAxiosError<ApiError>(error)
    ? (error.response?.data.message ?? "Falha de conexão. Tente novamente.")
    : error instanceof Error
      ? error.message
      : "Falha inesperada";
export const get = async <T>(
  path: string,
  signal?: AbortSignal,
  params?: object,
) => (await http.get<T>(path, { signal, params })).data;
export const send = async <T>(
  path: string,
  data?: unknown,
  method = "POST",
  headers?: Record<string, string>,
  signal?: AbortSignal,
) => (await http.request<T>({ url: path, method, data, headers, signal })).data;
export const sessionOptions = queryOptions({
  queryKey: ["session"],
  queryFn: async ({ signal }) => {
    try {
      return await get<Session>("/auth/session", signal);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401)
        return null;
      throw error;
    }
  },
  staleTime: 0,
  retry: false,
});
export async function requireSession(location: { href: string }) {
  const session = await queryClient.fetchQuery(sessionOptions);
  if (!session) {
    await queryClient.cancelQueries({ queryKey: ["private"] });
    queryClient.removeQueries({ queryKey: ["private"] });
    throw redirect({ to: "/login", search: { returnTo: location.href } });
  }
  return session;
}
export const safeReturn = (value: unknown) =>
  typeof value === "string" &&
  value.startsWith("/") &&
  !value.startsWith("//") &&
  !value.startsWith("/login") &&
  !value.startsWith("/register")
    ? value
    : "/";
export const catalogOptions = (search: CatalogSearch) =>
  queryOptions({
    queryKey: ["nfts", search],
    queryFn: ({ signal }) => get<Catalog>("/nfts", signal, search),
  });
export const nftOptions = (id: string) =>
  queryOptions({
    queryKey: ["nft", id],
    queryFn: ({ signal }) => get<Nft>(`/nfts/${id}`, signal),
  });
export const cartOptions = (id: string) =>
  queryOptions({
    queryKey: ["private", id, "cart"],
    queryFn: ({ signal }) =>
      get<{ items: CartLine[]; coupon: string }>("/cart", signal),
  });
export const quoteOptions = (id: string) =>
  queryOptions({
    queryKey: ["private", id, "quote"],
    queryFn: ({ signal }) =>
      send<Quote>("/quote", undefined, "POST", undefined, signal),
    staleTime: 0,
  });
export const favoriteOptions = (id: string) =>
  queryOptions({
    queryKey: ["private", id, "favorites"],
    queryFn: ({ signal }) => get<string[]>("/favorites", signal),
    enabled: id !== "guest",
  });
export const walletOptions = (id: string) =>
  queryOptions({
    queryKey: ["private", id, "wallets"],
    queryFn: ({ signal }) => get<Wallet[]>("/wallets", signal),
  });
export const profileOptions = (id: string) =>
  queryOptions({
    queryKey: ["private", id, "profile"],
    queryFn: ({ signal }) => get<User>("/profile", signal),
  });
export const orderOptions = (id: string, orderId: string) =>
  queryOptions({
    queryKey: ["private", id, "order", orderId],
    queryFn: ({ signal }) => get<Order>(`/orders/${orderId}`, signal),
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 1000 : false,
  });
export const createOrder = (input: OrderInput, key: string) =>
  send<Order>("/orders", input, "POST", { "Idempotency-Key": key });
export async function clearPrivate() {
  await queryClient.cancelQueries();
  queryClient.removeQueries({ queryKey: ["private"] });
  queryClient.removeQueries({ queryKey: ["session"] });
}
