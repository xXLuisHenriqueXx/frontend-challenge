import { AccessibleForm } from "@/components/AccessibleForm";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  AccountField,
  AccountLayout,
  errorsFor,
  Feedback,
  SaveButton,
} from "@/components/Account";
import {
  profileOptions,
  queryClient,
  requireSession,
  send,
} from "@/api/client";
import { RemoteState, useIdentity } from "@/api/hooks";
import type { User } from "@/api/contracts";

export const Route = createFileRoute("/profile/")({
  beforeLoad: ({ location }) => requireSession(location),
  component: Profile,
});
function Profile() {
  const { id } = useIdentity();
  const query = useQuery(profileOptions(id));
  return (
    <AccountLayout>
      <h1 className="mb-8 font-bold">Perfil do colecionador</h1>
      <RemoteState query={query} />
      {query.data && <ProfileForm key={id} user={query.data} />}
    </AccountLayout>
  );
}
function ProfileForm({ user }: { user: User }) {
  const [avatar, setAvatar] = useState(user.avatar),
    [fileError, setFileError] = useState("");
  const save = useMutation({
    mutationFn: (form: HTMLFormElement) =>
      send(
        "/profile",
        { ...Object.fromEntries(new FormData(form)), avatar },
        "PATCH",
      ),
    onSuccess: () => queryClient.invalidateQueries(),
  });
  const password = useMutation({
    mutationFn: async (form: HTMLFormElement) => {
      const data = Object.fromEntries(new FormData(form));
      if (data.password !== data.confirmPassword)
        throw new Error("As senhas devem coincidir");
      await send("/profile/password", data);
      form.reset();
    },
  });
  const errors = errorsFor(save.error);
  return (
    <>
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
                    if (
                      file.size > 1000000 ||
                      !["image/png", "image/jpeg", "image/webp"].includes(
                        file.type,
                      )
                    ) {
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
      <AccessibleForm
        error={password.error}
        className="mt-8 max-w-105 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          password.mutate(e.currentTarget);
        }}
      >
        <h2 className="font-bold">Alterar senha</h2>
        <AccountField
          label="Senha atual"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
        <AccountField
          label="Nova senha"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <AccountField
          label="Confirmar nova senha"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Feedback mutation={password} />
        <SaveButton pending={password.isPending}>Salvar senha</SaveButton>
      </AccessibleForm>
    </>
  );
}
