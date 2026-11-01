"use client";

import dynamic from "next/dynamic";

/**
 * Islas cliente: solo se cargan (y hidratan) si la clase contiene el bloque.
 * `ssr: false` + placeholder del mismo alto para no mover el layout mientras
 * se descarga Mermaid o el quiz se activa.
 */
export const Mermaid = dynamic(() => import("./mermaid"), {
  ssr: false,
  loading: () => (
    <div
      className="mt-6 h-40 w-full rounded-card border border-hairline bg-panel/30"
      aria-hidden="true"
    />
  ),
});

export const Quiz = dynamic(() => import("./quiz"), {
  ssr: false,
  loading: () => (
    <div
      className="mt-6 h-32 w-full rounded-card border border-hairline bg-panel/30"
      aria-hidden="true"
    />
  ),
});
