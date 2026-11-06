import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  cartOptions,
  favoriteOptions,
  message,
  queryClient,
  send,
  sessionOptions,
} from "./client";
import type { CartLine, Session } from "./contracts";

export function useIdentity() {
  const session = useQuery(sessionOptions);
  return { ...session, id: session.data?.user.id ?? "guest" };
}
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
      queryClient.invalidateQueries({ queryKey: ["private", id] }),
  });
  return { ...query, mutation };
}
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
        queryClient.getQueryData<Session | null>(["session"])?.user.id === id
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
export function RemoteState({
  query,
}: {
  query: {
    isPending: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => unknown;
    isFetching?: boolean;
  };
}) {
  if (query.isPending)
    return (
      <p role="status" className="p-6">
        Carregando…
      </p>
    );
  if (query.isError)
    return (
      <div role="alert" className="p-6">
        {message(query.error)}{" "}
        <button onClick={() => void query.refetch()}>Tentar novamente</button>
      </div>
    );
  if (query.isFetching)
    return (
      <span role="status" className="sr-only">
        Atualizando…
      </span>
    );
  return null;
}
