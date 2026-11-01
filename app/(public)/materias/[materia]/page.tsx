import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Section } from "@/components/layout/section";
import { AreaLabel } from "@/components/ui/area-label";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { getSubjectProgram, getSubjects } from "@/lib/content/queries";
import { readingTime, yearLabel } from "@/lib/format";

export async function generateStaticParams() {
  const subjects = await getSubjects();
  return subjects.map((subject) => ({ materia: subject.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/materias/[materia]">): Promise<Metadata> {
  const { materia } = await params;
  const subject = await getSubjectProgram(materia);

  if (!subject) return { title: "Materia no encontrada" };

  return {
    title: subject.name,
    description: subject.description,
    openGraph: {
      title: subject.name,
      description: subject.description,
      type: "article",
    },
  };
}

export default function SubjectPage({
  params,
}: PageProps<"/materias/[materia]">) {
  return (
    <Suspense fallback={<SubjectSkeleton />}>
      <SubjectContent params={params} />
    </Suspense>
  );
}

function SubjectSkeleton() {
  return (
    <Container className="pt-14 pb-12 md:pt-20" aria-hidden="true">
      <div className="h-4 w-40 rounded-full bg-panel" />
      <div className="mt-8 h-12 w-2/3 rounded-card bg-panel" />
      <div className="mt-6 h-5 w-1/2 rounded-card bg-panel" />
    </Container>
  );
}

async function SubjectContent({
  params,
}: {
  params: PageProps<"/materias/[materia]">["params"];
}) {
  const { materia } = await params;
  const subject = await getSubjectProgram(materia);

  if (!subject) notFound();

  const lessonCount = subject.units.reduce(
    (total, unit) => total + unit.lessons.length,
    0,
  );
  const firstLesson = subject.units
    .flatMap((unit) =>
      unit.lessons.map((lesson) => ({
        href: `/materias/${subject.slug}/${unit.slug}/${lesson.slug}`,
      })),
    )
    .at(0);

  return (
    <>
      <Container className="pt-14 pb-12 md:pt-20">
        <PageHeader
          eyebrow={`${yearLabel(subject.year)} · Plan de estudios`}
          title={subject.name}
          description={subject.description}
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <AreaLabel area={subject.area} />
            <span className="text-caption text-muted">
              {subject.units.length} unidades
            </span>
            <span className="text-caption text-muted">
              {lessonCount} clases publicadas
            </span>
            {subject.credits ? (
              <span className="text-caption text-muted">
                {subject.credits} créditos
              </span>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {firstLesson ? (
              <ButtonLink href={firstLesson.href} variant="gradient">
                Empezar por la primera clase
              </ButtonLink>
            ) : null}
            <ButtonLink href="/plan">Volver al plan</ButtonLink>
          </div>
        </PageHeader>
      </Container>

      {subject.units.map((unit) => (
        <Section key={unit.id} eyebrow="Unidad" title={unit.title}>
          {unit.description ? (
            <p className="mb-8 max-w-2xl text-body text-cream/70">
              {unit.description}
            </p>
          ) : null}

          {unit.lessons.length ? (
            <ul className="flex flex-col">
              {unit.lessons.map((lesson, index) => (
                <li key={lesson.id}>
                  {index > 0 ? (
                    <div
                      aria-hidden="true"
                      className="h-px w-full bg-hairline"
                    />
                  ) : null}
                  <Link
                    href={`/materias/${subject.slug}/${unit.slug}/${lesson.slug}`}
                    className="group flex flex-col gap-2 py-6 md:flex-row md:items-baseline md:justify-between md:gap-10"
                  >
                    <div className="max-w-2xl">
                      <h3 className="text-body-lg text-cream transition-colors duration-150 group-hover:text-brand-soft">
                        {lesson.title}
                      </h3>
                      {lesson.excerpt ? (
                        <p className="mt-2 text-body-sm text-cream/70">
                          {lesson.excerpt}
                        </p>
                      ) : null}
                    </div>
                    <p className="shrink-0 text-caption text-muted">
                      {readingTime(lesson.readingMinutes)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body text-muted">
              Todavía no hay clases publicadas en esta unidad.
            </p>
          )}
        </Section>
      ))}
    </>
  );
}
