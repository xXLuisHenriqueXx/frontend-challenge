import {
  fieldClass,
  WALLET_PROVIDERS,
} from "@/features/checkout/lib/presentation";
import { Field } from "@/shared/components/labeled-field";
import type { CheckoutPageModel } from "../types/checkout-page-model";

export function CollectorWalletFields({
  selectedWallet,
  checkout,
  provider,
  setProvider,
}: Pick<
  CheckoutPageModel,
  "selectedWallet" | "checkout" | "provider" | "setProvider"
>) {
  return (
    <>
      <Field label="Endereço da carteira" required>
        <input
          className={fieldClass}
          name="walletAddress"
          required
          readOnly
          value={selectedWallet?.address ?? ""}
          placeholder="Endereço 0x da carteira"
        />
      </Field>

      <Field label="&nbsp;" className="[&>span]:invisible">
        <input
          className={fieldClass}
          name="secondaryWallet"
          defaultValue={checkout.draft.secondaryWallet ?? ""}
          placeholder="ENS ou carteira secundária (opcional)"
        />
      </Field>

      <Field label="Tipo de carteira" required>
        <select
          className={fieldClass}
          name="walletType"
          required
          value={provider}
          onChange={(e) => {
            setProvider(e.target.value);
            checkout.resetConnection();
          }}
        >
          <option value="" disabled>
            Selecione uma carteira
          </option>
          {WALLET_PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Código de indicação" required>
        <input
          className={fieldClass}
          name="referralCode"
          required
          minLength={3}
          defaultValue={checkout.draft.referralCode ?? ""}
        />
      </Field>
    </>
  );
}
