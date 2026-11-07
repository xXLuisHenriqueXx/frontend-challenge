import { useRealtimeStatus } from "../hooks/use-realtime-status";

export function Realtime() {
  const notice = useRealtimeStatus();
  return (
    <p
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={
        notice
          ? "mx-auto max-w-300 px-6 py-2 text-sm text-font-accent"
          : "sr-only"
      }
    >
      {notice}
    </p>
  );
}
