import { fieldClass } from "@/features/checkout/lib/presentation";
import { Field } from "@/shared/components/labeled-field";
import type { CheckoutPageModel } from "../types/checkout-page-model";

export function CollectorIdentityFields({
  checkout,
  session,
  network,
  setNetworkChoice,
}: Pick<
  CheckoutPageModel,
  "checkout" | "session" | "network" | "setNetworkChoice"
>) {
  return (
    <>
      <Field label="Nome de exibição" required>
        <input
          className={fieldClass}
          name="displayName"
          required
          minLength={2}
          defaultValue={
            checkout.draft.displayName ?? session.data?.user.displayName
          }
        />
      </Field>

      <Field label="Nome de usuário" required>
        <input
          className={fieldClass}
          name="username"
          required
          minLength={3}
          defaultValue={checkout.draft.username ?? session.data?.user.username}
        />
      </Field>

      <Field label="Rede" required>
        <select
          className={fieldClass}
          name="network"
          required
          value={network}
          onChange={(e) => {
            setNetworkChoice(e.target.value);
            checkout.resetConnection();
          }}
        >
          <option value="" disabled>
            Selecione uma rede
          </option>
          <option value="Ethereum">Ethereum</option>
          <option value="Polygon">Polygon</option>
          <option value="Solana">Solana</option>
        </select>
      </Field>

      <Field label="Nome do perfil" required>
        <input
          className={fieldClass}
          name="profileName"
          required
          defaultValue={
            checkout.draft.profileName ?? session.data?.user.displayName
          }
        />
      </Field>
    </>
  );
}
