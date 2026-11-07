import { AccessibleForm } from "@/shared/components/accessible-form";
import {
  AccountField,
  Feedback,
  SaveButton,
} from "@/shared/components/account";
import type { useProfileForm } from "../hooks/use-profile-form";

export function PasswordForm({
  password,
}: Pick<ReturnType<typeof useProfileForm>, "password">) {
  return (
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
  );
}
