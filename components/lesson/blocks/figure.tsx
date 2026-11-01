import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Imagen con `alt` obligatorio y dimensiones, renderizada con `next/image`.
 * El `src` presignado de R2 llega del admin; aquí solo se muestra.
 */
export default function Figure({
  src,
  alt,
  width,
  height,
  caption,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: ReactNode;
}) {
  return (
    <figure className="mt-6 flex flex-col items-center gap-2 rounded-card border border-hairline p-4">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-card"
      />
      {caption ? (
        <figcaption className="text-caption text-muted">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
