import type { Metadata } from "next";
import Link from "next/link";

import { Section } from "@/components/layout/section";
import { AreaLabel } from "@/components/ui/area-label";
import { Container } from "@/components/ui/container";
import { Divider } from "@/components/ui/divider";
import { PageHeader } from "@/components/ui/page-header";
import { getPlan } from "@/lib/content/queries";
import { yearLabel } from "@/lib/format";

export const metadata: Metadata = {
  title: "Plan de estudios",
  description:
    "El plan completo de la carrera de Ciencias de la Computación, ordenado por año y área.",
};

export default async function PlanPage() {
  const plan = await getPlan();

  return (
    <>
      <Container className="pt-14 pb-12 md:pt-20">
        <PageHeader
          eyebrow="Plan de estudios"
          title="La carrera entera, en orden."
          description="Cinco años, veinticinco materias. Cada materia es una página con su programa y sus clases. No hay correlatividades ni fechas: el orden es una sugerencia de lectura."
        />
      </Container>

      {plan.map((group) => (
        <Section
          key={group.year}
          eyebrow={yearLabel(group.year)}
          title={`${group.subjects.length} materias`}
        >
          <ul className="flex flex-col">
            {group.subjects.map((subject, index) => (
              <li key={subject.id}>
                {index > 0 ? <Divider /> : null}
                <Link
                  href={`/materias/${subject.slug}`}
                  className="group grid gap-3 py-7 transition-colors duration-150 md:grid-cols-[1.1fr_1.6fr_auto] md:items-start md:gap-10"
                >
                  <div>
                    <AreaLabel area={subject.area} />
                    <h3 className="mt-3 text-body-lg text-cream transition-colors duration-150 group-hover:text-brand-soft">
                      {subject.name}
                    </h3>
                  </div>

                  <p className="max-w-xl text-body-sm text-cream/70">
                    {subject.description}
                  </p>

                  <p className="text-caption text-muted md:text-right">
                    {subject.credits ? `${subject.credits} créditos` : null}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ))}
    </>
  );
}
