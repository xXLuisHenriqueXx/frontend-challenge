import type { Session } from "@/features/auth/types/contracts";
import { QueryClient } from "@tanstack/react-query";
import axios from "axios";
import { queryKeys } from "./query-keys";

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
  const session = queryClient.getQueryData<Session | null>(queryKeys.session);
  if (session) {
    config.headers.set("X-Session-User", session.user.id);
    if (session.token) config.headers.set("X-Session-Token", session.token);
  }
  return config;
});

export { message } from "../lib/errors";
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
