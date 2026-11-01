import type { JSONContent } from "@tiptap/core";

/**
 * Documento de Tiptap que contiene todos los bloques soportados por el
 * pipeline de contenido: párrafo con marcas, heading, código, callout,
 * imagen, fórmula en bloque, fórmula en línea, lista, cita, regla
 * horizontal, quiz y diagrama Mermaid.
 *
 * Se usa para el test de round-trip: serializar → validar → re-renderizar
 * → comparar la estructura. Sirve de garantía de que un nodo que existe en
 * el editor también tiene handler en el renderer público.
 */
export const lessonAllBlocks: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Este documento reúne " },
        { type: "text", text: "todos", marks: [{ type: "bold" }] },
        { type: "text", text: " los bloques de contenido: " },
        { type: "text", text: "código", marks: [{ type: "italic" }] },
        { type: "text", text: ", " },
        { type: "text", text: "fórmulas", marks: [{ type: "code" }] },
        { type: "text", text: ", callouts, imagen, quiz y diagrama." },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Bloque de código" }],
    },
    {
      type: "codeBlock",
      attrs: { language: "python" },
      content: [{ type: "text", text: 'print("Hola, mundo")' }],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Callouts" }],
    },
    {
      type: "callout",
      attrs: { variant: "nota" },
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Esta es una nota informativa." }],
        },
      ],
    },
    {
      type: "callout",
      attrs: { variant: "tip" },
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Este es un consejo práctico." }],
        },
      ],
    },
    {
      type: "callout",
      attrs: { variant: "advertencia" },
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Esta es una advertencia importante.",
            },
          ],
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Imagen" }],
    },
    {
      type: "image",
      attrs: {
        src: "https://example.com/ejemplo.png",
        alt: "Una imagen de prueba para el round-trip",
        width: 800,
        height: 600,
      },
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Matemática" }],
    },
    {
      type: "blockMath",
      attrs: { latex: "E = mc^2" },
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Fórmula en línea: " },
        { type: "inlineMath", attrs: { latex: "x + y = z" } },
        { type: "text", text: "." },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Quiz" }],
    },
    {
      type: "quiz",
      attrs: {
        question: "¿Qué es JavaScript?",
        options: [
          "Un lenguaje de programación",
          "Un tipo de café",
          "Una fruta",
          "Un sistema operativo",
        ],
        correctIndex: 0,
        explanation: "JavaScript es un lenguaje de programación.",
      },
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Diagrama" }],
    },
    {
      type: "mermaid",
      attrs: {
        code: "graph TD; A-->B; B-->C;",
        caption: "Diagrama de ejemplo",
      },
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Subsección" }],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Ítem uno" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Ítem dos" }],
            },
          ],
        },
      ],
    },
    {
      type: "blockquote",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Una cita de referencia." }],
        },
      ],
    },
    { type: "horizontalRule" },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Fin del documento de prueba." }],
    },
  ],
};
