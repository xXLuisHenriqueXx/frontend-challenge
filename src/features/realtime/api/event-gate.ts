import type { ResourceEvent } from "../types/contracts";

const MAX_RECENT_EVENTS = 1000;
export function eventGate() {
  const seen = new Set<string>(),
    versions = new Map<string, number>(),
    terminal = new Set<string>();
  return (name: string, event: ResourceEvent) => {
    const key = name + ":" + event.resourceId;
    if (
      seen.has(event.eventId) ||
      event.version <= (versions.get(key) ?? -1) ||
      terminal.has(key)
    )
      return false;
    seen.add(event.eventId);
    if (seen.size > MAX_RECENT_EVENTS) seen.delete(seen.values().next().value!);
    versions.set(key, event.version);
    if (
      name === "order.updated" &&
      ("status" in event.data ? event.data.status : undefined) !== "pending"
    )
      terminal.add(key);
    return true;
  };
}
