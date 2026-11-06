import { useQuery } from "@tanstack/react-query";
import { catalogOptions } from "@/api/client";
import { Route } from "../index";
import { ArrowRight } from "react-iconly";

import { Button } from "@/components/ui/button";

function Pagination() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data } = useQuery(catalogOptions(search));
  const PAGES = Array.from({ length: data?.pages ?? 0 }, (_, i) => i + 1);
  const page = search.page;
  const setPage = (value: number) =>
    void navigate({ search: { ...search, page: value } });

  return (
    <nav
      className="flex flex-wrap items-center justify-end gap-2"
      aria-label="Paginação"
    >
      {PAGES.map((item) => (
        <Button
          key={item}
          className={page === item ? "bg-primary" : "bg-surface-card"}
          variant={page === item ? "default" : "ghost"}
          size="icon"
          aria-current={page === item ? "page" : undefined}
          onClick={() => setPage(item)}
        >
          {item}
        </Button>
      ))}

      <Button
        className="bg-surface-card [&>svg]:size-4"
        variant="ghost"
        size="icon"
        aria-label="Próxima página"
        onClick={() => setPage(Math.min(page + 1, PAGES.length))}
      >
        <ArrowRight />
      </Button>
    </nav>
  );
}

export { Pagination };
