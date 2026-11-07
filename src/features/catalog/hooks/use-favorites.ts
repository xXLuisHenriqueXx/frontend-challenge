import { useIdentity } from "@/features/auth/hooks/use-identity";
import type { Session } from "@/features/auth/types/contracts";
import { favoriteOptions } from "@/features/catalog/api/favorites";
import { queryClient, send } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export function useFavorites(nftId: string) {
  const { id } = useIdentity();
  const navigate = useNavigate();
  const options = favoriteOptions(id);
  const query = useQuery(options);
  const mutation = useMutation({
    mutationFn: (selected: boolean) =>
      send(`/favorites/${nftId}`, undefined, selected ? "DELETE" : "PUT"),
    onMutate: async (selected) => {
      await queryClient.cancelQueries({ queryKey: options.queryKey });
      const previous = queryClient.getQueryData(options.queryKey) ?? [];
      queryClient.setQueryData(options.queryKey, (old = []) =>
        selected ? old.filter((x) => x !== nftId) : [...old, nftId],
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (
        context?.previous &&
        queryClient.getQueryData<Session | null>(queryKeys.session)?.user.id ===
          id
      )
        queryClient.setQueryData(options.queryKey, context.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: options.queryKey }),
  });
  return {
    selected: query.data?.includes(nftId) ?? false,
    mutation,
    toggle: () => {
      if (id === "guest") {
        void navigate({
          to: "/login",
          search: { returnTo: location.pathname + location.search },
        });
        return;
      }
      mutation.mutate(query.data?.includes(nftId) ?? false);
    },
  };
}
