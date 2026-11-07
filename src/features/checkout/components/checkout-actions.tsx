import { Button } from "@/components/ui/button";
import { message } from "@/shared/lib/errors";
import type { CheckoutPageModel } from "../types/checkout-page-model";
import { CheckoutWalletOptions } from "./checkout-wallet-options";

export function CheckoutActions({
  navigate,
  savedWallets,
  walletId,
  setSavedWallet,
  setNetworkChoice,
  checkout,
  checkoutItems,
  quote,
  provider,
  setProvider,
  mutation,
}: Pick<
  CheckoutPageModel,
  | "navigate"
  | "savedWallets"
  | "walletId"
  | "setSavedWallet"
  | "setNetworkChoice"
  | "checkout"
  | "checkoutItems"
  | "quote"
  | "provider"
  | "setProvider"
  | "mutation"
>) {
  return (
    <aside className="flex flex-1 flex-col justify-between gap-6 lg:flex-none lg:justify-start lg:gap-5">
      <CheckoutWalletOptions
        navigate={navigate}
        savedWallets={savedWallets}
        walletId={walletId}
        setSavedWallet={setSavedWallet}
        setNetworkChoice={setNetworkChoice}
        checkout={checkout}
        checkoutItems={checkoutItems}
        quote={quote}
        provider={provider}
        setProvider={setProvider}
      />

      <Button
        onClick={() => checkout.connect.mutate()}
        disabled={checkout.connect.isPending || !walletId}
        variant="outline"
      >
        {checkout.connected ? "Desconectar carteira" : "Conectar carteira"}
      </Button>
      {checkout.connect.isError && (
        <p role="alert">{message(checkout.connect.error)}</p>
      )}
      {checkout.reviewed && (
        <p role="status">
          Revise os itens, a carteira, a rede e o total acima. Confirme para
          enviar o pedido.
        </p>
      )}
      <Button
        disabled={
          mutation.isPending ||
          (!checkout.recovering &&
            (!walletId || quote.isError || !quote.data?.items.length))
        }
        form="collector-form"
        type={checkout.recovering ? "button" : "submit"}
        onClick={checkout.recovering ? () => mutation.mutate() : undefined}
        className="w-full rounded-full lg:rounded-md lg:h-11"
      >
        {checkout.recovering
          ? "Recuperar tentativa"
          : checkout.reviewed
            ? "Confirmar compra"
            : "Revisar compra"}
      </Button>
    </aside>
  );
}
