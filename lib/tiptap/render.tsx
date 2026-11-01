import type { JSONContent } from "@tiptap/core";
import {
  type MarkProps,
  type NodeProps,
  renderJSONContentToReactElement,
} from "@tiptap/static-renderer/json/react";
import type { ReactNode } from "react";

import { Mermaid, Quiz } from "@/components/lesson/blocks";
import Callout from "@/components/lesson/blocks/callout";
import Figure from "@/components/lesson/blocks/figure";
import MathBlock, { MathInline } from "@/components/lesson/blocks/math-block";
import { slugify } from "@/lib/slug";

/**
 * Renderer estático (server) del JSON de Tiptap.
 * El mapa de nodos y marcas debe cubrir todo lo que permita
 * `lib/tiptap/extensions.ts`. Un nodo sin handler rompe el render a propósito.
 */

type PNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: readonly { type: string | { name: string } }[];
  content?: readonly PNode[];
};

function nodeText(node: PNode): string {
  if (node.text) return node.text;
  return (node.content ?? []).map(nodeText).join("");
}

function hasContent(node: PNode): boolean {
  return (node.content?.length ?? 0) > 0;
}

const nodeMapping: Record<string, (ctx: NodeProps) => ReactNode> = {
  doc: ({ children }) => <>{children}</>,

  paragraph: ({ node, children }) =>
    hasContent(node) ? <p>{children}</p> : <p aria-hidden="true">&nbsp;</p>,

  text: ({ node }) => <>{node.text}</>,

  heading: ({ node, children }) => {
    const isSubheading = node.attrs?.level === 3;
    const id = slugify(nodeText(node));

    return isSubheading ? (
      <h3 id={id}>{children}</h3>
    ) : (
      <h2 id={id}>{children}</h2>
    );
  },

  hardBreak: () => <br />,

  bulletList: ({ children }) => <ul>{children}</ul>,

  orderedList: ({ node, children }) => (
    <ol start={typeof node.attrs?.start === "number" ? node.attrs.start : 1}>
      {children}
    </ol>
  ),

  listItem: ({ children }) => <li>{children}</li>,

  blockquote: ({ children }) => <blockquote>{children}</blockquote>,

  codeBlock: ({ node, children }) => {
    const language =
      typeof node.attrs?.language === "string" ? node.attrs.language : "";

    return (
      <pre data-language={language || undefined}>
        <code>{children}</code>
      </pre>
    );
  },

  horizontalRule: () => <hr />,

  callout: ({ node, children }) => {
    const attrs = node.attrs ?? {};
    const variant =
      attrs.variant === "tip" || attrs.variant === "advertencia"
        ? (attrs.variant as "nota" | "tip" | "advertencia")
        : "nota";

    return <Callout variant={variant}>{children}</Callout>;
  },

  image: ({ node }) => {
    const attrs = node.attrs ?? {};
    return (
      <Figure
        src={String(attrs.src ?? "")}
        alt={String(attrs.alt ?? "")}
        width={typeof attrs.width === "number" ? attrs.width : 600}
        height={typeof attrs.height === "number" ? attrs.height : 400}
      />
    );
  },

  blockMath: ({ node }) => {
    const attrs = node.attrs ?? {};
    const latex = typeof attrs.latex === "string" ? attrs.latex : "";
    return <MathBlock latex={latex} />;
  },

  inlineMath: ({ node }) => {
    const attrs = node.attrs ?? {};
    const latex = typeof attrs.latex === "string" ? attrs.latex : "";
    return <MathInline latex={latex} />;
  },

  quiz: ({ node }) => {
    const attrs = node.attrs ?? {};
    return (
      <Quiz
        question={String(attrs.question ?? "")}
        options={
          Array.isArray(attrs.options) ? (attrs.options as string[]) : []
        }
        correctIndex={
          typeof attrs.correctIndex === "number" ? attrs.correctIndex : 0
        }
        explanation={String(attrs.explanation ?? "")}
      />
    );
  },

  mermaid: ({ node }) => {
    const attrs = node.attrs ?? {};
    return (
      <Mermaid
        code={String(attrs.code ?? "")}
        caption={typeof attrs.caption === "string" ? attrs.caption : undefined}
      />
    );
  },
};

const markMapping: Record<string, (ctx: MarkProps) => ReactNode> = {
  bold: ({ children }) => <strong>{children}</strong>,
  italic: ({ children }) => <em>{children}</em>,
  strike: ({ children }) => <s>{children}</s>,
  code: ({ children }) => <code>{children}</code>,
  underline: ({ children }) => <u>{children}</u>,
  link: ({ mark, children }) => {
    const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "#";
    const isExternal = /^https?:\/\//.test(href);

    return (
      <a
        href={href}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  },
};

export function LessonContent({ content }: { content: JSONContent }) {
  const render = renderJSONContentToReactElement({ nodeMapping, markMapping });

  return <div className="prose-lesson">{render({ content })}</div>;
}

/** Extrae los headings del documento para el índice de la clase. */
export function extractHeadings(
  content: JSONContent,
): { id: string; text: string; level: 2 | 3 }[] {
  const seen = new Map<string, number>();

  return (content.content ?? []).flatMap((node) => {
    if (node.type !== "heading") return [];

    const level = node.attrs?.level === 3 ? 3 : 2;
    const text = nodeText(node);
    const base = slugify(text);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);

    return [
      {
        id: count === 1 ? base : `${base}-${count}`,
        text,
        level: level as 2 | 3,
      },
    ];
  });
}
