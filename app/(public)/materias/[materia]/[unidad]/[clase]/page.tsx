import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AreaLabel } from "@/components/ui/area-label";
import { Container } from "@/components/ui/container";
import {
  getAllLessonPaths,
  getLessonByPath,
  getLessonNeighbors,
} from "@/lib/content/queries";
import { readingTime } from "@/lib/format";
import { extractHeadings, LessonContent } from "@/lib/tiptap/render";

export async function generateStaticParams() {
  const paths = await getAllLessonPaths();
  return paths;
}

export async function generateMetadata({
  params,
}: PageProps<"/materias/[materia]/[unidad]/[clase]">): Promise<Metadata> {
  const { materia, unidad, clase } = await params;
  const detail = await getLessonByPath(materia, unidad, clase);

  if (!detail) return { title: "Clase no encontrada" };

  return {
    title: `${detail.lesson.title} · ${detail.subject.name}`,
    description: detail.lesson.excerpt,
    openGraph: {
      title: detail.lesson.title,
      description: detail.lesson.excerpt,
      type: "article",
    },
  };
}

export default function LessonPage({
  params,
}: PageProps<"/materias/[materia]/[unidad]/[clase]">) {
  return (
    <Suspense fallback={<LessonSkeleton />}>
      <LessonArticle params={params} />
    </Suspense>
  );
}

function LessonSkeleton() {
  return (
    <Container className="pt-10 pb-20 md:pt-16" aria-hidden="true">
      <div className="h-4 w-64 rounded-full bg-panel" />
      <div className="mt-10 h-4 w-32 rounded-full bg-panel" />
      <div className="mt-6 h-12 w-3/4 rounded-card bg-panel" />
      <div className="mt-6 h-5 w-1/2 rounded-card bg-panel" />
      <div className="mt-12 h-64 w-full rounded-card bg-panel/60" />
    </Container>
  );
}

async function LessonArticle({
  params,
}: {
  params: PageProps<"/materias/[materia]/[unidad]/[clase]">["params"];
}) {
  const { materia, unidad, clase } = await params;
  const detail = await getLessonByPath(materia, unidad, clase);

  if (!detail) notFound();

  const { lesson, unit, subject } = detail;
  const [neighbors, headings] = await Promise.all([
    getLessonNeighbors(subject.slug, lesson.id),
    Promise.resolve(extractHeadings(lesson.content)),
  ]);
  const { previous, next } = neighbors;

  return (
    <article>
      <Container className="pt-10 pb-12 md:pt-16">
        <nav aria-label="Ubicación" className="text-caption text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/plan"
                className="transition-colors duration-150 hover:text-cream"
              >
                Plan
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/materias/${subject.slug}`}
                className="transition-colors duration-150 hover:text-cream"
              >
                {subject.name}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>{unit.title}</li>
          </ol>
        </nav>

        <header className="mt-8 max-w-3xl">
          <AreaLabel area={subject.area} />
          <h1 className="mt-4 text-heading-sm text-cream md:text-heading">
            {lesson.title}
          </h1>
          {lesson.excerpt ? (
            <p className="mt-4 max-w-2xl text-body-lg text-cream/80">
              {lesson.excerpt}
            </p>
          ) : null}
          <p className="mt-6 text-caption text-muted">
            {readingTime(lesson.readingMinutes)} · {unit.title} · {subject.name}
          </p>
        </header>

        {headings.length ? (
          <details className="mt-10 rounded-card border border-hairline p-5 lg:hidden">
            <summary className="cursor-pointer list-none text-body-sm text-cream [&::-webkit-details-marker]:hidden">
              En esta clase
            </summary>
            <Toc headings={headings} className="mt-4" />
          </details>
        ) : null}
      </Container>

      <Container className="pb-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-16">
          <div className="min-w-0">
            <LessonContent content={lesson.content} />

            {previous || next ? (
              <nav
                aria-label="Clases contiguas"
                className="mt-20 grid gap-4 border-t border-hairline pt-8 sm:grid-cols-2"
              >
                {previous ? (
                  <Link
                    href={previous.href}
                    className="group rounded-card border border-hairline p-5 transition-colors duration-150 hover:border-cream/50"
                  >
                    <span className="text-caption text-muted">Anterior</span>
                    <span className="mt-2 block text-body-sm text-cream transition-colors duration-150 group-hover:text-brand-soft">
                      {previous.title}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}

                {next ? (
                  <Link
                    href={next.href}
                    className="group rounded-card border border-hairline p-5 transition-colors duration-150 hover:border-cream/50 sm:text-right"
                  >
                    <span className="text-caption text-muted">Siguiente</span>
                    <span className="mt-2 block text-body-sm text-cream transition-colors duration-150 group-hover:text-brand-soft">
                      {next.title}
                    </span>
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </div>

          {headings.length ? (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-caption text-muted">En esta clase</p>
                <Toc headings={headings} className="mt-4" />
              </div>
            </aside>
          ) : null}
        </div>
      </Container>
    </article>
  );
}

function Toc({
  headings,
  className,
}: {
  headings: { id: string; text: string; level: 2 | 3 }[];
  className?: string;
}) {
  return (
    <ol className={className}>
      {headings.map((heading) => (
        <li
          key={heading.id}
          className={heading.level === 3 ? "pl-4" : undefined}
        >
          <a
            href={`#${heading.id}`}
            className="block py-1 text-body-sm text-cream/70 transition-colors duration-150 hover:text-cream"
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
}
