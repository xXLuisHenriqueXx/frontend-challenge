import { Card } from "@/components/ui/card";
import type { WALLET_PROVIDERS } from "../lib/presentation";

export function ProviderCard({
  provider,
  checked,
  onSelect,
}: {
  provider: (typeof WALLET_PROVIDERS)[number];
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      className={`w-full min-h-22.5 px-5 py-4 bg-surface-card rounded-xl transition-colors lg:min-h-0 lg:py-3 ${
        checked ? "lg:border-font-accent" : ""
      }`}
    >
      <label className="flex flex-row items-center justify-between cursor-pointer">
        <div className="flex flex-row gap-3 items-center">
          <div className="flex items-center justify-center size-10 bg-surface-raised border border-border rounded-full text-sm font-bold text-font-accent">
            {provider.icon}
          </div>

          <span className="text-sm">{provider.name}</span>
        </div>

        <input
          type="radio"
          name="provider"
          checked={checked}
          onChange={onSelect}
        />
      </label>
    </Card>
  );
}
