import type { SubjectArea } from "@/db/schema";

export type AreaMeta = {
  label: string;
  short: string;
  description: string;
  textClass: string;
  dotClass: string;
  variable: string;
};

export const AREA_ORDER: SubjectArea[] = [
  "teoria",
  "software",
  "sistemas",
  "datos",
  "electivas",
];

export const AREAS: Record<SubjectArea, AreaMeta> = {
  teoria: {
    label: "Matemática y teoría",
    short: "Teoría",
    description:
      "La base formal de la carrera: álgebra, análisis, lógica y teoría de la computación.",
    textClass: "text-area-teoria",
    dotClass: "bg-area-teoria",
    variable: "var(--color-area-teoria)",
  },
  software: {
    label: "Programación y software",
    short: "Software",
    description:
      "Programar, diseñar y construir sistemas que otra persona pueda entender y mantener.",
    textClass: "text-area-software",
    dotClass: "bg-area-software",
    variable: "var(--color-area-software)",
  },
  sistemas: {
    label: "Sistemas y redes",
    short: "Sistemas",
    description:
      "Cómo funciona la máquina por dentro, desde el procesador hasta la red que la conecta.",
    textClass: "text-area-sistemas",
    dotClass: "bg-area-sistemas",
    variable: "var(--color-area-sistemas)",
  },
  datos: {
    label: "Datos e inteligencia artificial",
    short: "Datos",
    description:
      "Sacar conclusiones de los datos: estadística, bases de datos y aprendizaje automático.",
    textClass: "text-area-datos",
    dotClass: "bg-area-datos",
    variable: "var(--color-area-datos)",
  },
  electivas: {
    label: "Electivas",
    short: "Electivas",
    description:
      "El espacio para orientar la carrera hacia donde te interese, con materias de tu elección.",
    textClass: "text-area-electivas",
    dotClass: "bg-area-electivas",
    variable: "var(--color-area-electivas)",
  },
};

export function getArea(area: SubjectArea): AreaMeta {
  return AREAS[area];
}
