import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    titleId = useId();
  useEffect(() => {
    if (!open) return;
    const trigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialog.current?.showModal();
    return () => {
      dialog.current?.close();
      if (trigger?.isConnected) trigger.focus();
    };
  }, [open]);
  return (
    <dialog
      ref={dialog}
      aria-modal="true"
      aria-labelledby={titleId}
      className="m-auto max-h-[90dvh] w-[min(90vw,28rem)] overflow-y-auto rounded-2xl border border-border bg-surface-card p-6 text-foreground backdrop:bg-ink/80"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const controls = Array.from(
          e.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]',
          ),
        ).filter((el) => el.getClientRects().length);
        const first = controls.at(0),
          last = controls.at(-1);
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }}
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 id={titleId} className="font-bold">
          {title}
        </h2>
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="rounded-full px-3 py-2"
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
