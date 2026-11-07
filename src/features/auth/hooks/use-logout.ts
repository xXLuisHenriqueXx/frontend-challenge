import { queryClient, send } from "@/shared/api/http";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { clearPrivate } from "../api/queries";

export function useLogout(destination: "stay" | "login" = "stay") {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      await send("/auth/logout");
      await clearPrivate();
      if (destination === "login")
        await navigate({ to: "/login", search: { returnTo: "/profile" } });
      await queryClient.invalidateQueries();
    },
  });
}
