import { mergeAttributes, Node } from "@tiptap/core";

export type QuizData = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

function parseOptions(element: HTMLElement): string[] {
  const raw = element.getAttribute("data-options");
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (option): option is string => typeof option === "string",
    );
  } catch {
    return [];
  }
}

export const Quiz = Node.create({
  name: "quiz",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      question: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-question") ?? "",
      },
      options: {
        default: [],
        parseHTML: parseOptions,
        renderHTML: (attributes) => ({
          "data-options": JSON.stringify(attributes.options ?? []),
        }),
      },
      correctIndex: {
        default: 0,
        parseHTML: (element) =>
          Number.parseInt(
            element.getAttribute("data-correct-index") ?? "0",
            10,
          ),
        renderHTML: (attributes) => ({
          "data-correct-index": String(attributes.correctIndex ?? 0),
        }),
      },
      explanation: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-explanation") ?? "",
        renderHTML: (attributes) => ({
          "data-explanation": attributes.explanation ?? "",
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "section[data-quiz]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "section",
      mergeAttributes(HTMLAttributes, {
        "data-quiz": "",
        "data-question": HTMLAttributes.question ?? "",
      }),
    ];
  },
});
