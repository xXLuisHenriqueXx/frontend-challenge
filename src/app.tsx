import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getRouter } from "./router";
import { queryClient, http } from "./api/client";

export function mountApp() {
  const router = getRouter();
  http.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (isAxiosError(error)) {
        const sentToken = error.config?.headers.get("X-Session-Token");
        const current = queryClient.getQueryData<{ token?: string } | null>([
          "session",
        ]);
        if (sentToken && sentToken !== current?.token)
          return Promise.reject(error);
      }
      if (
        isAxiosError(error) &&
        error.response?.status === 401 &&
        (!error.config?.url?.startsWith("/auth/") ||
          (error.config.url === "/auth/session" &&
            !!queryClient.getQueryData(["session"])))
      ) {
        await queryClient.cancelQueries({ queryKey: ["private"] });
        queryClient.removeQueries({ queryKey: ["private"] });
        queryClient.setQueryData(["session"], null);
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
