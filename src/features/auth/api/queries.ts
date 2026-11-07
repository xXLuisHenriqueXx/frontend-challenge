import type { Session } from "@/features/auth/types/contracts";
import { get, queryClient } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";
import { queryOptions } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import axios from "axios";

export const sessionOptions = queryOptions({
  queryKey: queryKeys.session,
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
    await queryClient.cancelQueries({ queryKey: queryKeys.private });
    queryClient.removeQueries({ queryKey: queryKeys.private });
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

export async function clearPrivate() {
  const { stopRealtime } = await import("@/api/realtime");
  stopRealtime();
  await queryClient.cancelQueries();
  queryClient.removeQueries({ queryKey: queryKeys.private });
  queryClient.removeQueries({ queryKey: queryKeys.session });
}
