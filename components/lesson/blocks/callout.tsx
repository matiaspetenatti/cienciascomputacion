import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Llamado de atención con tres variantes: nota (neutro), tip (marca) y
 * advertencia (naranja de electivas). Los colores salen de tokens; nunca de
 * hex hardcodeados.
 */
export default function Callout({
  variant = "nota",
  children,
}: {
  variant?: "nota" | "tip" | "advertencia";
  children: ReactNode;
}) {
  const base =
    "rounded-card border p-5 text-cream/90 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0";

  const meta = {
    nota: cn("border-hairline bg-panel/40"),
    tip: cn("border-brand-soft/40 bg-brand/10"),
    advertencia: cn(
      "border-color-area-electivas/40 bg-color-area-electivas/10",
    ),
  }[variant];

  return (
    <aside data-callout data-variant={variant} className={cn(base, meta)}>
      {children}
    </aside>
  );
}
