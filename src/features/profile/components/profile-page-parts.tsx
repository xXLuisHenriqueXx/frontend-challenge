import { useProfileForm } from "../hooks/use-profile-form";
import { PasswordForm } from "./password-form";
import { ProfileFields } from "./profile-fields";

export function ProfileForm(props: Parameters<typeof useProfileForm>[0]) {
  return <ProfileFormView {...useProfileForm(props)} />;
}
export function ProfileFormView({
  user,
  avatar,
  setAvatar,
  fileError,
  setFileError,
  save,
  password,
  errors,
}: ReturnType<typeof useProfileForm>) {
  return (
    <>
      <ProfileFields
        save={save}
        user={user}
        errors={errors}
        avatar={avatar}
        fileError={fileError}
        setFileError={setFileError}
        setAvatar={setAvatar}
      />
      <PasswordForm password={password} />
    </>
  );
}
