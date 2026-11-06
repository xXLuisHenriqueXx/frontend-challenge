export function CatalogSkeleton() {
  return (
    <section
      aria-busy="true"
      role="status"
      aria-label="Carregando catálogo"
      className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:gap-x-6 lg:gap-y-8"
    >
      <span className="sr-only">Carregando catálogo</span>
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className="space-y-3 rounded-xl bg-surface-card p-4">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="skeleton h-5 w-4/5 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
        </div>
      ))}
    </section>
  );
}
export function DetailSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Carregando NFT"
      className="mx-auto min-h-dvh max-w-300 px-6 py-8 lg:grid lg:grid-cols-2 lg:gap-10"
    >
      <span role="status" className="sr-only">
        Carregando NFT
      </span>
      <div className="skeleton aspect-square rounded-2xl" />
      <div className="space-y-6 py-8">
        <div className="skeleton h-9 w-3/4 rounded" />
        <div className="skeleton h-40 rounded-xl" />
        <div className="skeleton h-16 rounded-full" />
      </div>
    </main>
  );
}
export function SummarySkeleton() {
  return (
    <div
      aria-busy="true"
      role="status"
      aria-label="Carregando resumo"
      className="absolute inset-0 z-10 space-y-6 rounded-xl bg-surface-card p-6"
    >
      <span className="sr-only">Carregando resumo</span>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="skeleton h-6 rounded" />
      ))}
    </div>
  );
}
