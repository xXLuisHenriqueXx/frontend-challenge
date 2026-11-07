export function SummaryRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between text-sm">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      {hint && (
        <span className="mt-1 text-center text-xs text-font-accent">
          {hint}
        </span>
      )}
    </div>
  );
}
