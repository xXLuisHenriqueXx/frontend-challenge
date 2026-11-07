import { AccountLayout } from "@/shared/components/account";
import { RemoteState } from "@/shared/components/remote-state";
import type { useProfilePage } from "../hooks/use-profile-page";
import { ProfileForm } from "./profile-page-parts";

export function ProfilePageView({
  id,
  query,
}: ReturnType<typeof useProfilePage>) {
  return (
    <AccountLayout>
      <h1 className="mb-8 font-bold">Perfil do colecionador</h1>
      <RemoteState query={query} />
      {query.data && <ProfileForm key={id} user={query.data} />}
    </AccountLayout>
  );
}
