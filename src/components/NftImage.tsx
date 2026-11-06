import type { ImgHTMLAttributes } from "react";
import full from "@/assets/monkey.webp";
import small from "@/assets/monkey-256.webp";
import medium from "@/assets/monkey-512.webp";
import large from "@/assets/monkey-768.webp";

/** Same local artwork at sizes appropriate to its rendered box and device pixel ratio. */
export function NftImage({
  src = full,
  sizes = "(min-width: 1024px) 280px, (min-width: 768px) 230px, 46vw",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const local = src.includes("monkey");
  return (
    <img
      width={1254}
      height={1254}
      decoding="async"
      src={local ? full : src}
      srcSet={
        local
          ? `${small} 256w, ${medium} 512w, ${large} 768w, ${full} 1254w`
          : undefined
      }
      sizes={local ? sizes : undefined}
      {...props}
    />
  );
}
