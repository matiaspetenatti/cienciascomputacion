import type { JSONContent } from "@tiptap/core";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/**
 * Las tablas de Better Auth (`user`, `session`, `account`, `verification`) se
 * agregan en la Fase 2 con `pnpm auth:generate`. Hasta entonces no existen, y
 * `lesson_revisions.created_by` queda sin foreign key a propósito.
 */

export const SUBJECT_AREAS = [
  "teoria",
  "software",
  "sistemas",
  "datos",
  "electivas",
] as const;

export type SubjectArea = (typeof SUBJECT_AREAS)[number];

export const LESSON_STATUSES = [
  "draft",
  "published",
  "scheduled",
  "archived",
] as const;

export type LessonStatus = (typeof LESSON_STATUSES)[number];

const timestamps = () => ({
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const subjects = sqliteTable(
  "subjects",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    area: text("area", { enum: SUBJECT_AREAS }).notNull(),
    year: integer("year").notNull(),
    description: text("description").notNull().default(""),
    credits: integer("credits"),
    position: integer("position").notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("subjects_slug_unique").on(table.slug),
    index("subjects_year_idx").on(table.year),
  ],
);

export const units = sqliteTable(
  "units",
  {
    id: text("id").primaryKey(),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    position: integer("position").notNull().default(0),
  },
  (table) => [
    uniqueIndex("units_subject_slug_unique").on(table.subjectId, table.slug),
  ],
);

export const lessons = sqliteTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    unitId: text("unit_id")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    content: text("content", { mode: "json" }).$type<JSONContent>().notNull(),
    plainText: text("plain_text").notNull().default(""),
    status: text("status", { enum: LESSON_STATUSES })
      .notNull()
      .default("draft"),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    readingMinutes: integer("reading_minutes").notNull().default(0),
    position: integer("position").notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("lessons_unit_slug_unique").on(table.unitId, table.slug),
    index("lessons_status_idx").on(table.status),
    index("lessons_published_idx").on(table.publishedAt),
  ],
);

export const lessonRevisions = sqliteTable(
  "lesson_revisions",
  {
    id: text("id").primaryKey(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content", { mode: "json" }).$type<JSONContent>().notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    createdBy: text("created_by").notNull().default("system"),
  },
  (table) => [index("lesson_revisions_lesson_idx").on(table.lessonId)],
);

export const media = sqliteTable(
  "media",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    url: text("url").notNull(),
    alt: text("alt").notNull().default(""),
    caption: text("caption"),
    width: integer("width"),
    height: integer("height"),
    bytes: integer("bytes"),
    mime: text("mime").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("media_key_unique").on(table.key)],
);

export type Subject = typeof subjects.$inferSelect;
export type Unit = typeof units.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
