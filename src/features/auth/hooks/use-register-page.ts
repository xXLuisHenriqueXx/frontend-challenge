import { clearPrivate } from "@/features/auth/api/queries";
import { queryClient, send } from "@/shared/api/http";
import { requireMatchingPasswords } from "@/shared/lib/validation";
import { useMutation } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

const Route = getRouteApi("/register/");

export function useRegisterPage() {
  const navigate = useNavigate();
  const { returnTo } = Route.useSearch();
  const mutation = useMutation({
    mutationFn: async (form: HTMLFormElement) => {
      const data = Object.fromEntries(new FormData(form));
      requireMatchingPasswords(data.password, data.confirmPassword);
      await send("/auth/register", data);
      await clearPrivate();
      await send("/auth/login", data);
      await queryClient.invalidateQueries();
      await navigate({ to: returnTo });
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  return {
    navigate,
    returnTo,
    mutation,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
  };
}
