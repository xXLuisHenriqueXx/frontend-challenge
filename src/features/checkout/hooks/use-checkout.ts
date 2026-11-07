import { quoteOptions } from "@/features/cart/api/queries";
import { useQuote } from "@/features/cart/hooks/use-quote";
import type { Quote } from "@/features/cart/types/contracts";
import { createOrder } from "@/features/orders/api/queries";
import type { OrderInput } from "@/features/orders/types/contracts";
import { queryClient, send } from "@/shared/api/http";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { useRef, useState } from "react";

export const quoteFingerprint = (quote: Quote) =>
  JSON.stringify({
    items: quote.items,
    subtotal: quote.subtotal,
    discount: quote.discount,
    fee: quote.fee,
    total: quote.total,
    coupon: quote.coupon,
  });
interface Attempt {
  key: string;
  input?: OrderInput;
}
export function useCheckout(id: string, walletId: string, network: string) {
  const form = useRef<HTMLFormElement>(null),
    quote = useQuote(id),
    navigate = useNavigate();
  const [connectionId, setConnection] = useState(""),
    [reviewed, setReviewed] = useState("");
  const attemptKey = "kurio.attempt." + id,
    draftKey = "kurio.checkout." + id;
  const [recovering, setRecovering] = useState(
    () => typeof window !== "undefined" && !!sessionStorage.getItem(attemptKey),
  );
  const [draft] = useState<Partial<Record<string, string>>>(
    () =>
      JSON.parse(
        typeof window !== "undefined"
          ? (sessionStorage.getItem(draftKey) ?? "{}")
          : "{}",
      ) as Record<string, string>,
  );
  const persist = () => {
    if (form.current)
      sessionStorage.setItem(
        draftKey,
        JSON.stringify(Object.fromEntries(new FormData(form.current))),
      );
  };
  const connect = useMutation({
    mutationFn: async () => {
      if (connectionId) {
        await send("/wallet-connection", undefined, "DELETE");
        setConnection("");
      } else {
        const result = await send<{ connectionId: string }>(
          "/wallet-connection",
          { walletId, network },
        );
        setConnection(result.connectionId);
      }
      setReviewed("");
    },
  });
  const submitting = useRef(false);
  const mutation = useMutation({
    mutationFn: async () => {
      if (submitting.current) return;
      submitting.current = true;
      try {
        const stored = sessionStorage.getItem(attemptKey);
        let attempt: Attempt;
        if (stored) attempt = JSON.parse(stored) as Attempt;
        else {
          if (!form.current?.reportValidity()) return;
          if (!connectionId)
            throw new Error("Conecte a carteira antes de revisar a compra.");
          persist();
          const collector = Object.fromEntries(
            new FormData(form.current),
          ) as Record<string, string>;
          const fresh = await send<Quote>("/quote");
          queryClient.setQueryData(quoteOptions(id).queryKey, fresh);
          const fingerprint = quoteFingerprint(fresh);
          if (!quote.data || fingerprint !== quoteFingerprint(quote.data)) {
            setReviewed("");
            throw new Error(
              "Valores alterados. Revise a nova cotação e confirme novamente.",
            );
          }
          if (reviewed !== fingerprint) {
            setReviewed(fingerprint);
            return;
          }
          attempt = {
            key: crypto.randomUUID(),
            input: { quoteId: fresh.id, walletId, connectionId, collector },
          };
          sessionStorage.setItem(attemptKey, JSON.stringify(attempt));
          setRecovering(true);
        }
        try {
          // Compatibility with a pending attempt persisted by stage 2.
          const input = attempt.input ?? (attempt as unknown as OrderInput);
          const order = await createOrder(input, attempt.key);
          sessionStorage.removeItem(attemptKey);
          sessionStorage.removeItem(draftKey);
          setRecovering(false);
          await navigate({
            to: "/payment/confirm",
            search: { orderId: order.id },
          });
        } catch (error) {
          if (
            isAxiosError(error) &&
            error.response &&
            error.response.status !== 401 &&
            error.response.status < 500
          ) {
            sessionStorage.removeItem(attemptKey);
            setRecovering(false);
            setReviewed("");
            await quote.refetch();
          }
          throw error;
        }
      } finally {
        submitting.current = false;
      }
    },
  });
  return {
    form,
    quote,
    mutation,
    connect,
    connected: !!connectionId,
    draft,
    persist,
    recovering,
    reviewed:
      !quote.isError &&
      !!quote.data &&
      reviewed === quoteFingerprint(quote.data),
    resetConnection: () => {
      setConnection("");
      setReviewed("");
    },
    resetReview: () => setReviewed(""),
  };
}
