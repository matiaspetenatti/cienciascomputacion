# Arquitectura

Documento de referencia del sitio. Si algo acá no coincide con el código, hay un bug en uno de los dos: arreglalo y actualizá este archivo en el mismo commit.

---

## 1. Objetivo

Publicar una carrera de grado en Ciencias de la Computación como curso abierto: un plan de estudios navegable, materias con unidades, y clases de lectura larga con código, matemática, diagramas y ejercicios de autoevaluación.

**Quién escribe:** una sola persona, autenticada, desde `/admin`.
**Quién lee:** cualquiera, sin cuenta, sin registro, sin tracking.
**Qué no es:** un LMS. No hay alumnos, entregas, notas, foros ni cohortes.

Ese recorte es la decisión de arquitectura más importante. Todo lo que sigue se deriva de él.

---

## 2. Principios

1. **El contenido es dato, no código.** Las clases viven en la DB para poder escribirlas desde el navegador. El esquema del plan (materias, unidades) también, para poder reordenarlo sin un deploy.
2. **Lectura estática, escritura dinámica.** El sitio público se sirve como HTML prerenderizado; el admin es la única parte dinámica.
3. **Una sola puerta de escritura.** Toda mutación pasa por `lib/content/mutations.ts` y revalida.
4. **Cero JS innecesario en lectura.** Código y matemática se renderizan en el server; solo los bloques interactivos hidratan.
5. **El diseño es parte del contrato.** Los tokens del `DESIGN.md` son la API visual; los componentes no inventan colores ni tamaños.

---

## 3. Vista general

```
                    ┌──────────────────────────────────────┐
   lector anónimo → │  Vercel Edge / CDN                   │
                    │  HTML prerenderizado + RSC payload   │
                    └───────────────┬──────────────────────┘
                                    │ cache miss / ISR
                    ┌───────────────▼──────────────────────┐
                    │  Next.js 16 (App Router, RSC)        │
                    │  'use cache' + cacheTag('contenido') │
                    └───────┬───────────────────┬──────────┘
                            │                   │
                    ┌───────▼───────┐   ┌───────▼─────────┐
                    │ Turso (libSQL)│   │ Cloudflare R2   │
                    │ schema + FTS5 │   │ imágenes        │
                    └───────▲───────┘   └───────▲─────────┘
                            │                   │
                    ┌───────┴───────────────────┴──────────┐
   admin (vos)   →  │  /admin — Better Auth + Server Actions│
                    │  editor Tiptap → JSON → DB            │
                    └───────────────────────────────────────┘
```

Dos caminos que casi no se tocan: el público solo lee, el admin solo escribe. El único punto de contacto es la invalidación de cache.

---

## 4. Modelo de datos

SQLite (libSQL). IDs `text` (UUID v4 generados en la app), fechas en `integer` (epoch ms), JSON como `text` validado por Zod.

### Tablas de contenido

```
subjects
  id            text pk
  slug          text not null            -- único global
  name          text not null
  area          text not null            -- teoria | software | sistemas | datos | electivas
  year          integer not null         -- 1..6
  description   text not null default ''
  credits       integer
  position      integer not null default 0
  created_at    integer not null
  updated_at    integer not null

units
  id            text pk
  subject_id    text not null → subjects.id on delete cascade
  slug          text not null
  title         text not null
  description   text
  position      integer not null default 0
  unique (subject_id, slug)

lessons
  id              text pk
  unit_id         text not null → units.id on delete cascade
  slug            text not null
  title           text not null
  excerpt         text not null default ''
  content         text not null          -- JSON de Tiptap
  plain_text      text not null default '' -- derivado, para FTS
  status          text not null default 'draft'
                    -- draft | published | scheduled | archived
  published_at    integer
  reading_minutes integer not null default 0
  position        integer not null default 0
  created_at      integer not null
  updated_at      integer not null
  unique (unit_id, slug)

lesson_revisions
  id          text pk
  lesson_id   text not null → lessons.id on delete cascade
  title       text not null
  content     text not null
  created_at  integer not null
  created_by  text not null → user.id

media
  id          text pk
  key         text not null unique       -- ruta en R2
  url         text not null
  alt         text not null default ''
  caption     text
  width       integer
  height      integer
  bytes       integer
  mime        text not null
  created_at  integer not null
```

### Auth

Better Auth genera y administra `user`, `session`, `account` y `verification`. La única modificación propia es `user.role` (`'admin'`), y el registro público queda deshabilitado.

### Búsqueda

```
lessons_fts  (FTS5 virtual, contentless)
  title, excerpt, plain_text
  tokenize = 'unicode61 remove_diacritics 2'
```

`plain_text` se recalcula en cada guardado extrayendo el texto de los nodos de Tiptap. El índice se sincroniza dentro de la misma transacción que publica/edita: si falla la escritura al índice, falla la publicación. Nunca queda contenido publicado sin indexar.

### Decisiones del modelo

- **El año es atributo de la materia, no un nivel.** La jerarquía elegida es `materia → unidad → clase`; agregar `año` como tabla obligaría a mover materias entre años rompiendo URLs. La página del plan agrupa por `year`.
- **`position` separado de `created_at`.** El orden pedagógico no es cronológico: podés insertar una unidad en el medio.
- **Slugs únicos por padre, no globales.** Dos materias pueden tener una unidad "introduccion".
- **`status` en lugar de `is_published`.** Necesitamos `scheduled` y `archived`; un booleano no alcanza.
- **`lesson_revisions` guarda copia completa, no diffs.** El contenido rara vez supera 100 KB y la simplicidad vale más que el ahorro.

---

## 5. Rutas

| Ruta | Rendering | Notas |
|---|---|---|
| `/` | estática + cached | hero, materias destacadas, últimas clases |
| `/plan` | estática + cached | todas las materias agrupadas por año |
| `/materias` | estática + cached | índice alfabético y por área |
| `/materias/[materia]` | SSG | programa, unidades, clases |
| `/materias/[materia]/[unidad]/[clase]` | SSG | la clase |
| `/recursos` | estática | bibliografía y links |
| `/sobre` | estática | qué es la carrera |
| `/contacto` | estática | mail y redes |
| `/buscar` | shell + Suspense | `searchParams.q`, resultados streamados |
| `/ingresar` | dinámica | formulario de login |
| `/admin` | dinámica + guard | dashboard |
| `/admin/clases`, `/admin/clases/[id]` | dinámica + guard | listado y editor |
| `/admin/materias`, `/admin/unidades` | dinámica + guard | estructura del plan |
| `/admin/media` | dinámica + guard | biblioteca de imágenes |
| `/api/auth/[...all]` | route handler | Better Auth |
| `/api/upload` | route handler | presigna subida a R2 |
| `/api/cron/publicar` | route handler | publica lo programado |

`/materias/[materia]/[unidad]/[clase]` usa `generateStaticParams` con todas las combinaciones publicadas. Con Cache Components, un slug nuevo que todavía no está en el build se sirve como *App Shell* y se genera en background en la primera visita (ISR), así que publicar no requiere redeploy.

**Tipado de params:**

```tsx
export default async function Page(props: PageProps<'/materias/[materia]/[unidad]/[clase]'>) {
  const { materia, unidad, clase } = await props.params
  ...
}
```

Los helpers `PageProps` / `LayoutProps` son generados por Next; no se escriben a mano.

---

## 6. Pipeline de contenido

```
Tiptap (cliente)
   │  JSON del documento
   ▼
Server Action  ── Zod ──▶  validateLessonContent()
   │
   ├─▶ extractPlainText()  → lessons.plain_text
   ├─▶ estimateReadingMinutes()
   ├─▶ db transaction: lessons + lessons_fts + lesson_revisions
   └─▶ updateTag('contenido')
          │
          ▼
   próxima lectura: 'use cache' recalculado
          │
          ▼
   generateHTML / static renderer (server)
          │
          ▼
   componentes de bloque (RSC)
```

### La regla del módulo único

`lib/tiptap/extensions.ts` exporta `lessonExtensions`. Lo importan exactamente tres consumidores: el editor, el renderer del server y el test de round-trip. Si un nodo existe en el editor y no en el renderer, se guarda contenido invisible. Por eso el test de round-trip es obligatorio: serializa un documento con todos los bloques, lo guarda, lo re-renderiza y compara la estructura.

### Bloques soportados

| Bloque | Nodo de Tiptap | Render | Hidrata |
|---|---|---|---|
| Párrafo, headings, listas, cita, hr | StarterKit | RSC | no |
| Código | `codeBlock` + Shiki | RSC | solo el botón "copiar" |
| Callout (nota / tip / advertencia) | nodo custom `callout` | RSC | no |
| Imagen | `image` | RSC + `next/image` | no |
| Fórmula | `mathematics` / `inlineMath` + KaTeX | RSC | no |
| Diagrama | nodo custom `mermaid` | isla `"use client"` | sí |
| Quiz | nodo custom `quiz` | isla `"use client"` | sí |

Los nodos de HTML crudo están **deshabilitados**. El JSON es la frontera: no hay forma de inyectar `<script>` desde el editor.

### Render

Se usa `renderJSONContentToReactElement` de `@tiptap/static-renderer/json/react` mapeando cada tipo de nodo a un componente React. La factory se llama una vez con `{ nodeMapping, markMapping }` y devuelve una función que recibe `{ content }`; no se le pasa el documento en la primera llamada. Esto es preferible a `dangerouslySetInnerHTML` con `generateHTML` porque:

- permite que `CodeBlock` sea un componente server que llama a Shiki con el tema del design;
- evita inyectar HTML en el DOM;
- hace que cada bloque tenga tipos propios, no un string.

El mapa vive en `lib/tiptap/render.tsx`. Un nodo o marca que exista en `lib/tiptap/extensions.ts` y no tenga entrada en el mapa rompe el render a propósito: es la señal de que falta el lado público del bloque.

---

## 7. Caching y revalidación

Next 16 con `cacheComponents: true` y `partialPrefetching: true`. El modelo es: **todo se prerenderiza salvo lo que explícitamente pida request-time data**.

### Lecturas públicas

```ts
// lib/content/queries.ts
export async function getLesson(materia: string, unidad: string, clase: string) {
  'use cache'
  cacheLife('max')
  cacheTag('contenido')
  return db.query.lessons.findFirst({ /* ... */ })
}
```

- `cacheLife('max')` = stale 5 min, revalidate 30 días, expire 1 año. El contenido no cambia por tiempo, cambia cuando publicás.
- `cacheTag('contenido')` es el único tag. Un solo tag alcanza porque el sitio es chico y la invalidación es barata; tags por materia serían optimización prematura.

### Mutaciones

| Acción | Revalidación | Por qué |
|---|---|---|
| Guardar borrador | ninguna | el borrador no se ve |
| Publicar / despublicar | `updateTag('contenido')` | lectura inmediata de tu propia escritura |
| Editar publicada | `updateTag('contenido')` | idem |
| Borrar (papelera) | `updateTag('contenido')` | idem |
| Cron de programadas | `revalidateTag('contenido', 'max')` | no hay usuario esperando |

`updateTag` solo funciona dentro de Server Actions y expira el cache al instante. `revalidateTag` es stale-while-revalidate y sirve para el cron, que corre en un route handler.

Todas las acciones de contenido llaman a `invalidateContent()` en `lib/content/mutations.ts`. **Ninguna acción debe importar `updateTag` directamente.**

### Por qué no `revalidatePath`

Porque el contenido aparece en varias rutas (`/`, `/plan`, `/materias/[materia]`, la clase, `/buscar`) y la lista cambia cuando agregás una clase. Un tag cubre todas; `revalidatePath` obligaría a enumerarlas y olvidarse una.

### Publicación programada

`vercel.json` define un cron cada 10 minutos contra `/api/cron/publicar`. El handler:

1. verifica `Authorization: Bearer ${CRON_SECRET}`;
2. `await connection()` para forzar request-time (con Cache Components, un GET se prerenderiza si no lo hacés);
3. publica las clases con `status = 'scheduled'` y `published_at <= now`;
4. `revalidateTag('contenido', 'max')`.

En el plan Hobby de Vercel el cron corre una vez por día. Si hace falta granularidad, se documenta como limitación conocida.

---

## 8. Autenticación y autorización

### Login

- Better Auth con `emailAndPassword`, registro público deshabilitado.
- `app/api/auth/[...all]/route.ts` exporta `toNextJsHandler(auth)`.
- `/ingresar` es un formulario cliente que llama `authClient.signIn.email` y navega a `/admin`.
- El usuario admin se crea con `scripts/create-admin.ts` usando `ADMIN_EMAIL` y `ADMIN_PASSWORD`; la contraseña se hashea, nunca se guarda en claro.

### Tres capas de protección

1. **`proxy.ts`** — chequeo optimista: si la request va a `/admin/*` y no hay cookie de sesión, redirige a `/ingresar`. Barato, evita renderizar. No es autorización.
2. **Cada página de admin** — `await requireAdmin()` al principio. Redirige si no hay sesión válida o el rol no es `admin`.
3. **Cada Server Action** — `await requireAdmin()` como primera línea.

La capa 3 es la que importa. Layouts y páginas no protegen mutaciones: una Server Action es un endpoint HTTP público que puede invocarse sin navegar. Un action sin guard es una vulnerabilidad, no un descuido de estilo.

### Detalle con Cache Components

Un layout que `await headers()` bloquea el prerender. Por eso:

- `app/(admin)/layout.tsx` renderiza el chrome (sidebar, header) sin leer sesión.
- `{children}` va dentro de `<Suspense fallback={<AdminSkeleton />}>`.
- El nombre del usuario en el header es un componente aparte que lee la sesión dentro de su propio Suspense.

Así el shell del admin es estático y solo el dato de sesión streamea.

---

## 9. Imágenes

Flujo de subida, sin que el archivo pase por la función de Vercel:

```
cliente                    /api/upload              R2
  │  POST {mime, bytes} ──▶ valida sesión,
  │                         valida mime y tamaño,
  │                         genera key
  │  ◀── {uploadUrl, key} ──
  │  PUT archivo ─────────────────────────────────▶
  │  Server Action: registra media {key, alt, ...}
```

- Tamaño máximo: 5 MB. MIME permitidos: `image/png`, `image/jpeg`, `image/webp`, `image/svg+xml` (el SVG se sanitiza o se rechaza; recomendación: rechazarlo en v1).
- `key` = `clases/{lessonId}/{uuid}.{ext}`; nunca se usa el nombre original.
- El bucket tiene dominio público; `next.config.ts` declara `images.remotePatterns` con ese host.
- `alt` es obligatorio en el editor: el botón de insertar está deshabilitado sin texto alternativo.
- Al borrar una clase no se borran sus imágenes (podrían estar en una revisión). La limpieza es un script manual.

---

## 10. Búsqueda

FTS5 nativo de libSQL, sin servicio externo.

```ts
// lib/content/queries.ts
export async function searchLessons(q: string) {
  'use cache'
  cacheTag('contenido')
  cacheLife('max')
  return db.all(sql`
    SELECT l.slug, l.title, s.slug AS materia, u.slug AS unidad,
           snippet(lessons_fts, 2, '<mark>', '</mark>', '…', 20) AS fragmento
    FROM lessons_fts
    JOIN lessons l ON l.id = lessons_fts.lesson_id
    JOIN units u   ON u.id = l.unit_id
    JOIN subjects s ON s.id = u.subject_id
    WHERE lessons_fts MATCH ${toFtsQuery(q)} AND l.status = 'published'
    ORDER BY rank
    LIMIT 20
  `)
}
```

- `toFtsQuery` escapa comillas, quita operadores y agrega `*` al último término.
- La página `/buscar` lee `searchParams` y pasa `q` como argumento de la función cacheada; el componente de resultados va en `<Suspense>`. Es el patrón que la doc de Next 16 documenta para búsqueda.
- Índice `lessons_fts` con `remove_diacritics 2`: "programacion" encuentra "programación".
- Si FTS5 diera problemas en Turso, el fallback es `LIKE '%q%'` sobre `plain_text` — más lento, suficiente para cientos de clases.

---

## 11. Progreso del lector

Sin cuentas, así que sin servidor:

```ts
localStorage['cc.vistos.v1']  // string[] de lesson.id
localStorage['cc.ultima.v1']  // { materia, unidad, clase, at }
```

- `ViewTracker` (isla cliente) marca la clase como vista a los 15 segundos o al 75 % de scroll, lo que ocurra primero.
- La página de materia recibe la lista de IDs del server y pinta el progreso en cliente.
- El home muestra "continuar donde dejaste" solo si hay `cc.ultima.v1`.
- Es cosmético: si el usuario borra el storage, no pierde nada. No se envía a ningún lado.

---

## 12. SEO

- `generateMetadata` por ruta: título `{Clase} · {Materia} · Ciencias de la Computación`, descripción desde `excerpt`, canonical.
- OG image generada con `next/og` (título + área + color).
- `app/sitemap.ts` recorre materias y clases publicadas.
- `app/robots.ts` bloquea `/admin`, `/ingresar` y `/api`.
- JSON-LD `Course` en `/plan` y `LearningResource` en cada clase.
- `<html lang="es">`.
- URLs estables: cambiar un slug rompe links externos. El editor avisa y ofrece crear un redirect 301 en `proxy.ts` (mapa estático en `lib/redirects.ts`).

---

## 13. Implementación del design system

Los tokens del `DESIGN.md` se vuelcan a `app/globals.css` con `@theme`. Nombres semánticos además de los crudos, para que los componentes no digan `bg-just-black` sino `bg-canvas`.

```css
@import "tailwindcss";

@theme {
  /* Superficies y texto */
  --color-canvas: #0e100f;
  --color-panel: #191919;
  --color-cream: #fffce1;
  --color-muted: #7c7c6f;
  --color-hairline: #42433d;

  /* Marca */
  --color-brand: #0ae448;
  --color-brand-soft: #abff84;

  /* Áreas — taxonomía fija, no decorativa */
  --color-area-teoria: #9d95ff;
  --color-area-software: #0ae448;
  --color-area-sistemas: #00bae2;
  --color-area-datos: #fec5fb;
  --color-area-electivas: #ff8709;

  /* Tipografía */
  --font-sans: var(--font-inter-tight), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, monospace;

  --text-caption: 14px;   --leading-caption: 1.4;    --tracking-caption: -0.14px;
  --text-body-sm: 16px;   --leading-body-sm: 1.15;   --tracking-body-sm: 0px;
  --text-body: 19px;      --leading-body: 1.15;      --tracking-body: 0px;
  --text-body-lg: 23px;   --leading-body-lg: 1.38;   --tracking-body-lg: -0.23px;
  --text-subheading: 34px;--leading-subheading: 1.2; --tracking-subheading: -0.34px;
  --text-heading-sm: 44px;--leading-heading-sm: 1.2; --tracking-heading-sm: -0.44px;
  --text-heading: 66px;   --leading-heading: 1.2;    --tracking-heading: -0.66px;
  --text-heading-lg: 101px;--leading-heading-lg: 1;  --tracking-heading-lg: -1.11px;
  --text-display: clamp(72px, 16vw, 224px);
  --leading-display: 0.9;
  --tracking-display: -0.02em;

  /* Layout y formas */
  --spacing-section: 80px;
  --container-page: 1280px;
  --radius-card: 8px;
  --radius-pill: 100px;
}
```

Reglas de uso:

- `--text-display` es la única desviación del reference: `clamp()` para que no desborde en 375px. El tracking va en `em` para escalar con el tamaño.
- Un componente que necesita el color de un área recibe `data-area` y lee la variable; nunca hardcodea el hex ni elige el color con un `switch` de clases.
- No hay `box-shadow` en el sistema. Si un elemento necesita separarse, se usa `border` hairline o cambio de superficie.

---

## 14. Entornos

| Variable | Dónde | Para qué |
|---|---|---|
| `TURSO_DATABASE_URL` | dev / prod | `file:./.data/local.db` en dev, `libsql://…` en prod |
| `TURSO_AUTH_TOKEN` | prod | token de escritura en prod, solo lectura en build |
| `BETTER_AUTH_SECRET` | ambos | firma de sesiones |
| `BETTER_AUTH_URL` | ambos | `http://localhost:3000` / dominio |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | script | creación del admin |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | ambos | presignado |
| `R2_BUCKET`, `R2_PUBLIC_URL` | ambos | bucket y dominio público |
| `CRON_SECRET` | prod | autoriza `/api/cron/publicar` |

`.env.local` está en `.gitignore`. `.env.example` documenta todas sin valores.

**Dev:** `pnpm db:migrate && pnpm db:seed && pnpm dev`. La DB local vive en `.data/` (ignorado por git).

**Build:** necesita acceso de lectura a Turso para `generateStaticParams`. Si la DB no responde, el build **falla a propósito**: un deploy con el sitio vacío es peor que un deploy que no salió. El único escape es `ALLOW_EMPTY_BUILD=1`, para emergencias, y deja un warning en el log.

---

## 15. Despliegue

```
push a main ──▶ Vercel build ──▶ static shell + ISR
                    │
                    ├─ migraciones: paso manual antes del deploy
                    └─ cron cada 10 min → /api/cron/publicar
```

- **Las migraciones no corren solas en el build.** Se ejecutan a mano (`pnpm db:migrate`) contra Turso antes de mergear el código que las necesita. Un build que corre migraciones puede aplicarlas dos veces por builds concurrentes.
- Rollback: Vercel conserva el deployment anterior; la DB no se revierte. Por eso las migraciones son aditivas (agregar columna nullable, nunca renombrar en el mismo paso).
- `next build` corre en CI con un token de solo lectura.

---

## 16. Modos de falla

| Falla | Síntoma | Mitigación |
|---|---|---|
| Turso caído en build | deploy rojo | intencional; reintentar |
| Turso caído en runtime | 500 en rutas no cacheadas | las páginas cacheadas siguen sirviendo |
| Olvido de `updateTag` | publicás y no se ve | helper único + test e2e que publica y verifica |
| Extensión sin renderer | bloque invisible en público | test de round-trip + checklist en AGENTS.md |
| Mermaid en una clase | 500 KB de JS | `next/dynamic` solo si el nodo existe |
| Slug duplicado | constraint error críptico | validación Zod + mensaje en el editor |
| Cron no corre (Hobby) | programadas no salen | documentado; publicar a mano |

---

## 17. Alternativas descartadas

| Alternativa | Por qué no |
|---|---|
| MDX en el repo | no se puede escribir desde el navegador, que es el requisito central |
| CMS headless (Sanity, Contentful) | un servicio más, un editor más, y el plan de estudios necesita jerarquía propia |
| Postgres/Neon | SQLite + libSQL alcanza para cientos de clases y simplifica el modelo mental |
| `better-sqlite3` | no funciona en serverless; libSQL sí |
| Supabase | auth + DB + storage atados a un proveedor para un sitio de un solo autor |
| `revalidatePath` | frágil con muchas rutas que muestran el mismo contenido |
| Client-side rendering del contenido | peor SEO y peor primera lectura, que es todo lo que hace el sitio |
| i18n | el sitio es monolingüe por decisión de producto |

---

## 18. Abierto

- **Plan de estudios real.** Bloquea el seed, las páginas de materia y el contenido de muestra.
- **Nombre del sitio.** Afecta metadata, OG, footer y el wordmark.
- **Entrypoint del renderer de Tiptap** según la versión instalada.
- **Dominio y hosting del bucket R2** (subdominio propio vs `r2.dev`).
