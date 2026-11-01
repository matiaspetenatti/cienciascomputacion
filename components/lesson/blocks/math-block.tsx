import { renderToString } from "katex";

/**
 * Fórmula en bloque renderizada en el servidor con KaTeX. `displayMode: true`
 * centra la ecuación en su propia línea. El HTML de KaTeX es de confianza.
 */
export default function MathBlock({ latex }: { latex: string }) {
  const html = renderToString(latex, {
    displayMode: true,
    throwOnError: false,
  });

  return (
    <div className="mt-6 flex justify-center text-cream">
      <div className="katex-block" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

/**
 * Fórmula en línea renderizada en el servidor con KaTeX.
 * `displayMode: false` la deja al mismo nivel que el texto circundante.
 */
export function MathInline({ latex }: { latex: string }) {
  const html = renderToString(latex, {
    displayMode: false,
    throwOnError: false,
  });

  return (
    <span className="katex-inline" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
