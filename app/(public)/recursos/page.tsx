import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Divider } from "@/components/ui/divider";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Recursos",
  description:
    "Herramientas, documentación y libros para acompañar la carrera de Ciencias de la Computación.",
};

type Resource = {
  name: string;
  href: string;
  description: string;
};

const groups: { title: string; intro: string; items: Resource[] }[] = [
  {
    title: "Para programar",
    intro:
      "Un lenguaje alcanza para empezar. Python es la elección del plan porque el ruido sintáctico es mínimo.",
    items: [
      {
        name: "Python",
        href: "https://docs.python.org/es/3/",
        description: "Documentación oficial, con traducción al español.",
      },
      {
        name: "MDN Web Docs",
        href: "https://developer.mozilla.org/es/",
        description:
          "La referencia de HTML, CSS y JavaScript cuando la carrera llegue a la web.",
      },
      {
        name: "Git",
        href: "https://git-scm.com/book/es/v2",
        description:
          "El libro de Git, gratis y en español. Sirve desde el primer commit.",
      },
    ],
  },
  {
    title: "Para matemática",
    intro:
      "Las materias teóricas se leen mejor con lápiz y papel. Estos materiales cubren lo que pide el plan.",
    items: [
      {
        name: "Khan Academy",
        href: "https://es.khanacademy.org/math",
        description:
          "Álgebra, análisis y probabilidad explicados con ejercicios interactivos.",
      },
      {
        name: "MIT OpenCourseWare",
        href: "https://ocw.mit.edu/",
        description:
          "Cursos universitarios completos, con videos y apuntes, para profundizar.",
      },
      {
        name: "Mathematics for Computer Science",
        href: "https://courses.csail.mit.edu/6.042/spring18/mcs.pdf",
        description:
          "El libro de matemática discreta del MIT. Directo y sin vueltas.",
      },
    ],
  },
  {
    title: "Para leer más",
    intro:
      "No reemplazan las clases, pero cambian la forma de entender lo que se programa.",
    items: [
      {
        name: "Structure and Interpretation of Computer Programs",
        href: "https://mitpress.mit.edu/9780262510875/structure-and-interpretation-of-computer-programs/",
        description:
          "El clásico del MIT sobre abstracción y diseño de programas.",
      },
      {
        name: "Computer Science Distilled",
        href: "https://code.energy/computer-science-distilled/",
        description:
          "Una introducción corta a los temas centrales de la disciplina.",
      },
      {
        name: "Papers We Love",
        href: "https://paperswelove.org/",
        description:
          "Papers de computación comentados, para leer lo que hay detrás de las herramientas.",
      },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <>
      <Container className="pt-14 pb-12 md:pt-20">
        <PageHeader
          eyebrow="Recursos"
          title="Lo que conviene tener a mano."
          description="Material externo, gratuito y en lo posible en español. No hace falta comprar nada para seguir la carrera."
        />
      </Container>

      {groups.map((group) => (
        <Section key={group.title} eyebrow="Recursos" title={group.title}>
          <p className="mb-8 max-w-2xl text-body text-cream/70">
            {group.intro}
          </p>

          <ul className="flex flex-col">
            {group.items.map((item, index) => (
              <li key={item.href}>
                {index > 0 ? <Divider /> : null}
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid gap-2 py-6 md:grid-cols-[1fr_1.6fr] md:gap-10"
                >
                  <span className="text-body-lg text-cream transition-colors duration-150 group-hover:text-brand-soft">
                    {item.name}
                  </span>
                  <span className="max-w-xl text-body-sm text-cream/70">
                    {item.description}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Section>
      ))}

      <Section eyebrow="Volver" title="El plan es el punto de partida.">
        <ButtonLink href="/plan" variant="gradient">
          Ver el plan de estudios
        </ButtonLink>
      </Section>
    </>
  );
}
