import { queryKeys } from "@/shared/api/query-keys";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import ReactDOM from "react-dom/client";
import { http, queryClient } from "./api/client";
import { getRouter } from "./router";

export function mountApp() {
  const router = getRouter();
  http.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (isAxiosError(error)) {
        const sentToken = error.config?.headers.get("X-Session-Token");
        const current = queryClient.getQueryData<{ token?: string } | null>(
          queryKeys.session,
        );
        if (sentToken && sentToken !== current?.token)
          return Promise.reject(error);
      }
      if (
        isAxiosError(error) &&
        error.response?.status === 401 &&
        (!error.config?.url?.startsWith("/auth/") ||
          (error.config.url === "/auth/session" &&
            !!queryClient.getQueryData(queryKeys.session)))
      ) {
        await queryClient.cancelQueries({ queryKey: queryKeys.private });
        queryClient.removeQueries({ queryKey: queryKeys.private });
        queryClient.setQueryData(queryKeys.session, null);
        void router.navigate({
          to: "/login",
          search: { returnTo: router.state.location.href },
        });
      }
      return Promise.reject(error);
    },
  );
  ReactDOM.createRoot(document.getElementById("app")!).render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}
