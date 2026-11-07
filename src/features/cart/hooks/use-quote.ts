import { useQuery } from "@tanstack/react-query";
import { quoteOptions } from "../api/queries";

export function useQuote(userId: string) {
  return useQuery(quoteOptions(userId));
}
