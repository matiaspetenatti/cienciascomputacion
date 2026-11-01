<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Ciencias de la Computación — guía para agentes

## Qué es este proyecto

Sitio público y gratuito que presenta una carrera de grado en Ciencias de la Computación con el formato de curso abierto de Full Stack Open: **plan de estudios → materia → unidad → clase**. El contenido lo escribe una sola persona desde un dashboard con Tiptap. No hay cuentas de alumno, ni entregas, ni notas.

El objetivo del sitio es que alguien pueda empezar por el plan y leer la carrera entera sin fricción, y que el autor pueda publicar una clase nueva en menos de un minuto.

## Orden de lectura obligatorio

1. `DESIGN.md` — sistema visual. **Es ley.** No se reinterpreta.
2. `docs/ARQUITECTURA.md` — modelo de datos, rutas, caching, auth y flujos.
3. `docs/ROADMAP.md` — qué fase toca y qué está explícitamente afuera.
4. `node_modules/next/dist/docs/` — documentación de la versión instalada. Ante cualquier duda de API, esta carpeta gana sobre tu memoria.

Si el código contradice estos documentos, gana el documento. Si el documento está desactualizado, **actualizalo en el mismo cambio** que el código.

## Stack

| Pieza | Elección |
|---|---|
| Framework | Next.js 16.4 (App Router, Turbopack) |
| Lenguaje | TypeScript `strict` |
| Estilos | Tailwind v4 vía `@tailwindcss/turbopack` |
| DB | SQLite local → Turso/libSQL en producción |
| ORM | Drizzle + `drizzle-kit` |
| Auth | Better Auth (email + contraseña, un solo admin) |
| Editor | Tiptap 3, contenido guardado como JSON |
| Imágenes | Cloudflare R2 con uploads presignados |
| Deploy | Vercel + cron de Vercel |

`next.config.ts` ya tiene `cacheComponents: true` y `partialPrefetching: true`. **No los desactives.** No agregues `postcss.config.js`: Tailwind entra por la regla de Turbopack del config.

## Next.js 16: lo que cambió

- **`params` y `searchParams` son Promises.** Se tipan con los helpers generados (`PageProps<'/materias/[materia]'>`, `LayoutProps<'/'>`) y se `await`ean. Nunca los tipes a mano con `{ params: { slug: string } }`.
- **No existe `middleware.ts`.** Se llama `proxy.ts` y se ubica en la raíz. Es para redirects baratos, no para autorizar: el propio equipo de Next lo desaconseja para sesiones.
- **Cache Components manda.** Toda ruta debe producir un *static shell*. Lo que no se puede prerenderizar va dentro de `'use cache'` o de un `<Suspense>`. Si `next dev` marca un insight `blocking-prerender-*`, no lo silencies con `export const instant = false`: resolvelo con el patrón que sugiere el overlay.
- **Lecturas en RSC, mutaciones en Server Actions.** No hay route handlers para CRUD interno.
- **`cookies()`, `headers()` y `connection()` son runtime APIs.** Leerlos en un layout o página sin `<Suspense>` rompe el prerender.
- Las fuentes se cargan con `next/font/google`, nunca con `<link>` a Google Fonts.

## Comandos

Los scripts de `package.json` son el contrato. Si falta uno, agregalo en el mismo cambio que la feature.

```bash
pnpm dev            # next dev (escribe/actualiza el bloque de AGENTS.md)
pnpm build          # build de producción
pnpm lint           # eslint
pnpm typecheck      # tsc --noEmit
pnpm format         # prettier --write
pnpm format:check   # prettier --check, sin escribir
pnpm db:generate    # drizzle-kit generate
pnpm db:migrate     # tsx scripts/migrate.ts
pnpm db:seed        # carga el plan de estudios
pnpm db:studio      # inspección local
pnpm test           # vitest
```

`test:e2e` y `auth:generate` todavía no tienen su tooling instalado (Playwright, Better Auth CLI). Se agregan a `package.json` cuando entren esas fases; hasta entonces no existen.

## Estructura

```
app/
  (public)/            layout con nav + footer, todas las páginas públicas
  (admin)/             layout con guard de sesión, todo /admin
  api/auth/[...all]/   handler de Better Auth
  api/cron/            publicación programada
  globals.css          tokens de Tailwind (@theme) + base
  layout.tsx           <html>, fuentes, theme-color
components/
  ui/                  Button, Pill, Tag, Divider, BracketLabel (design system)
  layout/              Nav, Footer, Section, SkipLink
  lesson/              Prose, Toc, LessonNav, ReadingMeta, ViewTracker
  lesson/blocks/       un componente de render por cada nodo de Tiptap
  admin/               Editor, Toolbar, PublishPanel, MediaPicker, RevisionList
lib/
  tiptap/extensions.ts ÚNICA lista de extensiones
  tiptap/render.tsx    JSON → React en el server
  tiptap/schema.ts     tipos y validación Zod del JSON
  content/queries.ts   todas las lecturas cacheadas
  content/mutations.ts todas las escrituras + revalidación
  auth.ts              instancia de Better Auth
  guard.ts             requireAdmin()
  storage/r2.ts        presignado de uploads
  seo.ts               metadata y JSON-LD compartidos
db/
  schema.ts            tablas Drizzle
  index.ts             cliente libSQL
  migrations/          SQL versionado
  seed.ts              plan de estudios inicial
docs/                  arquitectura y roadmap
tests/                 vitest (unit) y playwright (e2e)
proxy.ts               redirects baratos, si hacen falta
```

## Cómo escribir código

Lo mecánico lo resuelve el tooling: `pnpm format:check` (Prettier + orden de clases Tailwind), `pnpm lint` (ESLint + orden de imports + `no-console`) y `pnpm typecheck`. Acá va solo lo que ninguna herramienta puede verificar.

### Idioma y nombres

- Identificadores en inglés; comentarios y copy en español. La UI habla rioplatense, el código no.
- Archivos en kebab-case, siempre: `button-link.tsx`, `reading-time.ts`. Las rutas de `app/` siguen la URL.
- Componentes con export nombrado (`export function ButtonLink`). `export default` solo donde Next lo exige: `page`, `layout`, `error`, `not-found`, `robots`, `sitemap`.
- Un componente exportado por archivo. Los subcomponentes privados (`Toc`) viven abajo, en el mismo archivo.
- Props: `type ButtonLinkProps = {…}` arriba del componente. Los subcomponentes privados pueden tipar inline.
- Booleanos `is/has/can/should`; handlers `handleX`, props `onX`; lecturas `getX`/`listX`/`searchX`; escrituras con verbo en imperativo.
- Sin abreviaturas fuera del dominio (`db`, `id`, `url` sí; `usr`, `cfg`, `btn` no). Si no encontrás un nombre concreto, la función hace demasiado.
- `lib/utils.ts` tiene `cn` y nada más. Un helper nuevo va a un módulo con nombre propio; no hay cajón de sastre.

### TypeScript

- `type` por defecto; `interface` solo para extender o para declaration merging.
- `as` únicamente como `as const`. Prohibidos `!` y `@ts-expect-error` sin justificación al lado.
- `unknown` + narrowing en los bordes. Zod valida ahí; el tipo se infiere con `z.infer` y no se reescribe a mano.
- Sin `enum`: `[...] as const` + `(typeof X)[number]`, como `SUBJECT_AREAS`.
- Los tipos de Drizzle no salen de `db/` ni de `lib/content/`: los componentes reciben tipos de dominio (`LessonSummary`, `PlanYear`).

### Componentes

- Server por defecto. `"use client"` solo en la hoja que necesita estado, efectos o handlers; jamás en un `layout.tsx` ni en una `page.tsx` (única excepción: `/ingresar`).
- Sin `useEffect` para derivar estado ni para leer datos: se deriva en render, se lee en RSC.
- `page.tsx` hace tres cosas: `metadata`, leer datos y componer. Si pasa las ~80 líneas, se extraen componentes.
- Lecturas independientes en paralelo (`Promise.all`), no en cascada.
- React 19 pasa `ref` como prop: no uses `forwardRef`.
- `key` estable; el índice solo en listas estáticas.

### Estilos

- Los componentes de `components/ui` aceptan `className` para composición, pero la variante se elige por prop (`variant`), no reescribiendo clases desde afuera.
- Clases condicionales con `cn()` de `lib/utils.ts`, nunca template strings con `&&`.
- Arbitrary values (`py-[15px]`, `[&::-webkit-details-marker]:hidden`) solo para ajustes ópticos puntuales. Nunca para color, tipografía ni radios: esos salen de tokens.
- Cero `style={{}}`, salvo para inyectar variables CSS de área.

### Datos y acciones

- Una Server Action, en este orden: `requireAdmin()` → `schema.safeParse` → lógica → `invalidateContent()` → `{ ok: true } | { ok: false, error }`.
- Los errores esperados se devuelven; solo los inesperados se lanzan. Nunca se tira un string.
- `'use server'` por archivo, no por función.
- Queries: `select` explícito con la forma que se necesita, `innerJoin`/`db.query` para relaciones, `sql` crudo solo en agregados y búsqueda.
- Transacción para toda escritura que toque más de una tabla.
- Cero lógica de negocio en componentes: funciones puras en `lib/`, testeadas.

### Errores y logs

- Sin `console.log`. `console.error` solo en el `catch` de un route handler o un script.
- `catch` nunca vacío: si el error se ignora, un comentario dice por qué.
- Los mensajes al usuario son accionables, en español, sin códigos internos ni stack traces.

### Comentarios

- Solo el *por qué*. Si hace falta un comentario para explicar qué hace una función, el nombre está mal.
- JSDoc solo cuando el contrato no se lee del tipo; el de `lib/tiptap/render.tsx` es el modelo.
- Prohibido código comentado y comentarios de cambio (`// nuevo`, `// fix`). Un `TODO` sin dueño ni motivo no existe.

### Tests

- Un `describe` por unidad exportada; los casos describen comportamiento en español: "devuelve null si la clase no está publicada".
- Se prueba comportamiento, no implementación. Sin snapshots de árboles enteros.
- Todo bug arreglado deja un test que falla sin el fix.
- Factories en `tests/factories.ts`; nunca datos reales de la DB.

### Git

- Conventional Commits en inglés: `feat: add lesson toc`, `fix: invalidate content on unpublish`.
- Un commit = un cambio coherente, con su doc y su test. Sin `wip`, sin `--no-verify`.
- Si el diff pasa las ~400 líneas, se parte.

## Reglas de trabajo

- **Buscá antes de crear.** `grep`/glob antes de escribir un helper que ya puede existir.
- **Cambio quirúrgico.** No refactorices, reformatees ni renombres de paso. Lo que está roto fuera de alcance se reporta, no se arregla.
- **No instales dependencias sin preguntar.** Si se instala una, la tabla de Stack y `docs/ARQUITECTURA.md` se actualizan en el mismo commit.
- **No inventes APIs.** Verificá en `node_modules/next/dist/docs/` y en los `.d.ts` instalados antes de escribir.
- **No borres ni muevas archivos que no pediste tocar.**
- **Si el código contradice un doc, se arreglan los dos en el mismo cambio.** Si el doc está bien y el código mal, gana el doc.
- **Regla de tres.** Sin abstracciones para un solo uso; código plano antes que configuración.
- **Si falta una decisión de producto, preguntá** en vez de asumir.

## Capa de datos

- **Solo `lib/content/*` y `db/seed.ts` importan `db`.** Los componentes llaman funciones, nunca arman queries.
- Toda lectura pública vive en `lib/content/queries.ts` y lleva `'use cache'`.
- Toda escritura vive en `lib/content/mutations.ts` y es una Server Action.
- Cada Server Action valida su input con Zod antes de tocar la DB. `FormData` no es confiable.
- Migraciones con `drizzle-kit generate`, y el SQL se commitea. **Nunca edites una migración ya aplicada** y nunca corras `db:push` contra Turso.
- IDs `text` con `crypto.randomUUID()`. Slugs en kebab-case, sin acentos, único por padre (`unit_id + slug`, `subject_id + slug`).
- Columnas JSON con `{ mode: 'json' }` y tipo inferido desde Zod.
- Fechas en UTC, `integer({ mode: 'timestamp_ms' })`.

## Pipeline de contenido — la regla más importante

El contenido se guarda como **JSON de Tiptap**, nunca como HTML. El editor y el render público comparten la misma lista de extensiones:

```ts
// lib/tiptap/extensions.ts
export const lessonExtensions = [ /* única fuente de verdad */ ]
```

1. `components/admin/Editor` la usa para editar.
2. `lib/tiptap/render.tsx` la usa para renderizar en el server con `renderJSONContentToReactElement` de `@tiptap/static-renderer/json/react`.
3. `tests/tiptap.test.ts` la usa para verificar round-trip.

**Si agregás o cambiás un nodo, actualizá los tres lados en el mismo commit.** Un nodo que existe solo en el editor produce contenido que no se ve en público.

**Checklist para un bloque nuevo** (ejemplo: `mermaid`):

1. Extensión (o nodo custom) en `lib/tiptap/extensions.ts`.
2. Entrada en el mapa de nodos de `lib/tiptap/render.tsx`.
3. Componente en `components/lesson/blocks/`.
4. Estilos con tokens del design system.
5. Caso en el test de round-trip y una clase de ejemplo en el seed.

Reglas adicionales:

- **Prohibido** habilitar nodos de HTML crudo o de script. El JSON es la frontera de seguridad.
- Los bloques que necesitan estado o ejecución en el browser (`quiz`, `mermaid`) son islas `"use client"` cargadas con `next/dynamic`. Deben renderizar un placeholder del mismo alto para no mover el layout.
- Código y matemática se renderizan **en el server** (Shiki y KaTeX) para que la página de lectura no hidrate nada.
- Un bloque nunca hardcodea colores: usa variables CSS de su área.

## Caching y publicación

| Caso | API |
|---|---|
| Lectura pública | `'use cache'` + `cacheLife('max')` + `cacheTag('contenido')` |
| Publicar / editar / borrar desde el admin | `updateTag('contenido')` dentro de la Server Action |
| Publicación programada (cron) | `revalidateTag('contenido', 'max')` en el route handler |
| Datos de sesión | nunca `use cache`; como máximo `'use cache: private'` |

- **Ninguna acción de contenido puede olvidarse de invalidar.** Por eso `createLesson`, `updateLesson`, `publishLesson`, `unpublishLesson` y `deleteLesson` son las únicas puertas de entrada y todas llaman a un helper común `invalidateContent()`.
- `updateTag` es inmediato y solo existe en Server Actions: es lo que hace que al publicar veas el cambio al instante. `revalidateTag` es stale-while-revalidate y se usa en el cron.
- No cachees resultados de `searchParams` con `use cache` salvo que el query sea argumento explícito de la función.

## Auth y seguridad

- Better Auth con email + contraseña y **un único usuario** creado por `scripts/create-admin.ts` desde variables de entorno. No hay registro público; la ruta de sign-up se deshabilita.
- El guard vive en `app/(admin)/layout.tsx` y redirige a `/ingresar` si no hay sesión o si `user.role !== 'admin'`.
- **El layout no protege las Server Actions.** Cada action empieza con `await requireAdmin()`. Sin excepciones.
- `proxy.ts` puede hacer un chequeo optimista de cookie para evitar renderizar el admin, pero la autorización real es `requireAdmin()`.
- Secretos solo en `.env.local` (`TURSO_*`, `BETTER_AUTH_SECRET`, `R2_*`, `CRON_SECRET`). Nunca en el cliente, nunca en el repo.
- Los uploads validan tipo MIME y tamaño máximo en el server antes de presignar.
- Rate limit activo en el login (el que trae Better Auth).

## Diseño

`DESIGN.md` define un canvas casi negro (`#0e100f`), texto crema (`#fffce1`), tipografía enorme, pills fantasma y **color como taxonomía**. Reglas operativas:

- **Cero hex en componentes.** Todo sale de tokens definidos en `app/globals.css` con `@theme`. Si falta un token, se agrega ahí y se documenta.
- **Cero `box-shadow`.** La profundidad se comunica con gradientes y cambios de superficie.
- **Cero botones rellenos.** Todo control es pill fantasma de 100px con borde hairline. La única excepción es el CTA con borde degradado verde.
- **La escala tipográfica es cerrada.** No inventes tamaños: usá `text-caption`, `text-body`, `text-body-lg`, `text-subheading`, `text-heading-*`, `text-display`. Nada entre 23px y 34px.
- **El display es fluido en mobile.** El `224px` del reference se implementa como `clamp(72px, 16vw, 224px)` y `letter-spacing` proporcional. Es la única desviación documentada del `DESIGN.md`.
- **Cada sección arranca con un eyebrow entre llaves**: `{ Plan de estudios }`. Es la firma del sistema.
- **Los colores de área son fijos** y no se reutilizan para otra cosa:

| Área | Token | Color |
|---|---|---|
| Matemática / Teoría | `--color-area-teoria` | lila `#9d95ff` |
| Programación / Software | `--color-area-software` | verde `#0ae448` |
| Sistemas / Redes | `--color-area-sistemas` | azul `#00bae2` |
| Datos / IA | `--color-area-datos` | rosa `#fec5fb` |
| Electivas | `--color-area-electivas` | naranja `#ff8709` |

- Tipografía: **Inter Tight** (UI y display) + **JetBrains Mono** (código), ambas por `next/font/google`.
- Solo dark. No hay toggle de tema ni `prefers-color-scheme`.
- Hover nunca rellena: cambia opacidad del borde o color del texto. Transiciones de 120–180ms.
- Respetar `prefers-reduced-motion`: sin animaciones de entrada en contenido de lectura.

## Accesibilidad y performance

- Un solo `<h1>` por página; jerarquía de headings sin saltos.
- Skip link al contenido, foco visible con anillo crema sobre cualquier fondo.
- Todo control operable por teclado. El editor de Tiptap no es la excepción.
- `lang="es"` en `<html>`.
- Presupuesto: la página de clase no debe hidratar JS salvo por TOC, quiz, mermaid y el marcador de vistas. Si una clase no tiene esos bloques, cero JS de cliente.
- Imágenes siempre con `next/image`, `alt` obligatorio y dimensiones.
- Mermaid se carga solo si la clase lo contiene (`next/dynamic`, `ssr: false`).

## Tests y definición de terminado

Una tarea está terminada cuando:

1. `pnpm format:check`, `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan.
2. Si tocaste el schema, hay migración generada y el seed sigue funcionando.
3. Si tocaste el pipeline de contenido, el test de round-trip pasa.
4. Si agregaste una ruta, aparece en `sitemap.ts` y tiene `metadata`.
5. La probaste en `next dev` en 375px y en 1440px.
6. Si cambiaste una decisión de arquitectura, `docs/ARQUITECTURA.md` está actualizado.

Tipos de test:

- **Vitest** — utilidades puras: slugs, tiempo de lectura, validación Zod, render de nodos, round-trip de Tiptap.
- **Playwright** — humo: home carga, plan lista materias, una clase renderiza código y callout, `/admin` redirige a `/ingresar` sin sesión.

## Contenido y copy

- Español rioplatense con voseo ("tenés", "podés"). Tono directo, sin marketing.
- Términos técnicos que se usan en inglés en la industria se dejan en inglés (`commit`, `deploy`, `pull request`), en itálica la primera vez.
- Títulos de clase en *sentence case*: "Complejidad temporal", no "Complejidad Temporal".
- Slugs en español, sin acentos ni mayúsculas: `complejidad-temporal`.
- El código de los ejemplos va en inglés, con comentarios en español solo cuando aclaran algo del curso.

## Qué NO hacer

- No convertir esto en un LMS: sin alumnos, sin entregas, sin notas, sin foro.
- No mover el contenido a MDX ni a un CMS externo. La DB es la fuente de verdad.
- No agregar `box-shadow`, gradientes de fondo en secciones, ni un sexto color de área.
- No silenciar tipos: ni `any`, ni `as`, ni `!`, ni `@ts-ignore`. El detalle está en **TypeScript**.
- No crear un segundo módulo de extensiones de Tiptap "solo para el editor".
- No leer la DB desde componentes cliente.
- No cachear sesiones con `use cache`.
- No instalar una librería de UI completa (shadcn con su tema, MUI, Chakra). Radix primitives sueltas están permitidas para diálogos y menús.
- No agregar i18n: el sitio es monolingüe en español.
- No comentar el código obvio. Los comentarios explican *por qué*, no *qué*.

## Estado actual

- `DESIGN.md` completo y **volcado a `app/globals.css`** con `@theme`. Los componentes usan tokens.
- Sitio público completo: home, plan, materias, clase, recursos, sobre, contacto, 404, `robots.ts` y `sitemap.ts`. El build prerenderiza 49 páginas.
- Plan de estudios **provisorio** cargado en `db/seed-data.ts` (25 materias, 49 unidades, 6 clases); migración `0000` generada y seed funcionando. Falta el plan real, que es el insumo bloqueante del contenido definitivo.
- Tiptap con `StarterKit` y renderer estático (`@tiptap/static-renderer`); los tests cubren render, slugs y tiempo de lectura. Falta el round-trip contra el editor.
- Falta: admin y auth (Better Auth), `lib/content/mutations.ts`, uploads a R2, búsqueda FTS, los bloques `callout`/`image`/`mathematics`/`mermaid`/`quiz` y las islas cliente (TOC, `ViewTracker`).
