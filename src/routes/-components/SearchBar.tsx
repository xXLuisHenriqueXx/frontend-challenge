import { Route } from "../index";
import { useState } from "react";
import { Modal } from "@/components/Modal";
import { Sidebar } from "./Sidebar";
import { Filter, Search } from "react-iconly";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SearchBar() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <div className="catalog-search flex items-center gap-4 -mb-8">
      <div className="flex flex-row gap-2 items-center w-full">
        <div className="group/input flex flex-row items-center gap-2 w-full h-11.25 px-3 bg-surface-card border border-transparent focus-within:border-primary transition-colors duration-300 rounded-lg outline-none text-secondary [&>svg]:size-5.5">
          <Search />

          <Input
            aria-label="Buscar NFTs"
            value={search.q}
            onChange={(e) =>
              void navigate({
                search: { ...search, q: e.target.value, page: 1 },
              })
            }
            className="flex-1 border-transparent focus-visible:border-transparent font-bold p-0"
            placeholder="Explorar coleções"
          />
        </div>

        <Button
          aria-label="Abrir filtros"
          aria-haspopup="dialog"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen(true)}
          className="rounded-xl [&>svg]:size-5.5"
          size="icon-sm"
        >
          <Filter />
        </Button>
      </div>
      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filtrar NFTs"
      >
        <Sidebar mobile />
        <Button className="mt-6 w-full" onClick={() => setFiltersOpen(false)}>
          Concluir filtros
        </Button>
      </Modal>
    </div>
  );
}

export { SearchBar };
