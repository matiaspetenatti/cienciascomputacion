import { z } from "zod";

/** Variantes válidas del nodo `callout`. */
export const CalloutVariantSchema = z.enum(["nota", "tip", "advertencia"]);

/** Attrs del nodo `quiz`. */
export const QuizAttrsSchema = z.object({
  question: z.string().min(1, "La pregunta es obligatoria"),
  options: z
    .array(z.string().min(1, "Cada opción debe tener texto"))
    .min(2, "Al menos dos opciones")
    .max(6, "Máximo seis opciones"),
  correctIndex: z.number().int().min(0),
  explanation: z.string().min(1, "La explicación es obligatoria"),
});

/** Attrs del nodo `image`. */
export const ImageAttrsSchema = z.object({
  src: z.string().url("La imagen debe tener una URL válida"),
  alt: z.string().min(1, "El texto alt es obligatorio"),
  title: z.string().optional(),
});

/** Attrs del nodo `codeBlock`. */
export const CodeBlockAttrsSchema = z.object({
  language: z.string().optional(),
});

/** Attrs del nodo matemático (block / inline). */
export const MathAttrsSchema = z.object({
  latex: z.string().min(1, "La fórmula no puede ir vacía"),
});

type JSONMarkType =
  "bold" | "italic" | "strike" | "code" | "underline" | "link";

type JSONNodeType =
  | "doc"
  | "paragraph"
  | "heading"
  | "text"
  | "hardBreak"
  | "bulletList"
  | "orderedList"
  | "listItem"
  | "blockquote"
  | "codeBlock"
  | "horizontalRule"
  | "image"
  | "blockMath"
  | "inlineMath"
  | "callout"
  | "quiz"
  | "mermaid";

type JSONMark = {
  type: JSONMarkType;
  attrs?: Record<string, unknown>;
};

type JSONContent = {
  type: JSONNodeType;
  attrs?: Record<string, unknown>;
  content?: readonly JSONContent[];
  marks?: readonly JSONMark[];
  text?: string;
};

const JSONMarkSchema: z.ZodType<JSONMark> = z.object({
  type: z.enum([
    "bold",
    "italic",
    "strike",
    "code",
    "underline",
    "link",
  ] as const),
  attrs: z.record(z.string(), z.unknown()).optional(),
});

const JSONContentSchema: z.ZodType<JSONContent> = z.lazy(() =>
  z.object({
    type: z.enum([
      "doc",
      "paragraph",
      "heading",
      "text",
      "hardBreak",
      "bulletList",
      "orderedList",
      "listItem",
      "blockquote",
      "codeBlock",
      "horizontalRule",
      "image",
      "blockMath",
      "inlineMath",
      "callout",
      "quiz",
      "mermaid",
    ] as const),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(JSONContentSchema).optional(),
    marks: z.array(JSONMarkSchema).optional(),
    text: z.string().optional(),
  }),
);

/** Valida un documento completo de Tiptap (raíz `doc`). */
export const lessonDocumentSchema = JSONContentSchema.refine(
  (node) => node.type === "doc",
  {
    message: "La raíz del documento debe ser `doc`.",
  },
).refine(
  (node) => {
    if (node.type !== "doc") return true;
    const headings = (node.content ?? []).filter((n) => n.type === "heading");
    const badLevel = headings.some(
      (n) =>
        typeof n.attrs?.level !== "number" ||
        (n.attrs.level !== 2 && n.attrs.level !== 3),
    );
    return !badLevel;
  },
  {
    message: "Los headings solo pueden ser nivel 2 o 3.",
  },
);

export type LessonDocument = z.infer<typeof lessonDocumentSchema>;

export function validateLessonDocument(unknown: unknown): LessonDocument {
  return lessonDocumentSchema.parse(unknown);
}
