import type { Nft } from "@/features/nft/types/contracts";
import type { Order } from "@/features/orders/types/contracts";

export interface ResourceEvent {
  eventId: string;
  resourceId: string;
  version: number;
  userId?: string;
  sessionToken?: string;
  data: Nft | Order;
}
