import { useProfilePage } from "../hooks/use-profile-page";
import { ProfilePageView } from "./profile-page-view";

export function ProfilePage() {
  return <ProfilePageView {...useProfilePage()} />;
}
