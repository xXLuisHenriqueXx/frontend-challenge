import { cn } from "cn";
import * as React from "react";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "group/card flex flex-col gap-2 overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

export { Card };
