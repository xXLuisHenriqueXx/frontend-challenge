export interface Nft {
  id: string;
  name: string;
  price: string;
  collection: string;
  network: string;
  category: string;
  stock: number;
  version: number;
  rating: number;
  reviews: number;
  description: string;
  editions: string[];
  activeEdition: string;
  tokenId: string;
  attributes: string;
  images: string[];
}
