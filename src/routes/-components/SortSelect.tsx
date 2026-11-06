// Só aparece no desktop (lg+).
function SortSelect() {
  return (
    <label className="hidden shrink-0 items-center gap-2 text-xs text-secondary lg:flex">
      Ordenar por:
      <select
        className="cursor-pointer rounded-sm bg-transparent py-1 text-font-primary outline-none focus-visible:ring-1 focus-visible:ring-primary"
        defaultValue="recent"
      >
        <option className="bg-surface-card" value="recent">
          Listados recentemente
        </option>
        <option className="bg-surface-card" value="price-asc">
          Menor preço
        </option>
        <option className="bg-surface-card" value="price-desc">
          Maior preço
        </option>
      </select>
    </label>
  );
}

export { SortSelect };
