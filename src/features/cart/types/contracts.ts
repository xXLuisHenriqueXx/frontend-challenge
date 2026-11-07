export interface CartLine {
  id: string;
  nftId: string;
  name: string;
  tokenId: string;
  edition: string;
  price: string;
  quantity: number;
  stock: number;
}

export interface Quote {
  id: string;
  items: CartLine[];
  subtotal: string;
  discount: string;
  fee: string;
  total: string;
  coupon: string;
  expiresAt: number;
}
