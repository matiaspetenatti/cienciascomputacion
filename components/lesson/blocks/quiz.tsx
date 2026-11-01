"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Autoevaluación de una sola respuesta. Isla cliente porque necesita estado
 * y manejar el clic del usuario. No envía nada al servidor.
 */
export default function Quiz({
  question,
  options,
  correctIndex,
  explanation,
}: {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  const isCorrect = selected === correctIndex;

  return (
    <section
      className="mt-6 flex flex-col gap-3 rounded-card border border-hairline p-5 text-cream/90"
      data-quiz=""
    >
      <p className="text-body text-cream">{question}</p>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {options.map((option, index) => {
          const revealed = selected !== null;
          const active =
            selected === index
              ? isCorrect
                ? "border-brand-soft bg-brand/10"
                : "border-color-area-electivas/50 bg-color-area-electivas/10"
              : "border-hairline bg-panel/30 hover:border-cream/40";

          return (
            <li
              key={index}
              onClick={() => setSelected(index)}
              className={cn(active)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelected(index);
                }
              }}
            >
              <span className="text-body-sm">{option}</span>
              {revealed ? (
                <span
                  className={`ml-2 text-caption ${
                    index === correctIndex ? "text-brand-soft" : "text-muted"
                  }`}
                >
                  {index === correctIndex ? "Correcto." : "Incorrecto."}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      {selected !== null ? (
        <p
          className={`text-caption ${isCorrect ? "text-brand-soft" : "text-muted"}`}
        >
          {isCorrect ? "Correcto." : "Incorrecto."} {explanation}
        </p>
      ) : null}
    </section>
  );
}
