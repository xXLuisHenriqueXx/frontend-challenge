import { get } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";
import { queryOptions } from "@tanstack/react-query";

export const favoriteOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.favorites(id),
    queryFn: ({ signal }) => get<string[]>("/favorites", signal),
    enabled: id !== "guest",
  });
