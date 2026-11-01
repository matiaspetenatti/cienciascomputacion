import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "ghost" | "gradient";
  className?: string;
};

/**
 * Todo control es un pill fantasma. La única excepción es la variante
 * `gradient`, el CTA con borde degradado verde.
 */
export function ButtonLink({
  href,
  children,
  variant = "ghost",
  className,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-pill border px-6 py-[15px] text-body-sm leading-[1.05] font-semibold transition-[color,border-color,opacity] duration-150",
        variant === "gradient"
          ? "btn-gradient text-cream hover:opacity-90"
          : "border-cream/70 text-cream hover:border-cream",
        className,
      )}
    >
      {children}
    </Link>
  );
}
