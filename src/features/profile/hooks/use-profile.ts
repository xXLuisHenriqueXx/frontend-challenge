import { useQuery } from "@tanstack/react-query";
import { profileOptions } from "../api/queries";

export function useProfile(userId: string) {
  return useQuery(profileOptions(userId));
}
