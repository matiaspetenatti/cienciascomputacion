import type { ReactNode } from "react";

import Callout from "./callout";
import CodeBlock from "./code-block";
import Figure from "./figure";
import { Mermaid, Quiz } from "./islands";
import MathBlock from "./math-block";

/**
 * Bloques que se renderizan en el servidor. No hidratan JavaScript en el
 * cliente: el HTML viaja listo desde el RSC.
 */
export { Callout, CodeBlock, Figure, MathBlock };

/**
 * Islas cliente: solo se cargan (y hidratan) si la clase contiene el bloque.
 * Se definen en `islands.tsx` porque `next/dynamic` con `ssr: false` requiere
 * un Client Component.
 */
export { Mermaid, Quiz };

export type BlockComponentProps = ReactNode;
