import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Wallet as WalletData } from "@/features/wallets/types/contracts";
import { useNavigate } from "@tanstack/react-router";
import { EllipsisVertical } from "lucide-react";

export function SavedWalletCard({
  wallet,
  checked,
  onSelect,
}: {
  wallet: WalletData;
  checked: boolean;
  onSelect: () => void;
}) {
  const navigate = useNavigate();
  return (
    <Card className="flex flex-row gap-2 items-center justify-between w-full min-h-22.5 px-5 py-4 bg-surface-card rounded-xl">
      <label className="flex flex-1 flex-row gap-5 items-center cursor-pointer">
        <input
          aria-label={wallet.name}
          type="radio"
          name="saved-wallet"
          checked={checked}
          onChange={onSelect}
        />

        <div>
          <p className="mb-2 font-bold">{wallet.name}</p>
          <p className="text-sm text-font-secondary">{wallet.address}</p>
          <p className="text-sm text-font-secondary">{wallet.network}</p>
        </div>
      </label>

      <Button
        className="size-10"
        variant="ghost"
        size="icon"
        aria-label={`Opções da carteira ${wallet.name}`}
        onClick={() => void navigate({ to: "/wallets" })}
      >
        <EllipsisVertical />
      </Button>
    </Card>
  );
}
