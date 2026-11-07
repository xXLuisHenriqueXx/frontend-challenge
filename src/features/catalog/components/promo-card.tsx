import { buttonVariants } from "@/components/ui/button";
import { NftImage } from "@/shared/components/nft-image";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "react-iconly";

import { Card } from "@/components/ui/card";

interface Props {
  title: string;
  description: string;
  image: string;
  link: string;
}

function PromoCard({ title, description, image, link }: Props) {
  return (
    <Card className="flex flex-row items-center min-w-[92.5%] h-38 rounded-lg bg-surface-card lg:min-w-0 lg:h-44">
      <NftImage
        className="h-full w-38 shrink-0 aspect-square rounded-[16px] object-cover lg:w-44"
        sizes="(min-width: 1024px) 176px, 152px"
        loading="lazy"
        src={image}
        alt=""
      />

      <div className="flex flex-1 flex-col items-end gap-2 text-end p-2 lg:p-4">
        <h2 className="text-sm font-semibold lg:text-base">{title}</h2>
        <p className="text-xs text-secondary lg:text-sm">{description}</p>

        <Link to={link} className={buttonVariants({ className: "bg-primary" })}>
          Explorar <ArrowRight />
        </Link>
      </div>
    </Card>
  );
}

export default PromoCard;
