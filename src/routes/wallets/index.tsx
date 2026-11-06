import { AccessibleForm } from "@/components/AccessibleForm";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AccountField,
  AccountLayout,
  errorsFor,
  Feedback,
  SaveButton,
} from "@/components/Account";
import { queryClient, requireSession, send, walletOptions } from "@/api/client";
import { RemoteState, useIdentity } from "@/api/hooks";
import type { Wallet } from "@/api/contracts";

export const Route = createFileRoute("/wallets/")({
  beforeLoad: ({ location }) => requireSession(location),
  component: Wallets,
});
function Wallets() {
  const { id } = useIdentity();
  const query = useQuery(walletOptions(id));
  return (
    <AccountLayout>
      <h1 className="sr-only">Suas carteiras</h1>
      <RemoteState query={query} />
      {query.data && (
        <>
          {(["primary", "secondary"] as const).map((role, i) => (
            <WalletForm
              key={role + (query.data[i]?.id ?? "")}
              role={role}
              wallet={query.data[i]}
            />
          ))}
        </>
      )}
    </AccountLayout>
  );
}
function WalletForm({
  wallet,
  role,
}: {
  wallet?: Wallet;
  role: "primary" | "secondary";
}) {
  const mutation = useMutation({
    mutationFn: (form: HTMLFormElement) =>
      send(
        wallet ? `/wallets/${wallet.id}` : "/wallets",
        { ...Object.fromEntries(new FormData(form)), role },
        wallet ? "PATCH" : "POST",
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["private"] }),
  });
  const errors = errorsFor(mutation.error);
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
