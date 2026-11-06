import { Route } from "../index";
import { Filter, Search } from "react-iconly";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SearchBar() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <nav className="flex items-center gap-4 -mb-8">
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

        <Button className="rounded-xl [&>svg]:size-5.5" size="icon-sm">
          <Filter />
        </Button>
      </div>
    </nav>
  );
}

export { SearchBar };
