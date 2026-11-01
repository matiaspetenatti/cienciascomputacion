import type { JSONContent } from "@tiptap/core";

/** Recorre el documento y une el texto de todos los nodos hoja. */
export function extractText(node: JSONContent): string {
  const parts: string[] = [];

  const walk = (current: JSONContent) => {
    if (current.type === "text" && current.text) {
      parts.push(current.text);
      return;
    }
    if (current.type === "hardBreak") {
      parts.push(" ");
      return;
    }
    current.content?.forEach(walk);
  };

  walk(node);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/** Estimación bruta a 200 palabras por minuto, mínimo un minuto. */
export function readingMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
