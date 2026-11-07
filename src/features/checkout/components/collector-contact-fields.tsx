import { fieldClass } from "@/features/checkout/lib/presentation";
import { Field } from "@/shared/components/labeled-field";
import type { CheckoutPageModel } from "../types/checkout-page-model";

export function CollectorContactFields({
  checkout,
  session,
  navigate,
}: Pick<CheckoutPageModel, "checkout" | "session" | "navigate">) {
  return (
    <>
      <Field label="E-mail" required>
        <input
          className={fieldClass}
          name="email"
          type="email"
          required
          defaultValue={checkout.draft.email ?? session.data?.user.email}
        />
      </Field>

      <Field label="Nome ENS" required>
        <div className="flex gap-2">
          <select
            className={`${fieldClass} w-auto self-start`}
            name="ens"
            defaultValue=".eth"
          >
            <option value=".eth">.eth</option>
          </select>
          <input
            className={fieldClass}
            name="ensName"
            aria-label="Nome ENS"
            required
            defaultValue={
              checkout.draft.ensName ??
              session.data?.user.ens ??
              session.data?.user.username
            }
          />
        </div>
      </Field>

      <label className="md:col-span-2 flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          name="useOtherWallet"
          onChange={(e) => {
            if (e.target.checked) void navigate({ to: "/wallets" });
          }}
        />
        Usar outra carteira?
      </label>

      <Field
        label="Observação do colecionador (opcional)"
        className="md:col-span-2"
      >
        <textarea
          className={`${fieldClass} h-40 resize-none py-3`}
          name="note"
          defaultValue={checkout.draft.note ?? ""}
        />
      </Field>
    </>
  );
}
