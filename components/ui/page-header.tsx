import type { ReactNode } from "react";

import { BracketLabel } from "@/components/ui/bracket-label";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="max-w-4xl">
      <BracketLabel>{eyebrow}</BracketLabel>
      <h1 className="mt-6 text-heading-sm text-cream md:text-heading">
        {title}
      </h1>
      {description ? (
        <p className="mt-6 max-w-2xl text-body-lg text-cream/80">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-8">{children}</div> : null}
    </header>
  );
}
