import { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "group/button flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding font-bold whitespace-nowrap transition-[background-color,color,border-color,box-shadow,transform] duration-300 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-border active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-error aria-invalid:ring-3 aria-invalid:ring-error/20 dark:aria-invalid:border-error/50 dark:aria-invalid:ring-error/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-5 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-ink hover:bg-primary/80",
        outline:
          "border-border bg-surface-raised hover:bg-surface-dark hover:text-primary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost: "hover:bg-primary/10 text-secondary hover:text-primary",
        destructive:
          "bg-error/10 text-error hover:bg-error/20 focus-visible:border-error/40 focus-visible:ring-error/20 dark:bg-error/20 dark:hover:bg-error/30 dark:focus-visible:ring-error/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-15 gap-1.5 px-6 lg:h-11",
        link: "w-fit h-fit gap-1.5 p-0",
        icon: "size-11",
        sm: "h-15 gap-1.5 px-6",
        "icon-sm": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
