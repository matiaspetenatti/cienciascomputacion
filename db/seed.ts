import { extractText, readingMinutes } from "../lib/tiptap/text";
import { client, db } from "./index";
import { lessonRevisions, lessons, subjects, units } from "./schema";
import { seedSubjects } from "./seed-data";

/**
 * Seed destructivo: borra el contenido y lo vuelve a cargar.
 * Solo para desarrollo local. Nunca apuntar TURSO_DATABASE_URL a producción.
 */
async function main() {
  if (process.env.TURSO_DATABASE_URL?.startsWith("libsql://")) {
    throw new Error(
      "El seed es destructivo y TURSO_DATABASE_URL apunta a una base remota. Abortando.",
    );
  }

  console.log("Limpiando contenido…");
  await db.delete(lessonRevisions);
  await db.delete(lessons);
  await db.delete(units);
  await db.delete(subjects);

  const now = new Date();
  let subjectCount = 0;
  let unitCount = 0;
  let lessonCount = 0;

  for (const [subjectPosition, subject] of seedSubjects.entries()) {
    const subjectId = `sub_${subject.slug}`;

    await db.insert(subjects).values({
      id: subjectId,
      slug: subject.slug,
      name: subject.name,
      area: subject.area,
      year: subject.year,
      credits: subject.credits,
      description: subject.description,
      position: subjectPosition,
      createdAt: now,
      updatedAt: now,
    });
    subjectCount++;

    for (const [unitPosition, unit] of subject.units.entries()) {
      const unitId = `uni_${subject.slug}_${unit.slug}`;

      await db.insert(units).values({
        id: unitId,
        subjectId,
        slug: unit.slug,
        title: unit.title,
        description: unit.description ?? null,
        position: unitPosition,
      });
      unitCount++;

      for (const [lessonPosition, lesson] of (unit.lessons ?? []).entries()) {
        const plainText = extractText(lesson.content);

        await db.insert(lessons).values({
          id: `les_${subject.slug}_${unit.slug}_${lesson.slug}`,
          unitId,
          slug: lesson.slug,
          title: lesson.title,
          excerpt: lesson.excerpt,
          content: lesson.content,
          plainText,
          status: "published",
          publishedAt: now,
          readingMinutes: readingMinutes(plainText),
          position: lessonPosition,
          createdAt: now,
          updatedAt: now,
        });
        lessonCount++;
      }
    }
  }

  console.log(
    `Listo: ${subjectCount} materias, ${unitCount} unidades, ${lessonCount} clases.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.close());
