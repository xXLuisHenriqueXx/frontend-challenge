import { NftImage } from "@/components/NftImage";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "react-iconly";

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
      timeZone: "UTC",
    });
  };

  return (
    <Link className="block shrink-0 lg:shrink" to={link}>
      <Card className="w-68 max-w-full h-full bg-surface-card rounded-sm lg:w-full">
        <NftImage
          loading="lazy"
          className="w-full h-48 object-cover"
          src={image}
          alt=""
        />

        <div className="space-y-2 p-4">
          <p className="text-xs font-medium text-secondary">
            {formatDate(publishedAt)} | {durationInMinutes} min de leitura
          </p>
          <h3 className="font-bold text-font-primary">{title}</h3>
          <p className="text-xs font-medium text-secondary">{description}</p>

          <span className="flex items-center gap-2 text-primary [&>svg]:size-4">
            Ler mais <ArrowRight />
          </span>
        </div>
      </Card>
    </Link>
  );
}

export { BlogCard };
