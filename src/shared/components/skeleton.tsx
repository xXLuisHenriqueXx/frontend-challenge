import { Card } from "@/components/ui/card";

export function CatalogSkeleton() {
  return (
    <section
      id="catalog"
      aria-busy="true"
      role="status"
      aria-label="Carregando catálogo"
      className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:gap-x-6 lg:gap-y-8"
    >
      {Array.from({ length: 9 }, (_, i) => (
        <Card key={i} className="catalog-card">
          <div className="nft-artwork-frame">
            <div className="skeleton aspect-square rounded-2xl" />
          </div>
          <div className="skeleton h-5.625 w-4/5 rounded lg:h-5" />
          <div className="skeleton h-4 w-1/2 rounded" />
        </Card>
      ))}
    </section>
  );
}
export function DetailSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Carregando NFT"
      className="detail-page w-full min-h-dvh pt-6 lg:mx-auto lg:max-w-300 lg:px-6 lg:pt-8 lg:pb-16"
    >
      <span role="status" className="sr-only">
        Carregando NFT
      </span>
      <div aria-hidden="true" className="mb-4 hidden h-5 lg:block" />
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
        <section className="flex flex-col gap-2 px-6 lg:flex-row lg:gap-4 lg:px-0">
          <div className="flex h-11 justify-between lg:hidden">
            <div className="skeleton size-11 rounded-full" />
            <div className="skeleton size-11 rounded-full" />
          </div>
          <div className="hidden w-25 shrink-0 flex-col gap-3 lg:flex">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="skeleton aspect-square rounded-xl border border-border"
              />
            ))}
          </div>
          <div className="lg:flex-1 lg:rounded-3xl lg:bg-surface-card lg:p-5">
            <div
              data-skeleton-artwork
              className="skeleton aspect-square w-full rounded-t-3xl lg:rounded-3xl"
            />
          </div>
        </section>
        <div className="space-y-6 rounded-t-3xl bg-surface-card p-6 lg:bg-transparent lg:p-0">
          <div className="skeleton h-9 w-3/4 rounded" />
          <div className="skeleton h-40 rounded-xl" />
          <div className="skeleton h-16 rounded-full" />
        </div>
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
