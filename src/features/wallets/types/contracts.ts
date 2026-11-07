export interface Wallet {
  role?: "primary" | "secondary";
  nickname?: string;
  profileName?: string;
  ens?: string;
  id: string;
  name: string;
  address: string;
  network: string;
}
