import { AccessibleForm } from "@/shared/components/accessible-form";
import type { CheckoutPageModel } from "../types/checkout-page-model";
import { CollectorContactFields } from "./collector-contact-fields";
import { CollectorIdentityFields } from "./collector-identity-fields";
import { CollectorWalletFields } from "./collector-wallet-fields";

export function CollectorForm({
  mutation,
  checkout,
  session,
  network,
  setNetworkChoice,
  selectedWallet,
  provider,
  setProvider,
  navigate,
}: Pick<
  CheckoutPageModel,
  | "mutation"
  | "checkout"
  | "session"
  | "network"
  | "setNetworkChoice"
  | "selectedWallet"
  | "provider"
  | "setProvider"
  | "navigate"
>) {
  return (
    <section>
      <h2 className="mb-4 font-bold">Perfil do colecionador</h2>

      <AccessibleForm
        error={mutation.error}
        ref={checkout.form}
        id="collector-form"
        onChange={() => {
          checkout.persist();
          checkout.resetReview();
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <CollectorIdentityFields
          checkout={checkout}
          session={session}
          network={network}
          setNetworkChoice={setNetworkChoice}
        />

        <CollectorWalletFields
          selectedWallet={selectedWallet}
          checkout={checkout}
          provider={provider}
          setProvider={setProvider}
        />

        <CollectorContactFields
          checkout={checkout}
          session={session}
          navigate={navigate}
        />
      </AccessibleForm>
    </section>
  );
}
