import { Route } from "../index";

function SortSelect() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <label className="flex shrink-0 items-center gap-2 text-xs text-secondary">
      Ordenar por:
      <select
        className="cursor-pointer rounded-sm bg-transparent py-1 text-font-primary outline-none focus-visible:ring-1 focus-visible:ring-primary"
        value={search.sort}
        onChange={(e) =>
          void navigate({
            search: {
              ...search,
              sort: e.target.value as typeof search.sort,
              page: 1,
            },
          })
        }
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
