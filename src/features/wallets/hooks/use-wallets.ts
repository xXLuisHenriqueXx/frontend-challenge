import { useQuery } from "@tanstack/react-query";
import { walletOptions } from "../api/queries";

export function useWallets(userId: string) {
  return useQuery(walletOptions(userId));
}
