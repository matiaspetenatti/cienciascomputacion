import { mergeAttributes, Node } from "@tiptap/core";

export type MermaidData = {
  code: string;
  caption: string;
};

export const Mermaid = Node.create({
  name: "mermaid",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      code: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-code") ?? "",
        renderHTML: (attributes) => ({ "data-code": attributes.code ?? "" }),
      },
      caption: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-caption") ?? "",
        renderHTML: (attributes) => ({
          "data-caption": attributes.caption ?? "",
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-mermaid]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-mermaid": "" })];
  },
});
