# Plan de construcción — Portfolio Franco Colucci

21 nov 2026 · Fases 0 a 4 cerradas (D1–D4 aprobadas, ver `docs/decisiones.md`). Este archivo se actualiza al cerrar cada fase.

| Fase | Estado |
| --- | --- |
| 0 · Reconocimiento | Cerrada |
| 1 · Base | Cerrada: Astro 7.4, fuentes woff2, i18n, tema, SEO base, `/dev/tokens` |
| 2 · Inventario | Cerrada: 23 piezas copiadas, JSON por caso, alt ES/EN, `/dev/inventario` |
| 3 · Componentes | Cerrada: nav, toggles, botones, links, CV, copiar mail, tile, chips, barra inferior, footer, campos; `/dev/componentes` |
| 4 · Home | Cerrada: hero con datos y mosaico, Trabajé con, 01 Trabajos por empresa con filtros (FLIP), 02–05, caso base y 404 |
| 5 · Caso + visor | Próxima |

## 1. Lo que encontré (Fase 0)

### Documentos

| Qué | Ruta real | Nota |
| --- | --- | --- |
| PRD v2.1 | `PRD/PRD-Portfolio-Franco-Colucci (2).md` | — |
| Tokens v1.2 | `design-system/tokens (2).css` | Coincide con lo que dice el PRD |
| Motion v1.1 | `Motion/motion.md` | 37 interacciones (M01, M01b, M02–M06, M10–M29, M30–M39) |
| Fuentes | `design-system/Geist_Mono,Instrument_Sans.zip` | Solo TTF (estáticas + variables). No hay woff2 ni carpeta `fonts/`. `Instrument_Sans.zip` es un duplicado |
| Wireframes v3 | — | **No están en el repo** |
| CV | `cv-franco-colucci (1).pdf` | 2 páginas, `es-AR`, idéntico al del sitio actual. **No hay versión EN** |
| Skill `/cargar-trabajos` | — | No existe en ningún lado |

La tabla de `CLAUDE.md` ya está corregida con estas rutas.

### Piezas (`C:\Users\FRANCO\Portfolio\dist\proyectos`)

- **52 imágenes, 0 videos.** Todas JPG, nombres `01.jpg`…`NN.jpg`, sin orden por formato.
- **No son salida de un build:** `dist\proyectos` es copia byte a byte de `public\proyectos` del sitio actual (verificado por hash). Sin hashes en el nombre ni recompresión de Astro.
- **Pero tampoco son masters:** son exportaciones web (1080 px de ancho, 66–423 KB, JPG con pérdida). Sirven para el sitio; convertirlas a AVIF/WebP suma una segunda compresión leve. En el visor de desktop retina una pieza 4:5 a pantalla completa pide ~1440 px de ancho, así que a 1080 se ve un poco blanda.

| Caso | Archivos | Peso | Tamaños | Lectura preliminar (a confirmar en Fase 2) |
| --- | --- | --- | --- | --- |
| ISCAMEN | 19 | 5,7 MB | 1081×1351 y 1080×1350 (4:5) · 900×1600 (9:16) | 01–07 carrusel "Bioinsumos de exportación" (7) · 08–12 "Huerto urbano" (5: ¿carrusel o serie de posteos?) · 13 story Día del Trabajador · 14 story La mujer en la ciencia · 15–19 cítricos (5: ¿carrusel?) |
| MoonDesk | 18 | 1,9 MB | 1080×1350 (4:5) · 596×842 (A4) · 900×1600 (9:16) | 01–05 carrusel "Nacimos de un error" · 06 ¿suelto o parte del anterior? · 07–11 carrusel Día de la Tierra · 12–14 one-pager / flyer / portada de ebook (A4) · 15, 16, 18 posteos · 17 story testimonio |
| Carpa | 11 | 2,2 MB | 1374×1600 (≈ 6:7) · 835×451 (≈ 1,85:1) · 1337×1600 | 01–05 "Bonos" + 07–10 "Módulos" del Método Carpa (¿un carrusel, dos, o piezas de landing?) · 06 banner "Oferta de lanzamiento" · 11 mockup del producto |
| Condimento | 4 | 0,5 MB | 1081×1081 (1:1) · 1504×1545 | 01–03 set de ads "auditoría gratis" · 04 board de marca |

Hojas de contacto para revisar: las genero en `docs/inventario/` en la Fase 2 (hoy están en mi carpeta temporal).

**Hallazgos que chocan con el PRD o los tokens**

1. **Proporciones sin token.** Carpa (≈ 6:7 y ≈ 1,85:1), MoonDesk 12–14 (A4, 1:1,414) y Condimento 04 (≈ 1:1,03) no entran en ningún `--ratio-*`. Ver decisión D3.
2. **Faltan formatos que el PRD nombra:** no hay mails, webs, ebooks completos ni reels. Los filtros van a mostrar solo los formatos que existan (un chip "Mail" vacío sería peor que no tenerlo).
3. **No hay mockups** (escenario de portada por caso ni del mosaico). Plan B: marcos de dispositivo en CSS (teléfono para 4:5 y 9:16, navegador para web, "papel" sobre `--color-stage` para A4 y boards), con radios de los tokens.
4. **Fuentes:** el PRD §11 dice "Google Fonts"; `.claude/rules/frontend.md` dice self-hosted sin Google Fonts en runtime. Ver decisión D1.
5. **Logos de clientes:** existen en `public\logos\` del sitio actual pero en JPG; el PRD pide SVG monocromo.

## 2. Skills disponibles y cuándo las uso

Las skills asesoran; los tokens, el PRD y `motion.md` deciden.

| Skill | Fases | Para qué |
| --- | --- | --- |
| `anthropic-skills:ui-ux-pro-max` | 1, 3, 4, 5 | Consulta de patrones de Astro, accesibilidad y layout. Sus paletas y fuentes se ignoran |
| `design:design-system` | 1, 3 | Auditar que `/dev/tokens` y `/dev/componentes` cubran todos los tokens y estados |
| `design:ux-copy` | 2, 3, 4, 6 | Alt text por pieza/slide, labels, errores del formulario, estados vacíos, 404, microcopy del motion |
| `design:accessibility-review` | 3, 4, 5, 8 | Cierre de cada página: contraste, foco, teclado, ARIA del visor y del formulario |
| `design:design-critique` | 4, 5, 8 | Cierre de cada página contra el concepto "Ficha de producción" |
| `code-review` | 3, 5, 6, 8 | Antes de cada commit grande |
| `security-review` | 6, 8 | Endpoint `/api/contacto`, headers, CSP |
| `simplify` | 8 | Limpieza final de código |
| `run` + `anthropic-skills:built-in-browser` | 1–8 | Levantar `npm run dev` / `preview` y revisar en 360, 768, 1280 y 1440 |

**No aplican:** `motion-foundations` (es para React + `motion/react`; el stack aprobado es CSS + WAAPI sin librería) · Figma, Adobe y Canva (no hace falta y Figma no está autenticado) · `design:design-handoff` (el handoff ya está hecho).
**No instaladas acá:** `frontend-design` (existe solo en `C:\Users\FRANCO\Portfolio\.claude\skills\`) y `/cargar-trabajos` (no existe; la Fase 2 la hago con un script propio).

## 3. Fases

Cada fase termina con: qué hice, URL local exacta, pendientes (contenido incluido) y la decisión que necesito. No hay push ni Vercel hasta que lo pidas.

### Fase 1 · Base
- Astro (última estable) + TS estricto + ESLint/Prettier. `git init`, rama `main`, `.gitignore` con `.env`, `.env.example`.
- `tokens.css` → `src/styles/tokens.css` (sin cambios). `base.css` con reset, tipografía, focus y `.visually-hidden`.
- Fuentes: TTF del zip → woff2 con subset latino (fonttools/pyftsubset con Python 3.12, ya instalado). Solo Instrument Sans 400/600 y Geist Mono 400/500. Fallbacks con `size-adjust`. Preload de Instrument Sans 400 y 600.
- i18n `/es/` y `/en/`, `/` redirige por `Accept-Language`; `es.json`/`en.json` + script que compara claves.
- `Base.astro`: tema sin parpadeo, `<ClientRouter />`, SEO base (title, description, canonical, hreflang).
- `/dev/tokens`: colores, tipo, espaciado, ratios y motion en los dos modos (con demo de cada curva).
- Mover PRD y motion a `docs/` con nombre limpio (si lo aprobás, D2) y crear `docs/decisiones.md`.
- **Ver en:** `http://localhost:4321/es/` y `http://localhost:4321/dev/tokens`.

### Fase 2 · Inventario de piezas
- `docs/inventario.md` con hojas de contacto y **la agrupación propuesta**. Espero tu confirmación antes de copiar (hay al menos 4 grupos dudosos: ISCAMEN 08–12 y 15–19, MoonDesk 06, Carpa 01–10, Condimento 01–03).
- Copia a `src/assets/trabajos/<slug>/` con `<cliente>-<formato>-<tema>.jpg` y `-carrusel-<tema>-01…`. Los originales no se tocan. Formato del archivo: se mantiene JPG en `src/assets` y `astro:assets` genera AVIF/WebP (renombrar a `.webp` sería recomprimir dos veces).
- `src/content/casos/<slug>.json` + esquema Zod con el modelo de `slides` del PRD §7. Todo texto que no esté en el PRD → `TODO(contenido): …` y a `docs/pendientes-contenido.md`.
- Alt text borrador ES/EN por pieza y por slide (lo describo desde la imagen; lo revisás).

### Fase 3 · Componentes
Nav numerada 01–05 (M20, M21, M22), toggles idioma/modo (M23, M24), botones y links (M30–M33), tile de pieza con marcas de corte (M01–M04), chips de filtro (M05), barra inferior mobile, footer, campos (M35, M36), marcos de dispositivo. Todos los estados en `http://localhost:4321/dev/componentes`.

### Fase 4 · Home
Hero con mosaico (6 piezas, M26 sin entrada), Trabajé con (estática), 01 Trabajos con filtros (M05, M06 FLIP), 02 Qué hago (M28), 03 Proceso + IA, 04 Sobre mí, 05 Contacto (maqueta; el envío real va en la Fase 6). Entradas M25.

### Fase 5 · Caso + visor
Plantilla de caso (contexto, rol, métricas M27, piezas filtrables, entregables, resultado, siguiente caso M12), tira de contactos (M29), visor completo (M13–M19: teclado, swipe, carruseles, `?pieza=&slide=`, foco atrapado), tarjeta → caso (M10, M11). Reels: el visor los soporta aunque hoy no haya videos.

### Fase 6 · Contacto y CV
`/api/contacto` en modo local (sin `RESEND_API_KEY` loguea y responde 200), Zod, honeypot, tiempo mínimo firmado, rate limit, fallback sin JS → `/<lang>/gracias`. M37–M39. CV por idioma (M33), copiar mail (M34), LinkedIn, WhatsApp.

### Fase 7 · Pasada de motion
Tabla M01–M39 de cumplimiento (normal y reducido) en `docs/motion-cumplimiento.md`.

### Fase 8 · QA
Lighthouse mobile (home + un caso) sobre `npm run preview`, a11y, 360/768/1280/1440, ES/EN, claro/oscuro, teclado. Skills de revisión y correcciones.

## 4. Decisiones que necesito

| # | Decisión | Mi recomendación |
| --- | --- | --- |
| D1 | Fuentes: PRD dice Google Fonts, las reglas dicen self-hosted | **Self-hosted** (mismas fuentes, sin request a terceros, mejor LCP). Actualizar PRD §11 |
| D2 | ¿Muevo PRD y motion a `docs/` con nombres limpios (`docs/PRD-Portfolio-Franco-Colucci.md`, `docs/motion.md`) y las fuentes a `design-system/fonts/`? | Sí, en la Fase 1, con `git mv` para que quede el historial |
| D3 | Piezas con proporciones sin token (Carpa, A4 de MoonDesk, board de Condimento) | Sumar dos tokens: `--ratio-a4: 1 / 1.414` y `--ratio-landing: 6 / 7` (Carpa). El banner 835×451 y el board van en el marco más cercano con la pieza contenida sobre `--color-stage`. Lo anoto en `decisiones.md` |
| D4 | ¿Un set de ads (Condimento 01–03) o una serie de posteos cuenta como una pieza con variantes? (decisión abierta del PRD) | Para el MVP, **no**: solo los carruseles se agrupan; los sets se muestran como piezas sueltas con el mismo `tema`. Es más simple y fiel a cómo se publicaron |
| D5 | Copiar la skill `frontend-design` del repo viejo a este | Opcional; no es imprescindible |

## 5. Lo que me falta de vos

**Para la Fase 2 (bloquea la agrupación):**
- Confirmar los grupos dudosos (te los muestro con miniaturas en `docs/inventario.md`).
- Si tenés exportaciones a mayor resolución (≥ 1440 px de ancho, PNG o JPG calidad alta) de las piezas del mosaico, mejor que las de 1080.

**Para las Fases 4–5 (no bloquea; uso placeholders `TODO(contenido)`):**
- Las 6 piezas del mosaico del hero.
- Por caso: contexto, desafío, tu rol, entregables, resultado y 1–4 métricas reales.
- Experiencia con fechas (empresa, rol, período) — puedo sacarla del CV si me confirmás que está actualizado.
- Logos de clientes en SVG monocromo (tengo los JPG del sitio actual como respaldo).
- Foto: ¿uso `franco-photo.png` del sitio actual? Necesito un recorte 4:5.
- Wireframes v3 en PDF, si los tenés a mano.
- Reels/videos, si querés que haya alguno en el MVP.

**Para la Fase 6:**
- CV en inglés (PDF).
- URL de LinkedIn, número de WhatsApp y el mail público de contacto.
