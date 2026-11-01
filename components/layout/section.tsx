import type { ReactNode } from "react";

import { BracketLabel } from "@/components/ui/bracket-label";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export function Section({
  eyebrow,
  title,
  description,
  children,
  id,
  className,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={cn("border-t border-hairline", className)}>
      <Container className="py-16 md:py-20">
        {eyebrow || title ? (
          <div className="max-w-3xl">
            {eyebrow ? <BracketLabel>{eyebrow}</BracketLabel> : null}
            {title ? (
              <h2 className="mt-4 text-subheading text-cream md:text-heading-sm">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-4 text-body-lg text-cream/80">{description}</p>
            ) : null}
          </div>
        ) : null}
        <div className={eyebrow || title ? "mt-12" : undefined}>{children}</div>
      </Container>
    </section>
  );
}
