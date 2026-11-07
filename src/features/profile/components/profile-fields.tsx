import { AccessibleForm } from "@/shared/components/accessible-form";
import {
  AccountField,
  Feedback,
  SaveButton,
} from "@/shared/components/account";
import { isValidAvatar } from "@/shared/lib/validation";
import type { useProfileForm } from "../hooks/use-profile-form";

export function ProfileFields({
  save,
  user,
  errors,
  avatar,
  fileError,
  setFileError,
  setAvatar,
}: Pick<
  ReturnType<typeof useProfileForm>,
  | "save"
  | "user"
  | "errors"
  | "avatar"
  | "fileError"
  | "setFileError"
  | "setAvatar"
>) {
  return (
    <AccessibleForm
      error={save.error}
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(e.currentTarget);
      }}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <AccountField
          label="Nome de exibição"
          name="displayName"
          required
          minLength={2}
          defaultValue={user.displayName}
          error={errors.displayName}
        />
        <AccountField
          label="Nome de usuário"
          name="username"
          required
          minLength={3}
          defaultValue={user.username}
          error={errors.username}
        />
        <AccountField
          label="E-mail"
          name="email"
          type="email"
          required
          defaultValue={user.email}
          error={errors.email}
        />
        <AccountField
          label="Nome ENS"
          name="ens"
          defaultValue={user.ens ?? ""}
        />
        <AccountField
          label="Apelido da carteira"
          name="walletNickname"
          defaultValue={user.walletNickname ?? ""}
        />
        <div>
          <p className="mb-3 text-sm">Avatar</p>
          <div className="flex flex-wrap items-center gap-4">
            {avatar && (
              <img
                src={avatar}
                alt="Seu avatar"
                className="size-12 rounded-full object-cover"
              />
            )}
            <label className="avatar-upload cursor-pointer rounded-sm bg-primary px-5 py-3 text-sm font-bold text-ink">
              Alterar
              <input
                id="avatar"
                aria-invalid={!!fileError}
                aria-describedby={fileError ? "avatar-error" : undefined}
                aria-label="Alterar avatar"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!isValidAvatar(file)) {
                    setFileError("Escolha PNG, JPEG ou WebP de até 1 MB.");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    setAvatar(String(reader.result));
                    setFileError("");
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            <button type="button" onClick={() => setAvatar("")}>
              Remover
            </button>
          </div>
          {fileError && (
            <p id="avatar-error" role="alert">
              {fileError}
            </p>
          )}
        </div>
      </div>
      <Feedback mutation={save} />
      <SaveButton pending={save.isPending} />
    </AccessibleForm>
  );
}
