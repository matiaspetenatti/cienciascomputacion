import { createHighlighter } from "shiki";

/**
 * Highlighter de Shiki cargado una vez al importar el módulo en el servidor.
 * El top-level await es válido en un Server Component de Next.js: el módulo no
 * termina de evaluarse hasta que Shiki tiene sus temas y lenguajes listos, así
 * `CodeBlock` puede ser síncrono y usarse desde el mapa de nodos del renderer.
 */
export const highlighter = await createHighlighter({
  themes: ["vesper"],
  langs: ["python", "javascript", "typescript", "text", "bash", "json"],
});

/**
 * Bloque de código resaltado en el servidor con Shiki.
 * El HTML generado por Shiki es de confianza (no viene del editor), por eso
 * se inyecta con `dangerouslySetInnerHTML`. El JSON del editor nunca trae HTML
 * crudo: solo el idioma y el texto plano del bloque.
 */
export default function CodeBlock({
  language,
  children,
}: {
  language?: string;
  children?: string;
}) {
  const html = highlighter.codeToHtml(String(children ?? ""), {
    lang: language ?? "text",
    theme: "vesper",
  });

  return (
    <pre className="code-block" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
