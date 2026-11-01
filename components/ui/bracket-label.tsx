import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** La firma tipográfica del sistema: todo sección arranca con { … }. */
export function BracketLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-body-sm text-muted", className)}>
      <span aria-hidden="true">{"{ "}</span>
      {children}
      <span aria-hidden="true">{" }"}</span>
    </p>
  );
}
