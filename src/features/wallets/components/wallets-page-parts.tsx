import { AccessibleForm } from "@/shared/components/accessible-form";
import {
  AccountField,
  Feedback,
  SaveButton,
} from "@/shared/components/account";
import { useWalletForm } from "../hooks/use-wallet-form";

export function WalletForm(props: Parameters<typeof useWalletForm>[0]) {
  return <WalletFormView {...useWalletForm(props)} />;
}
export function WalletFormView({
  wallet,
  role,
  mutation,
  errors,
}: ReturnType<typeof useWalletForm>) {
  return (
    <AccessibleForm
      error={mutation.error}
      className="mb-10"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(e.currentTarget);
      }}
    >
      <h2 className="mb-2 font-bold">
        Carteira {role === "primary" ? "principal" : "secundária"}
      </h2>
      <p className="mb-8 text-sm text-font-secondary">
        Estas carteiras ficam disponíveis no pagamento e para receber NFTs
        comprados.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <AccountField
          label="Nome de exibição"
          name="name"
          required
          defaultValue={wallet?.name ?? ""}
          error={errors.name}
        />
        <AccountField
          label="Apelido da carteira"
          name="nickname"
          defaultValue={wallet?.nickname ?? ""}
        />
        <label className="flex flex-col gap-3 text-sm">
          Rede *
          <select
            name="network"
            required
            defaultValue={wallet?.network ?? ""}
            className="h-11 rounded-sm border border-border bg-surface-card px-3"
          >
            <option value="" disabled>
              Selecione uma rede
            </option>
            {["Ethereum", "Polygon", "Solana"].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <AccountField
          label="Nome do perfil"
          name="profileName"
          defaultValue={wallet?.profileName ?? ""}
        />
        <AccountField
          label="Endereço da carteira"
          name="address"
          required
          pattern="0x[a-fA-F0-9]{40}"
          defaultValue={wallet?.address ?? ""}
          placeholder="Endereço 0x da carteira"
          error={errors.address}
        />
        <AccountField
          label="Nome ENS (opcional)"
          name="ens"
          defaultValue={wallet?.ens ?? ""}
        />
      </div>
      <Feedback mutation={mutation} />
      <SaveButton pending={mutation.isPending}>Salvar carteira</SaveButton>
    </AccessibleForm>
  );
}
