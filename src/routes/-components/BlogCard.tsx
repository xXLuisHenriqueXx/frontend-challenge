import { Link } from "@tanstack/react-router";
import { ArrowRight } from "react-iconly";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  title: string;
  description: string;
  link: string;
  publishedAt: string;
  durationInMinutes: number;
  image: string;
}

function BlogCard({
  title,
  description,
  link,
  publishedAt,
  durationInMinutes,
  image,
}: Props) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
    });
  };

  return (
    <Link to={link}>
      <Card className="w-68 bg-surface-card rounded-sm">
        <img className="w-full h-48 object-cover" src={image} alt="Monkey" />

        <div className="space-y-2 p-4">
          <p className="text-xs font-medium text-secondary">
            {formatDate(publishedAt)} | {durationInMinutes} min
          </p>
          <h3 className="font-bold text-font-primary">{title}</h3>
          <p className="text-xs font-medium text-secondary">{description}</p>

          <Button className="[&>svg]:size-4" variant="link" size="link">
            Ler mais <ArrowRight />
          </Button>
        </div>
      </Card>
    </Link>
  );
}

export { BlogCard };
