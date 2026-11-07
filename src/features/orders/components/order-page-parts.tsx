import { cn } from "cn";

export function SummaryItem({
  label,
  value,
  bold,
  divider,
  valueClassName,
}: {
  label: string;
  value: string;
  bold?: boolean;
  divider?: boolean;
  valueClassName?: string;
}) {
  return (
    <div
      className={`px-3 first:pl-0 sm:px-4 ${
        divider ? "sm:border-l sm:border-primary" : ""
      } [&:nth-child(2n)]:border-l [&:nth-child(2n)]:border-primary sm:[&:nth-child(2n)]:border-l-0 sm:[&:nth-child(2n)]:border-primary`}
    >
      <dt
        className={cn("text-secondary", {
          "font-bold": bold,
        })}
      >
        {label}
      </dt>
      <dd className={cn("text-font-secondary", valueClassName)}>{value}</dd>
    </div>
  );
}
