import Link from "next/link";

import { Section } from "@/components/layout/section";
import { AreaLabel, AreaTag } from "@/components/ui/area-label";
import { BracketLabel } from "@/components/ui/bracket-label";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Divider } from "@/components/ui/divider";
import { AREA_ORDER, getArea } from "@/lib/content/areas";
import { getLatestLessons, getSiteStats } from "@/lib/content/queries";

export default async function HomePage() {
  const [stats, latest] = await Promise.all([
    getSiteStats(),
    getLatestLessons(3),
  ]);

  return (
    <>
      <section className="overflow-hidden">
        <Container className="pt-14 pb-16 md:pt-20 md:pb-24">
          <BracketLabel>OpenComputerScience</BracketLabel>

          <h1 className="mt-8 flex flex-col">
            <span className="text-display text-cream">Ciencias</span>
            <span className="mt-2 text-heading-sm text-cream/85 md:text-heading">
              de la computación
            </span>
          </h1>

          <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[1.1fr_1fr] md:items-end">
            <p className="max-w-xl text-body-lg text-cream/80">
              La carrera completa, clase por clase. Sin inscripción, sin
              cuentas, sin fechas de entrega: abrís el plan y empezás a leer.
            </p>

            <div className="flex flex-wrap gap-3 md:justify-end">
              <ButtonLink href="/plan" variant="gradient">
                Ver el plan de estudios
              </ButtonLink>
              <ButtonLink href="/sobre">Sobre la carrera</ButtonLink>
            </div>
          </div>

          <dl className="mt-16 grid grid-cols-3 gap-4 border-t border-hairline pt-8 md:mt-20">
            <div>
              <dt className="text-caption text-muted">Materias</dt>
              <dd className="mt-1 text-subheading text-cream">
                {stats.subjects}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-muted">Clases publicadas</dt>
              <dd className="mt-1 text-subheading text-cream">
                {stats.lessons}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-muted">Años</dt>
              <dd className="mt-1 text-subheading text-cream">{stats.years}</dd>
            </div>
          </dl>
        </Container>
      </section>

      <Section
        eyebrow="Áreas"
        title="Cinco colores, cinco formas de mirar la computación."
        description="Cada materia pertenece a un área y el color la identifica en todo el sitio. No es decoración: es la taxonomía."
      >
        <ul className="flex flex-col">
          {AREA_ORDER.map((area, index) => {
            const meta = getArea(area);

            return (
              <li key={area}>
                {index > 0 ? <Divider /> : null}
                <div className="grid gap-3 py-8 md:grid-cols-[1fr_1.4fr] md:gap-10">
                  <div>
                    <AreaLabel area={area} />
                    <h3 className="mt-3 text-body-lg text-cream">
                      {meta.label}
                    </h3>
                  </div>
                  <p className="max-w-xl text-body text-cream/70">
                    {meta.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section
        eyebrow="Últimas clases"
        title="Lo más reciente"
        description="Cada clase es una lectura independiente, pero el orden del plan tiene sentido: las anteriores preparan las siguientes."
      >
        {latest.length ? (
          <ul className="grid gap-4 md:grid-cols-3">
            {latest.map((lesson) => (
              <li key={lesson.id}>
                <Link
                  href={`/materias/${lesson.subjectSlug}/${lesson.unitSlug}/${lesson.lessonSlug}`}
                  className="group flex h-full flex-col rounded-card border border-hairline p-6 transition-colors duration-150 hover:border-cream/50"
                >
                  <AreaTag area={lesson.area} />
                  <h3 className="mt-5 text-body-lg text-cream transition-colors duration-150 group-hover:text-brand-soft">
                    {lesson.title}
                  </h3>
                  <p className="mt-3 flex-1 text-body-sm text-cream/70">
                    {lesson.excerpt}
                  </p>
                  <p className="mt-6 text-caption text-muted">
                    {lesson.subjectName} · {lesson.readingMinutes} min de
                    lectura
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body text-muted">
            Todavía no hay clases publicadas. El plan ya está disponible.
          </p>
        )}
      </Section>

      <Section eyebrow="Empezar" title="No hace falta registrarse.">
        <div className="flex flex-wrap items-center gap-4">
          <ButtonLink href="/plan" variant="gradient">
            Abrir el plan
          </ButtonLink>
          <p className="text-body text-cream/70">
            Elegí una materia y leé desde la primera unidad.
          </p>
        </div>
      </Section>
    </>
  );
}
