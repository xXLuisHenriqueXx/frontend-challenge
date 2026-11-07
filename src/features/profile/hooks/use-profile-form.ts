import type { User } from "@/features/auth/types/contracts";
import { queryClient, send } from "@/shared/api/http";
import { errorsFor } from "@/shared/lib/errors";
import { requireMatchingPasswords } from "@/shared/lib/validation";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export function useProfileForm({ user }: { user: User }) {
  const [avatar, setAvatar] = useState(user.avatar),
    [fileError, setFileError] = useState("");
  const save = useMutation({
    mutationFn: (form: HTMLFormElement) =>
      send(
        "/profile",
        { ...Object.fromEntries(new FormData(form)), avatar },
        "PATCH",
      ),
    onSuccess: () => queryClient.invalidateQueries(),
  });
  const password = useMutation({
    mutationFn: async (form: HTMLFormElement) => {
      const data = Object.fromEntries(new FormData(form));
      requireMatchingPasswords(data.password, data.confirmPassword);
      await send("/profile/password", data);
      form.reset();
    },
  });
  const errors = errorsFor(save.error);
  return {
    user,
    avatar,
    setAvatar,
    fileError,
    setFileError,
    save,
    password,
    errors,
  };
}
