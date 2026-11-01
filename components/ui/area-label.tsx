import type { SubjectArea } from "@/db/schema";
import { getArea } from "@/lib/content/areas";
import { cn } from "@/lib/utils";

export function AreaLabel({
  area,
  className,
  showDot = true,
}: {
  area: SubjectArea;
  className?: string;
  showDot?: boolean;
}) {
  const meta = getArea(area);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-caption",
        meta.textClass,
        className,
      )}
    >
      {showDot ? (
        <span
          aria-hidden="true"
          className={cn("size-1.5 shrink-0 rounded-full", meta.dotClass)}
        />
      ) : null}
      {meta.label}
    </span>
  );
}

export function AreaTag({
  area,
  className,
}: {
  area: SubjectArea;
  className?: string;
}) {
  const meta = getArea(area);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-hairline px-3 py-1 text-caption",
        meta.textClass,
        className,
      )}
    >
      {meta.short}
    </span>
  );
}
