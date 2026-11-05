import { Link } from "@tanstack/react-router";
import { ArrowRight } from "react-iconly";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  title: string;
  description: string;
  image: string;
  link: string;
}

function PromoCard({ title, description, image, link }: Props) {
  return (
    <Card className="flex flex-row items-center min-w-[92.5%] h-38 rounded-lg bg-surface-card">
      <img
        className="h-full aspect-square rounded-[16px]"
        src={image}
        alt="Monkey"
      />

      <div className="flex flex-col items-end gap-2 text-end p-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-xs text-secondary">{description}</p>

        <Link to={link}>
          <Button className="bg-primary" size="sm">
            Explorar <ArrowRight />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default PromoCard;
