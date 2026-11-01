"use client";

import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";

mermaid.initialize({ startOnLoad: false, securityLevel: "loose" });

/**
 * Diagrama Mermaid. Es una isla cliente porque Mermaid manipula el DOM y
 * necesita `window`. Se carga solo si la clase contiene este bloque
 * (`next/dynamic`, `ssr: false`), con un placeholder del mismo alto para no
 * mover el layout.
 */
export default function Mermaid({
  code,
  caption,
}: {
  code: string;
  caption?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current || !code) return;
    const element = ref.current;

    (async () => {
      try {
        const id = `mermaid-${Date.now()}`;
        const { svg: rendered } = await mermaid.render(id, code, element);
        setSvg(rendered);
        setError(null);
      } catch (cause) {
        setError(String(cause));
      }
    })();
  }, [code]);

  return (
    <section className="mt-6 flex flex-col gap-2 rounded-card border border-hairline p-4">
      {caption ? <p className="text-caption text-muted">{caption}</p> : null}
      <div
        ref={ref}
        className="mermaid-diagram min-h-[200px]"
        dangerouslySetInnerHTML={{ __html: svg ?? "" }}
      />
      {error ? (
        <p className="text-caption text-muted">
          No se pudo renderizar el diagrama.
        </p>
      ) : null}
    </section>
  );
}
