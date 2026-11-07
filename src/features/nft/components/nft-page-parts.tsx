export function TabButton({
  id,
  active,
  onClick,
  children,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-controls="nft-tabpanel"
      tabIndex={active ? 0 : -1}
      onKeyDown={(e) => {
        const tabs = Array.from(
          e.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>(
            '[role="tab"]',
          ),
        );
        const current = tabs.indexOf(e.currentTarget);
        const next =
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? tabs.length - 1
              : e.key === "ArrowRight"
                ? (current + 1) % tabs.length
                : e.key === "ArrowLeft"
                  ? (current + tabs.length - 1) % tabs.length
                  : -1;
        if (next >= 0) {
          e.preventDefault();
          tabs[next].focus();
          tabs[next].click();
        }
      }}
      aria-selected={active}
      onClick={onClick}
      className={
        active
          ? "-mb-px border-b-2 border-font-accent pb-3 font-bold text-font-accent"
          : "pb-3 text-secondary hover:text-foreground"
      }
    >
      {children}
    </button>
  );
}
