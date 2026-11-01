import Image from "@tiptap/extension-image";
import Mathematics from "@tiptap/extension-mathematics";
import StarterKit from "@tiptap/starter-kit";

import { Callout } from "./nodes/callout";
import { Mermaid } from "./nodes/mermaid";
import { Quiz } from "./nodes/quiz";

/**
 * Única fuente de verdad del esquema de contenido.
 * La usan el editor del admin, el renderer público y el test de round-trip.
 *
 * Nodos personalizados:
 * - `callout`: nota / tip / advertencia (renderiza en server).
 * - `quiz`: autoevaluación con una respuesta correcta (isla cliente).
 * - `mermaid`: diagrama (isla cliente).
 *
 * Nodos de Tiptap oficiales:
 * - `image`: imagen con `alt` obligatorio.
 * - `mathematics`: fórmulas en LaTeX (blockMath / inlineMath) con KaTeX.
 */
export const lessonExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
  }),
  Image.configure({ inline: false, allowBase64: false }),
  Mathematics,
  Callout,
  Quiz,
  Mermaid,
];
