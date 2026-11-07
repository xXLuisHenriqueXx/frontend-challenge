export interface User {
  ens?: string;
  walletNickname?: string;
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
}

export interface Session {
  token?: string;
  user: User;
  expiresAt: number;
}
