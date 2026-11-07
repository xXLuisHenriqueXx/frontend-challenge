import { buttonVariants } from "@/components/ui/button";
import { BREADCRUMB } from "@/features/checkout/lib/presentation";
import { RemoteState } from "@/shared/components/remote-state";
import { Footer } from "@/shared/components/site-footer";
import { Header } from "@/shared/components/site-header";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "react-iconly";
import type { useCheckoutPage } from "../hooks/use-checkout-page";
import { CheckoutActions } from "./checkout-actions";
import { CollectorForm } from "./collector-form";

export function CheckoutPageView({
  navigate,
  wallets,
  savedWallets,
  setSavedWallet,
  walletId,
  provider,
  setProvider,
  selectedWallet,
  setNetworkChoice,
  network,
  checkout,
  quote,
  mutation,
  session,
  checkoutItems,
}: ReturnType<typeof useCheckoutPage>) {
  return (
    <>
      <Header />
      <main className="checkout-page mx-auto flex flex-col w-full max-w-300 min-h-dvh py-8 px-7 lg:min-h-0 lg:px-6 lg:py-10">
        <h1 className="sr-only">Pagamento com carteira</h1>
        <RemoteState query={wallets} />
        <RemoteState query={quote} />

        <header className="flex flex-row items-center mb-4 lg:hidden">
          <Link
            to="/"
            search={{
              q: "",
              collection: "",
              network: "",
              category: "",
              sort: "recent",
              page: 1,
              min: "0",
              max: "100",
            }}
            className={buttonVariants({
              className: "size-8.75 rounded-full",
              variant: "outline",
              size: "icon",
            })}
            aria-label="Voltar"
          >
            <ChevronLeft />
          </Link>

          <p className="mx-auto text-xl font-bold">Pagamento com carteira</p>
        </header>

        <nav
          aria-label="Breadcrumb"
          className="hidden lg:mb-10 lg:block text-sm font-bold"
        >
          {BREADCRUMB.map((item, i) => (
            <span key={item}>
              {i > 0 && " / "}
              {item}
            </span>
          ))}
        </nav>

        <div className="checkout-columns flex flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,1fr)_405px]">
          <CollectorForm
            mutation={mutation}
            checkout={checkout}
            session={session}
            network={network}
            setNetworkChoice={setNetworkChoice}
            selectedWallet={selectedWallet}
            provider={provider}
            setProvider={setProvider}
            navigate={navigate}
          />

          <CheckoutActions
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
            mutation={mutation}
          />
        </div>
      </main>
      <div className="mx-auto mt-30 hidden w-full max-w-300 px-8 pb-16 lg:block">
        <Footer />
      </div>
    </>
  );
}
