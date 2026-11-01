import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db";
import type { Lesson, Subject, Unit } from "@/db/schema";
import { lessons, subjects, units } from "@/db/schema";

export const CONTENT_TAG = "contenido";

export type PlanYear = {
  year: number;
  subjects: Subject[];
};

export type SubjectWithProgram = Subject & {
  units: (Unit & { lessons: LessonSummary[] })[];
};

export type LessonSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  readingMinutes: number;
  unitId: string;
};

export type LessonDetail = {
  lesson: Lesson;
  unit: Unit;
  subject: Subject;
};

export type LessonLink = {
  title: string;
  href: string;
};

/* ------------------------------------------------------------------ */
/* Plan                                                                */
/* ------------------------------------------------------------------ */

export async function getPlan(): Promise<PlanYear[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);

  const rows = await db
    .select()
    .from(subjects)
    .orderBy(asc(subjects.year), asc(subjects.position));

  const byYear = new Map<number, Subject[]>();
  for (const subject of rows) {
    const bucket = byYear.get(subject.year) ?? [];
    bucket.push(subject);
    byYear.set(subject.year, bucket);
  }

  return [...byYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, group]) => ({ year, subjects: group }));
}

export async function getSubjects(): Promise<Subject[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);

  return db
    .select()
    .from(subjects)
    .orderBy(asc(subjects.year), asc(subjects.position));
}

/* ------------------------------------------------------------------ */
/* Materia                                                             */
/* ------------------------------------------------------------------ */

export async function getSubjectProgram(
  subjectSlug: string,
): Promise<SubjectWithProgram | null> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);

  const [subject] = await db
    .select()
    .from(subjects)
    .where(eq(subjects.slug, subjectSlug))
    .limit(1);

  if (!subject) return null;

  const unitRows = await db
    .select()
    .from(units)
    .where(eq(units.subjectId, subject.id))
    .orderBy(asc(units.position));

  const unitIds = unitRows.map((unit) => unit.id);

  const lessonRows = unitIds.length
    ? await db
        .select({
          id: lessons.id,
          slug: lessons.slug,
          title: lessons.title,
          excerpt: lessons.excerpt,
          readingMinutes: lessons.readingMinutes,
          unitId: lessons.unitId,
        })
        .from(lessons)
        .where(
          and(
            eq(lessons.status, "published"),
            inArray(lessons.unitId, unitIds),
          ),
        )
        .orderBy(asc(lessons.position))
    : [];

  return {
    ...subject,
    units: unitRows.map((unit) => ({
      ...unit,
      lessons: lessonRows.filter((lesson) => lesson.unitId === unit.id),
    })),
  };
}

export async function getSubjectSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);

  const rows = await db.select({ slug: subjects.slug }).from(subjects);
  return rows.map((row) => row.slug);
}

/* ------------------------------------------------------------------ */
/* Clase                                                               */
/* ------------------------------------------------------------------ */

export async function getLessonByPath(
  subjectSlug: string,
  unitSlug: string,
  lessonSlug: string,
): Promise<LessonDetail | null> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);

  const [row] = await db
    .select({ lesson: lessons, unit: units, subject: subjects })
    .from(lessons)
    .innerJoin(units, eq(lessons.unitId, units.id))
    .innerJoin(subjects, eq(units.subjectId, subjects.id))
    .where(
      and(
        eq(subjects.slug, subjectSlug),
        eq(units.slug, unitSlug),
        eq(lessons.slug, lessonSlug),
        eq(lessons.status, "published"),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function getLessonNeighbors(
  subjectSlug: string,
  lessonId: string,
): Promise<{ previous: LessonLink | null; next: LessonLink | null }> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);

  const rows = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      subjectSlug: subjects.slug,
      unitSlug: units.slug,
      lessonSlug: lessons.slug,
      unitPosition: units.position,
      lessonPosition: lessons.position,
    })
    .from(lessons)
    .innerJoin(units, eq(lessons.unitId, units.id))
    .innerJoin(subjects, eq(units.subjectId, subjects.id))
    .where(and(eq(subjects.slug, subjectSlug), eq(lessons.status, "published")))
    .orderBy(
      asc(subjects.position),
      asc(units.position),
      asc(lessons.position),
    );

  const index = rows.findIndex((row) => row.id === lessonId);
  if (index === -1) return { previous: null, next: null };

  const toLink = (row: (typeof rows)[number]): LessonLink => ({
    title: row.title,
    href: `/materias/${row.subjectSlug}/${row.unitSlug}/${row.lessonSlug}`,
  });

  return {
    previous: index > 0 ? toLink(rows[index - 1]) : null,
    next: index < rows.length - 1 ? toLink(rows[index + 1]) : null,
  };
}

export async function getAllLessonPaths() {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);

  return db
    .select({
      materia: subjects.slug,
      unidad: units.slug,
      clase: lessons.slug,
    })
    .from(lessons)
    .innerJoin(units, eq(lessons.unitId, units.id))
    .innerJoin(subjects, eq(units.subjectId, subjects.id))
    .where(eq(lessons.status, "published"));
}

/* ------------------------------------------------------------------ */
/* Home                                                               */
/* ------------------------------------------------------------------ */

export async function getSiteStats() {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);

  const [subjectsCount] = await db
    .select({ value: sql<number>`count(*)` })
    .from(subjects);
  const [lessonsCount] = await db
    .select({ value: sql<number>`count(*)` })
    .from(lessons)
    .where(eq(lessons.status, "published"));
  const [yearsCount] = await db
    .select({ value: sql<number>`count(distinct year)` })
    .from(subjects);

  return {
    subjects: Number(subjectsCount?.value ?? 0),
    lessons: Number(lessonsCount?.value ?? 0),
    years: Number(yearsCount?.value ?? 0),
  };
}

export async function getLatestLessons(limit = 3) {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);

  const rows = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      excerpt: lessons.excerpt,
      readingMinutes: lessons.readingMinutes,
      subjectName: subjects.name,
      subjectSlug: subjects.slug,
      unitSlug: units.slug,
      lessonSlug: lessons.slug,
      area: subjects.area,
    })
    .from(lessons)
    .innerJoin(units, eq(lessons.unitId, units.id))
    .innerJoin(subjects, eq(units.subjectId, subjects.id))
    .where(eq(lessons.status, "published"))
    .orderBy(desc(lessons.publishedAt))
    .limit(limit);

  return rows;
}
