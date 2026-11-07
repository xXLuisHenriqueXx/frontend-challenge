import { useIdentity } from "@/features/auth/hooks/use-identity";
import { cartOptions } from "@/features/cart/api/queries";
import type { CartLine } from "@/features/cart/types/contracts";
import { queryClient, send } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useCart() {
  const { id } = useIdentity();
  const query = useQuery(cartOptions(id));
  const mutation = useMutation({
    scope: { id: "cart:" + id },
    mutationFn: (input: {
      item?: CartLine;
      nftId?: string;
      edition?: string;
      quantity?: number;
      remove?: boolean;
    }) =>
      input.remove
        ? send(
            `/cart/items/${encodeURIComponent(input.item!.id)}`,
            undefined,
            "DELETE",
          )
        : send("/cart/items", {
            nftId: input.item?.nftId ?? input.nftId,
            edition: input.item?.edition ?? input.edition,
            quantity: input.quantity,
            mode: input.item ? "replace" : "add",
          }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.user(id) }),
  });
  return { ...query, mutation };
}
