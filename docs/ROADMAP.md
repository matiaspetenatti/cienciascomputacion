# Roadmap

Cada fase termina en algo usable, no en algo a medio hacer. Si una fase no se puede cerrar, se recorta el alcance, no se abre la siguiente.

El orden no es negociable en un punto: **la Fase 1 valida el pipeline de contenido antes de construir el admin**. Si Tiptap → JSON → render no funciona de punta a punta, todo lo demás se construye sobre arena.

---

## Fase 0 — Fundaciones

**Objetivo:** que el sitio exista, se vea como el `DESIGN.md` y tenga la base de datos lista.

### Dependencias

- [x] `drizzle-orm`, `@libsql/client`, `drizzle-kit`
- [x] `better-auth`
- [x] `zod`
- [x] `@tiptap/react`, `@tiptap/starter-kit` y extensiones base
- [x] `shiki`, `katex`, `mermaid`
- [x] `vitest`
- [x] `@playwright/test`
- [x] `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- [x] `tsx` para scripts
- [x] `next/font`: Inter Tight + JetBrains Mono

### Trabajo

- [x] Volcar los tokens del `DESIGN.md` en `app/globals.css` (`@theme`), con los nombres semánticos de `docs/ARQUITECTURA.md` §13.
- [x] Reemplazar el tema de `create-next-app` (Geist, `prefers-color-scheme`, `bg-zinc-50`).
- [x] `app/layout.tsx`: `lang="es"`, fuentes, fondo canvas, `theme-color`.
- [x] Design system en `components/ui/`: `ButtonLink` (pill fantasma + variante degradada), `AreaLabel`/`AreaTag` (color de área), `BracketLabel` (`{ … }`), `Divider`, `Container`, `PageHeader`, `Section`.
- [x] `components/layout/Nav` y `Footer` según el reference (links crema, sin relleno, footer en `#191919`).
- [x] `db/schema.ts` con todas las tablas de §4 + migración generada.
- [x] `db/index.ts` con libSQL (archivo local en dev).
- [x] `db/seed.ts` con un plan de estudios **provisorio** de 25 materias y 6 clases (se reemplaza cuando llegue el real).
- [x] Scripts de `package.json`: `typecheck`, `format`, `format:check`, `db:generate`, `db:migrate`, `db:seed`, `db:studio`, `test`.

### Criterio de salida

`pnpm dev` levanta, la home muestra un hero con el display tipográfico y un botón pill, y `pnpm db:migrate && pnpm db:seed` deja datos consultables con `db:studio`.

**Riesgo:** que el display de 224px se vea mal en mobile. Se resuelve con el `clamp()` documentado, no achicando la escala.

---

## Fase 1 — Slice vertical de contenido

**Objetivo:** una clase real, escrita a mano en la DB, renderizada de punta a punta con todos los bloques.

### Trabajo

- [x] `lib/tiptap/extensions.ts` con: StarterKit, `callout`, `image`, `mathematics`, `mermaid`, `quiz`.
- [x] `lib/tiptap/schema.ts` con el tipo del documento y validación Zod.
- [x] `lib/tiptap/render.tsx` con el mapa nodo → componente (cubre todos los nodos de `extensions.ts`).
- [x] `components/lesson/blocks/`: `CodeBlock` (Shiki), `Callout`, `Figure`, `MathBlock` (KaTeX), `Mermaid` (isla), `Quiz` (isla).
- [x] Ruta `/materias/[materia]/[unidad]/[clase]` con `generateStaticParams`, `generateMetadata` y `'use cache'`.
- [x] Ruta `/materias/[materia]` con el programa y la lista de clases.
- [x] Ruta `/plan` agrupada por año, con el color de área por materia.
- [x] Un documento JSON de prueba con **todos** los bloques (`tests/fixtures/lesson-all-blocks.ts`).
- [x] `tests/tiptap.test.tsx`: round-trip de ese documento.

### Criterio de salida

Una clase con código, un callout, una fórmula, un diagrama y un quiz se ve completa. Verificado: la página no hidrata JS si le sacás el diagrama, el quiz y el TOC.

**Riesgo:** divergencia entre el renderer del server y el editor. Lo cubre el test de round-trip; no se avanza sin él.

---

## Fase 2 — Admin

**Objetivo:** publicar una clase sin tocar la DB ni el código.

### Trabajo

- [ ] `lib/auth.ts` con Better Auth + `drizzleAdapter`, sign-up deshabilitado.
- [ ] `app/api/auth/[...all]/route.ts`.
- [ ] `scripts/create-admin.ts` desde env.
- [ ] `/ingresar` con formulario y errores legibles.
- [ ] `lib/guard.ts` con `requireAdmin()`.
- [ ] `proxy.ts` con chequeo optimista de cookie para `/admin/*`.
- [ ] `app/(admin)/layout.tsx`: chrome estático + `{children}` en `<Suspense>`.
- [ ] `/admin`: listado con estado, materia, última edición.
- [ ] `/admin/clases/nueva` y `/admin/clases/[id]` con el editor Tiptap.
- [ ] Autosave del borrador (debounce 2 s) y guardado explícito.
- [ ] `/admin/materias` y `/admin/unidades`: crear, reordenar, editar.
- [ ] `PublishPanel`: publicar, despublicar, estado, slug.
- [ ] `lib/content/mutations.ts` con `invalidateContent()` y guard en cada action.
- [ ] Preview: `/admin/clases/[id]/preview` renderizando con el mismo renderer.

### Criterio de salida

Escribís una clase nueva, la publicás y aparece en `/plan`, en la materia y en la clase sin redeploy. E2E: login → crear → publicar → ver el cambio.

**Riesgo:** el guard olvidado en un action. Se revisa action por action antes de cerrar la fase.

---

## Fase 3 — Contenido real

**Objetivo:** que el día a día de escribir sea cómodo y seguro.

### Trabajo

- [ ] `/api/upload` con presignado a R2 y validación de MIME/tamaño.
- [ ] `MediaPicker` en el editor + registro en `media` + `alt` obligatorio.
- [ ] `next.config.ts` con `images.remotePatterns` del bucket.
- [ ] Historial de revisiones: guardar en cada publicación, listar y restaurar.
- [ ] Publicación programada + `vercel.json` con el cron + `/api/cron/publicar`.
- [ ] Papelera (soft delete) con confirmación.
- [ ] Slug editable con validación de unicidad y aviso de links rotos.
- [ ] `lib/redirects.ts` + `proxy.ts` para redirects 301 de slugs viejos.

### Criterio de salida

Subís una imagen desde el editor, programás una clase para el lunes, restaurás una versión anterior y recuperás una clase borrada.

---

## Fase 4 — Experiencia de lectura

**Objetivo:** que leer la carrera se sienta como un curso y no como una lista de páginas.

### Trabajo

- [x] TOC lateral generado desde los headings, con anclas (sin scrollspy).
- [ ] Scrollspy del TOC: resaltar la sección visible.
- [x] Navegación anterior/siguiente dentro de la materia.
- [ ] Salto a la unidad siguiente al final de la clase.
- [ ] Botón "copiar" en los bloques de código.
- [x] Metadatos: tiempo de lectura, materia y unidad.
- [ ] Fecha de actualización en la clase.
- [ ] `ViewTracker` + progreso por materia en `localStorage`.
- [ ] "Continuar donde dejaste" en el home.
- [ ] `/buscar` con FTS5, `Suspense` y resaltado del fragmento.
- [ ] Atajo `⌘K` / `Ctrl+K` para abrir la búsqueda.

### Criterio de salida

Podés leer la carrera entera en el celular, volver al día siguiente y retomar donde estabas, y encontrar una clase por una palabra que aparecía en el texto.

---

## Fase 5 — Producción

**Objetivo:** publicarlo sin vergüenza.

### Trabajo

- [ ] `generateMetadata` completo en todas las rutas + canonical.
- [ ] OG images con `next/og` por clase y por materia.
- [ ] `sitemap.ts` y `robots.ts`.
- [ ] JSON-LD `Course` / `LearningResource`.
- [ ] 404 y `error.tsx` con el estilo del sitio.
- [ ] Auditoría de accesibilidad: teclado, contraste, foco, headings, `reduced-motion`.
- [ ] Auditoría de performance: Lighthouse ≥ 95 en lectura, sin CLS por Mermaid/KaTeX.
- [ ] Playwright de humo en CI.
- [ ] Deploy a Vercel + Turso + R2, dominio, variables de entorno.
- [ ] `README.md` con setup real (hoy es el de `create-next-app`).

### Criterio de salida

El sitio está en un dominio propio, indexable, con el build verde y el cron corriendo.

---

## Fuera de alcance (decidido, no pendiente)

No se hace ni ahora ni "después si sobra tiempo":

- Cuentas de alumno, perfil, progreso en servidor.
- Entregas de ejercicios, corrección automática, notas, certificados.
- Comentarios, foro, newsletter.
- Multi-idioma.
- Modo claro.
- Búsqueda semántica o con embeddings. FTS5 alcanza.
- Aplicación móvil o PWA offline.
- Múltiples autores o roles.
- Editor colaborativo.

Si alguna de estas aparece como pedido, primero hay que cambiar el objetivo del producto, no agregar una feature.

---

## Insumo bloqueante

Antes de la Fase 0 hace falta:

1. **La lista de materias** con año y área (para el seed y `/plan`).
2. **El nombre** de la carrera y del sitio.
3. Confirmación del mapeo de áreas a colores de §13 de `docs/ARQUITECTURA.md`.

Mientras tanto, la Fase 0 se puede arrancar con un plan provisorio de dos materias.
