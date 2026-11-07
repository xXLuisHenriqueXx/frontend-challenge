import type { ReactNode } from "react";
import { Children, cloneElement, isValidElement, useId } from "react";

export function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const titleId = useId();
  const attach = (node: ReactNode): ReactNode =>
    Children.map(node, (child) => {
      if (!isValidElement<Record<string, unknown>>(child)) return child;
      const element = child;
      if (
        typeof element.type === "string" &&
        ["input", "select", "textarea"].includes(element.type)
      )
        return cloneElement(element, {
          "aria-labelledby": element.props["aria-label"] ? undefined : titleId,
        });
      if (element.props.children)
        return cloneElement(element, {
          children: attach(element.props.children as ReactNode),
        });
      return child;
    });
  return (
    <div
      role="group"
      aria-labelledby={titleId}
      className={`flex flex-col gap-2 text-sm ${className ?? ""}`}
    >
      <span id={titleId}>
        {label === "&nbsp;" ? "Carteira secundária (opcional)" : label}
        {required && (
          <span className="ml-0.5 text-font-accent" aria-hidden="true">
            *
          </span>
        )}
      </span>
      {attach(children)}
    </div>
  );
}
