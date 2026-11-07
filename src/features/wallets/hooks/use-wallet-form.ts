import type { Wallet } from "@/features/wallets/types/contracts";
import { queryClient, send } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";
import { errorsFor } from "@/shared/components/account";
import { useMutation } from "@tanstack/react-query";

export function useWalletForm({
  wallet,
  role,
}: {
  wallet?: Wallet;
  role: "primary" | "secondary";
}) {
  const mutation = useMutation({
    mutationFn: (form: HTMLFormElement) =>
      send(
        wallet ? `/wallets/${wallet.id}` : "/wallets",
        { ...Object.fromEntries(new FormData(form)), role },
        wallet ? "PATCH" : "POST",
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.private }),
  });
  const errors = errorsFor(mutation.error);
  return { wallet, role, mutation, errors };
}
