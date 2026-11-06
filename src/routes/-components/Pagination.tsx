import { useState } from "react";
import { ArrowRight } from "react-iconly";

import { Button } from "@/components/ui/button";

const PAGES = [1, 2, 3, 4];

function Pagination() {
  const [page, setPage] = useState(1);

  return (
    <nav
      className="hidden items-center justify-end gap-2 lg:flex"
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
        onClick={() =>
          setPage((current) => Math.min(current + 1, PAGES.length))
        }
      >
        <ArrowRight />
      </Button>
    </nav>
  );
}

export { Pagination };
