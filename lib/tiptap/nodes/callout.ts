import { mergeAttributes, Node } from "@tiptap/core";

export const CALL_OUT_VARIANTS = ["nota", "tip", "advertencia"] as const;

export type CallOutVariant = (typeof CALL_OUT_VARIANTS)[number];

export const Callout = Node.create({
  name: "callout",

  group: "block",

  content: "block+",

  defining: true,

  addAttributes() {
    return {
      variant: {
        default: "nota",
        parseHTML: (element) => element.getAttribute("data-variant") ?? "nota",
        renderHTML: (attributes) => ({ "data-variant": attributes.variant }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "aside[data-callout]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "aside",
      mergeAttributes(HTMLAttributes, { "data-callout": "" }),
      0,
    ];
  },
});
