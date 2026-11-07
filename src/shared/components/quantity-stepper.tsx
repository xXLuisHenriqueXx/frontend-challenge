import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";
import type { ReactNode } from "react";

const stepperButton = cva("size-6 rounded-full", {
  variants: { context: { cart: "", detail: "lg:size-9" } },
});

export function QuantityStepper({
  context,
  quantity,
  stock,
  name,
  onDecrease,
  onIncrease,
  children,
}: {
  context: "cart" | "detail";
  quantity: number;
  stock: number;
  name?: string;
  onDecrease: () => void;
  onIncrease: () => void;
  children?: ReactNode;
}) {
  const suffix = name ? ` de ${name}` : "";
  return (
    <div
      className={
        context === "cart"
          ? "cart-quantity flex flex-row items-center gap-3"
          : "flex flex-row items-center gap-3"
      }
    >
      {children}
      <Button
        className={stepperButton({ context })}
        variant={context === "cart" ? "outline" : "default"}
        size="icon"
        aria-label={`Diminuir quantidade${suffix}`}
        disabled={quantity <= 1}
        onClick={onDecrease}
      >
        -
      </Button>
      <span className="text-lg font-medium tabular-nums">{quantity}</span>
      <Button
        className={stepperButton({ context })}
        variant={context === "cart" ? "outline" : "default"}
        size="icon"
        aria-label={`Aumentar quantidade${suffix}`}
        disabled={quantity >= stock}
        onClick={onIncrease}
      >
        +
      </Button>
    </div>
  );
}
