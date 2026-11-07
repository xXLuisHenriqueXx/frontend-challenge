import { useIdentity } from "@/features/auth/hooks/use-identity";
import { useWallets } from "@/features/wallets/hooks/use-wallets";

export function useWalletsPage() {
  const { id } = useIdentity();
  const query = useWallets(id);
  return { id, query };
}
