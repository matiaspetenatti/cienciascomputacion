import type { MetadataRoute } from "next";

import { getAllLessonPaths, getSubjects } from "@/lib/content/queries";

function baseUrl(): string {
  return process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [subjects, lessons] = await Promise.all([
    getSubjects(),
    getAllLessonPaths(),
  ]);

  const staticRoutes = ["", "/plan", "/recursos", "/sobre", "/contacto"].map(
    (path) => ({
      url: `${baseUrl()}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    }),
  );

  const subjectRoutes = subjects.map((subject) => ({
    url: `${baseUrl()}/materias/${subject.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const lessonRoutes = lessons.map((lesson) => ({
    url: `${baseUrl()}/materias/${lesson.materia}/${lesson.unidad}/${lesson.clase}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...subjectRoutes, ...lessonRoutes];
}
