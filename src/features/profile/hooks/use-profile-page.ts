import { useIdentity } from "@/features/auth/hooks/use-identity";
import { useProfile } from "@/features/profile/hooks/use-profile";

export function useProfilePage() {
  const { id } = useIdentity();
  const query = useProfile(id);
  return { id, query };
}
