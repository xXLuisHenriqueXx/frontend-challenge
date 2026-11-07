import { useQuery } from "@tanstack/react-query";
import { nftOptions } from "../api/queries";

export function useNft(id: string) {
  return useQuery(nftOptions(id));
}
