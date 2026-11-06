import { useState } from "react";

import { Button } from "@/components/ui/button";

const BUTTONS_DATA = [
  {
    id: "all",
    title: "Todos os NFTs",
  },
  {
    id: "new",
    title: "Novos lançamentos",
  },
  {
    id: "hot",
    title: "Em alta",
  },
];

function Categories() {
  const [active, setActive] = useState(BUTTONS_DATA[0].id);

  return (
    <nav className="flex w-full flex-row items-center gap-4 overflow-x-auto lg:w-auto lg:gap-6">
      {BUTTONS_DATA.map((button) => (
        <Button
          key={button.id}
          className={`text-sm whitespace-nowrap ${active === button.id ? "underline" : "text-foreground"}`}
          variant="link"
          size="link"
          onClick={() => setActive(button.id)}
        >
          {button.title}
        </Button>
      ))}
    </nav>
  );
}

export { Categories };
