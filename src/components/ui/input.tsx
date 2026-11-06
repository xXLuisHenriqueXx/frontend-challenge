import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12.5 w-full min-w-0 rounded-lg border border-border bg-transparent px-4 text-base transition-colors duration-300 outline-none placeholder:text-secondary focus-visible:border-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error aria-invalid:ring-3 aria-invalid:ring-error/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
