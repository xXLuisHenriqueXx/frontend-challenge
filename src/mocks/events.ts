import type { ResourceEvent } from "../api/contracts";

const listeners = new Set<
  (name: "nft.updated" | "order.updated", event: ResourceEvent) => void
>();
export function publish(
  name: "nft.updated" | "order.updated",
  event: ResourceEvent,
) {
  for (const listener of listeners) listener(name, event);
}
export function subscribe(
  listener: (
    name: "nft.updated" | "order.updated",
    event: ResourceEvent,
  ) => void,
) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
