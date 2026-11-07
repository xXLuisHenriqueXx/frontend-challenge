import type { Order } from "../types/contracts";

export type PaymentStatus = "success" | "pending" | "failed";
export const failureReason = "Transação rejeitada na carteira";
export const statusConfig = {
  success: {
    title: "Seus NFTs agora estão na sua carteira",
    statusLabel: "Confirmada",
    detailsTitle: "Detalhes da transação",
    subtotalLabel: "Subtotal",
    totalLabel: "Total",
    footnote:
      "Compra confirmada na simulação. Este recibo não representa uma transferência real na blockchain.",
    cta: "Transação simulada",
  },
  pending: {
    title: "Aguardando confirmação da rede",
    statusLabel: "Pendente",
    detailsTitle: "NFTs reservados",
    subtotalLabel: "Subtotal",
    totalLabel: "Total estimado",
    footnote:
      "Sua transação foi enviada e está aguardando confirmação na Ethereum. Isso pode levar alguns minutos. Você pode fechar esta página, os NFTs aparecerão na sua carteira assim que a rede confirmar.",
    cta: "Transação simulada",
  },
  failed: {
    title: "Pagamento recusado",
    statusLabel: "Recusada",
    detailsTitle: "NFTs não adquiridos",
    subtotalLabel: "Subtotal",
    totalLabel: "Total não cobrado",
    footnote:
      "Nenhum NFT foi transferido para sua carteira e nenhum valor foi cobrado pela compra. Verifique o saldo e a rede selecionada na carteira e tente novamente.",
    cta: "Tentar novamente",
  },
} satisfies Record<PaymentStatus, Record<string, string>>;
export type ReceiptState = {
  [Status in PaymentStatus]: {
    status: Status;
    config: (typeof statusConfig)[Status];
  };
}[PaymentStatus];
export function receiptState(order: Order): ReceiptState {
  if (order.status === "confirmed")
    return { status: "success", config: statusConfig.success };
  if (order.status === "refused")
    return { status: "failed", config: statusConfig.failed };
  return { status: "pending", config: statusConfig.pending };
}
