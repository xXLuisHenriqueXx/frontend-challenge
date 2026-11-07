import type { Quote } from "@/features/cart/types/contracts";
import type { Wallet } from "@/features/wallets/types/contracts";

export interface Order {
  outcome?: "confirmed" | "refused";
  id: string;
  userId: string;
  status: "pending" | "confirmed" | "refused";
  quote: Quote;
  wallet: Wallet;
  transactionId: string;
  createdAt: number;
  version: number;
}

export interface OrderInput {
  connectionId?: string;
  collector?: Partial<Record<string, string>>;
  quoteId: string;
  walletId: string;
}
