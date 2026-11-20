# Portfolio Franco Colucci — CLAUDE.md

Portfolio personal de Franco Colucci, diseñador gráfico y digital (Mendoza, Argentina). Objetivo: conseguir entrevistas en empresas (remoto o local). El trabajo es el protagonista; la interfaz acompaña.

## Fuentes de verdad (leer antes de tocar código)

Si algo de este archivo choca con estos documentos, mandan los documentos. Si un pedido mío choca con ellos, avisame **antes** de hacerlo.

| Qué | Dónde (rutas ordenadas en Fase 1, 20 nov 2026) |
| --- | --- |
| PRD v2.1 | `docs/PRD-Portfolio-Franco-Colucci.md` |
| Tokens v1.2 (+ D3) | `design-system/tokens.css` (copia exacta en `src/styles/tokens.css`) |
| Fuentes | `design-system/fonts/` (woff2 con subset latino) · TTF de origen en `design-system/Geist_Mono,Instrument_Sans.zip` |
| Motion v1.1 (IDs M01–M39) | `docs/motion.md` |
| Wireframes v3 (opción A) | No está en el repo |
| CV | `public/cv/franco-colucci-cv-es.pdf` (falta la versión EN) |
| Decisiones técnicas | `docs/decisiones.md` |
| Piezas originales | `C:\Users\FRANCO\Portfolio\dist\proyectos` (solo lectura; es copia idéntica de `public\proyectos` del sitio actual) |
| Foto y logos del sitio actual | `C:\Users\FRANCO\Portfolio\public\franco-photo.png` y `public\logos\*.jpg` (solo lectura) |

## Reglas por área

@.claude/rules/ux-ui.md
@.claude/rules/motion.md
@.claude/rules/frontend.md
@.claude/rules/backend.md

## Stack

- **Astro** (última estable) + TypeScript estricto. CSS nativo con los tokens; sin Tailwind, sin librerías de UI, sin librería de animación en el MVP.
- **Content Collections** con esquema Zod: un archivo por caso en `src/content/casos/<slug>.json`, piezas con el modelo de `slides` del PRD §7.
- **i18n** nativo de Astro: rutas `/es/` y `/en/`, `/` redirige según `Accept-Language` (fallback ES). Textos de interfaz en `src/i18n/es.json` y `en.json`; ningún string visible hardcodeado en componentes.
- **Imágenes**: `astro:assets` (`<Image>` / `<Picture>`), AVIF + WebP con `srcset`.
- **Deploy**: Vercel (`@astrojs/vercel`). Páginas estáticas; solo `/api/contacto` es server.
- **Gestor de paquetes**: npm. Node LTS.

## Estructura

```
src/
  assets/trabajos/<slug>/      piezas copiadas y renombradas (nunca mover los originales)
  components/                  un componente por archivo, con sus estilos dentro
  content/casos/<slug>.json    contenido ES/EN de cada caso
  i18n/                        es.json · en.json · utils.ts
  layouts/                     Base.astro (tema sin parpadeo, ClientRouter, SEO)
  pages/[lang]/                index.astro · trabajos/[slug].astro · 404
  pages/api/contacto.ts        único endpoint server
  scripts/                     visor, filtros (FLIP), reveal, toggles
  styles/                      tokens.css (copia de design-system) · base.css · utilities.css
public/cv/                     franco-colucci-cv-es.pdf · franco-colucci-cv-en.pdf
docs/                          PRD, motion, inventario de piezas, decisiones
```

## Comandos

- `npm run dev` → servidor local (http://localhost:4321)
- `npm run build` && `npm run preview` → probar el build real antes de decir "listo"
- `npm run check` → `astro check` (tipos y contenido)
- `npm run lint` → ESLint + Prettier

## Contenido: reglas duras

- **Un carrusel = una pieza.** Cuenta 1 en todo (mosaico, filtros, contador del visor). En grilla solo se muestra la portada.
- **Nunca inventar** métricas, clientes, fechas ni resultados. Si falta un dato: placeholder visible `TODO(contenido): …` y lo anotás en `docs/pendientes-contenido.md`.
- Los textos borrador salen del PRD y los wireframes. Voz: concreta, profesional, cercana. Prohibido: "apasionado por el diseño", "transformo ideas en experiencias", "Hi, I'm Franco 👋", emojis decorativos.
- Nombres de archivo: `<cliente>-<formato>-<tema>.webp`; slides: `<cliente>-carrusel-<tema>-01.webp`, `-02`…
- Alt text propio por pieza y por slide, en ES y EN. Nunca "imagen de…" ni el nombre del archivo.

## Skills

Al empezar cada fase, revisá qué skills tengo instaladas (`/skills`, `.claude/skills/`, `~/.claude/skills/`) y usá las que apliquen. Uso esperado (adaptá a lo que encuentres):

| Momento | Skill |
| --- | --- |
| Construir o rediseñar UI | `frontend-design`, `ui-ux-pro-max` |
| Textos de interfaz, errores, estados vacíos | `ux-copy` |
| Cerrar cada página | `design-critique` + `accessibility-review` |
| Antes de cada commit grande | `code-review` |
| Cargar piezas nuevas | `/cargar-trabajos` (del kit inicial, si existe) |

**Las skills asesoran, el design system decide.** Si una skill sugiere otra paleta, otra fuente, glassmorphism, bento grid, degradados o cualquier cosa fuera de los tokens y del motion aprobado, se descarta y se sigue con lo aprobado. Si la sugerencia es buena de verdad, me la proponés como cambio, no la aplicás.

## Forma de trabajar

- Respondé en español. Trabajá por fases (ver `docs/plan.md` cuando exista) y **frená al final de cada fase** con: qué hiciste, cómo verlo (URL local exacta), qué falta y qué decisión necesitás de mí.
- Antes de un cambio grande, plan corto primero. Cambios chicos: hacelos.
- Git: commits chicos y descriptivos en español (`feat(visor): navegación por slides con teclado`). **No hagas push ni conectes Vercel hasta que te lo pida.**
- Nunca borres ni modifiques archivos fuera del repo. La carpeta de piezas originales es solo lectura.
- Si algo del PRD no se puede implementar como está escrito, explicá por qué y proponé la alternativa más cercana.
- Registrá decisiones técnicas nuevas en `docs/decisiones.md` (fecha, decisión, por qué). Si cambia algo del PRD, avisame para actualizarlo.
