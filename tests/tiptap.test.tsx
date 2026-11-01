import type { JSONContent } from "@tiptap/core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => {
  const Image = (props: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }) => (
    <div data-testid="mock-image" data-src={props.src} data-alt={props.alt} />
  );
  return { default: Image };
});

import { seedSubjects } from "@/db/seed-data";
import { slugify } from "@/lib/slug";
import { extractHeadings, LessonContent } from "@/lib/tiptap/render";
import { validateLessonDocument } from "@/lib/tiptap/schema";
import { extractText, readingMinutes } from "@/lib/tiptap/text";
import { lessonAllBlocks } from "@/tests/fixtures/lesson-all-blocks";

const lessonContents = seedSubjects.flatMap((subject) =>
  subject.units.flatMap((unit) =>
    (unit.lessons ?? []).map((lesson) => ({
      label: `${subject.slug}/${unit.slug}/${lesson.slug}`,
      content: lesson.content,
    })),
  ),
);

describe("slugify", () => {
  it("quita acentos y normaliza a kebab-case", () => {
    expect(slugify("Complejidad temporal")).toBe("complejidad-temporal");
    expect(slugify("Álgebra y Geometría Analítica")).toBe(
      "algebra-y-geometria-analitica",
    );
    expect(slugify("  ¿Qué es programar?  ")).toBe("que-es-programar");
  });
});

describe("texto plano", () => {
  it("extrae el texto de todo el documento", () => {
    const text = extractText(lessonContents[0].content);
    expect(text).toContain("Programar es escribir instrucciones");
    expect(text).not.toContain("{");
  });

  it("estima al menos un minuto de lectura", () => {
    expect(readingMinutes("")).toBe(1);
    expect(readingMinutes("palabra ".repeat(400))).toBe(2);
  });
});

describe("render estático de Tiptap", () => {
  it("renderiza el contenido de todas las clases del seed sin nodos huérfanos", () => {
    for (const lesson of lessonContents) {
      const html = renderToStaticMarkup(
        createElement(LessonContent, { content: lesson.content }),
      );

      expect(html.length, lesson.label).toBeGreaterThan(0);
      expect(html, lesson.label).toContain("<p>");
    }
  });

  it("mapea headings, marcas y bloques de código", () => {
    const content = lessonContents[0].content;
    const html = renderToStaticMarkup(
      createElement(LessonContent, { content }),
    );

    expect(html).toContain('<h2 id="un-programa-es-una-receta">');
    expect(html).toContain('<pre data-language="python">');
    expect(html).toContain("<ul>");
    expect(html).toContain("<blockquote>");
  });

  it("extrae los headings para el índice lateral", () => {
    const headings = extractHeadings(lessonContents[0].content);

    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0]).toEqual({
      id: "un-programa-es-una-receta",
      text: "Un programa es una receta",
      level: 2,
    });
  });
});

describe("round-trip de todos los bloques", () => {
  it("serializa, valida y re-renderiza un documento con todos los bloques", () => {
    const serialized = JSON.stringify(lessonAllBlocks);
    const parsed: JSONContent = JSON.parse(serialized);

    validateLessonDocument(parsed);

    const html = renderToStaticMarkup(
      createElement(LessonContent, { content: parsed }),
    );

    // Bloques de servidor
    expect(html).toContain("<h2");
    expect(html).toContain('<pre data-language="python">');
    expect(html).toContain("print");
    expect(html).toContain("data-callout");
    expect(html).toContain("data-variant");
    expect(html).toContain("katex-block");
    expect(html).toContain("katex-inline");
    expect(html).toContain("<hr");
    expect(html).toContain("<ul>");
    expect(html).toContain("<blockquote>");

    // Islas cliente: en el server renderizan un placeholder de loading
    // (no hidratan JS hasta el cliente).
    expect(html).toContain("h-32"); // placeholder del Quiz
    expect(html).toContain("h-40"); // placeholder de Mermaid
    expect(html).not.toContain("data-quiz");
    expect(html).not.toContain("data-mermaid");
  });
});
