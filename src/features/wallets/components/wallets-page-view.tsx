import { AccountLayout } from "@/shared/components/account";
import { RemoteState } from "@/shared/components/remote-state";
import type { useWalletsPage } from "../hooks/use-wallets-page";
import { WalletForm } from "./wallets-page-parts";

export function WalletsPageView({ query }: ReturnType<typeof useWalletsPage>) {
  return (
    <AccountLayout>
      <h1 className="sr-only">Suas carteiras</h1>
      <RemoteState query={query} />
      {query.data && (
        <>
          {(["primary", "secondary"] as const).map((role, i) => (
            <WalletForm
              key={role + (query.data[i]?.id ?? "")}
              role={role}
              wallet={query.data[i]}
            />
          ))}
        </>
      )}
    </AccountLayout>
  );
}
