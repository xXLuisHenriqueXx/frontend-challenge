import { clearPrivate } from "@/features/auth/api/queries";
import { queryClient, send } from "@/shared/api/http";
import { useMutation } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

const Route = getRouteApi("/login/");

export function useLoginPage() {
  const navigate = useNavigate();
  const { returnTo } = Route.useSearch();
  const mutation = useMutation({
    mutationFn: async (form: HTMLFormElement) => {
      const data = Object.fromEntries(new FormData(form));
      await clearPrivate();
      await send("/auth/login", data);
      await queryClient.invalidateQueries();
      await navigate({ to: returnTo });
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  return { navigate, returnTo, mutation, showPassword, setShowPassword };
}
