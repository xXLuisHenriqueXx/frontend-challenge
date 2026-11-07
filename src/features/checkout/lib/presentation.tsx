import { Wallet } from "react-iconly";

export const WALLET_PROVIDERS = [
  { id: "walletconnect", name: "WalletConnect", icon: "W" },
  { id: "metamask", name: "MetaMask", icon: "M" },
  { id: "coinbase", name: "Coinbase Wallet", icon: <Wallet /> },
];
export const BREADCRUMB = ["Início", "Mercado", "Pagamento"];
export const fieldClass =
  "h-11 w-full rounded-md border border-border bg-surface-card px-3 text-sm text-foreground placeholder:text-font-secondary outline-none focus-visible:border-font-accent";
