import type { User } from "@/features/auth/types/contracts";
import { get } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/query-keys";
import { queryOptions } from "@tanstack/react-query";

export const profileOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.profile(id),
    queryFn: ({ signal }) => get<User>("/profile", signal),
  });
