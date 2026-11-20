# Decisiones técnicas

Registro de decisiones nuevas o que cambian algo del PRD. Formato: fecha · decisión · por qué.

| Fecha | # | Decisión | Por qué |
| --- | --- | --- | --- |
| 20 nov 2026 | D1 | **Fuentes self-hosted** (woff2 con subset latino en `design-system/fonts/`, servidas desde `public/fonts/`). Reemplaza "Google Fonts" del PRD §11 | Mismas fuentes, sin request a terceros, mejor LCP y privacidad. **Pendiente: actualizar PRD §11** |
| 20 nov 2026 | D2 | Documentos movidos a `docs/` con nombres limpios; CV a `public/cv/franco-colucci-cv-es.pdf` | Coincidir con la estructura de `CLAUDE.md` |
| 20 nov 2026 | D3 | Tokens nuevos `--ratio-a4: 1 / 1.414` y `--ratio-landing: 6 / 7` en `tokens.css` | Piezas reales de MoonDesk (A4) y Carpa (1374×1600) que no entran en los ratios v1.2. El banner 835×451 y el board de Condimento van en el marco más cercano con la pieza contenida sobre `--color-stage` |
| 20 nov 2026 | D4 | Solo los carruseles se agrupan como una pieza. Sets de ads y series de posteos quedan como piezas sueltas | Decisión abierta del PRD §13; más simple y fiel a cómo se publicaron |
| 20 nov 2026 | T1 | Astro **7.4** (última estable), Node 24 | `CLAUDE.md` pide la última estable |
| 20 nov 2026 | T2 | Adapter condicional: `@astrojs/vercel` si existe `VERCEL`, `@astrojs/node` en local | El adapter de Vercel no soporta `astro preview`, y las reglas piden medir sobre `build` + `preview` |
| 20 nov 2026 | T3 | `--font-sans` y `--font-mono` suman `"Instrument Sans Fallback"` / `"Geist Mono Fallback"` (Arial / Courier New con `size-adjust` y overrides calculados por `scripts/build-fonts.py`) | Evitar CLS al cargar las fuentes (regla de front end) |
| 20 nov 2026 | T4 | `/` es la única página server además de `/api/contacto`: redirige con 302 según la cookie `lang` (la escribe el selector de idioma) y, si no hay, `Accept-Language`; fallback ES. `Vary: Accept-Language, Cookie`, sin caché | "Cambiar idioma… la preferencia se guarda" + redirección por `Accept-Language` |
| 20 nov 2026 | T5 | `/dev/tokens` (y después `/dev/componentes`) con textos en español fijos, `noindex`, fuera del sitemap y con `Disallow` en `robots.txt` | Son herramientas internas, no páginas del sitio |
| 20 nov 2026 | T6 | `src/styles/tokens.css` queda fuera de Prettier | Tiene que ser copia exacta de `design-system/tokens.css` |
| 20 nov 2026 | T7 | `npm audit` marca 3 vulnerabilidades altas en `path-to-regexp` dentro de `@astrojs/vercel` (utilidades de rutas en build). No se fuerza el downgrade a v8, que rompe con Astro 7 | Se usa en build, no en el runtime del sitio. Revisar al actualizar el adapter |
| 20 nov 2026 | D5 | Inventario confirmado con las respuestas por defecto (P1–P8 de `docs/inventario.md`): 52 archivos → 23 piezas. Carpa 01–05 y 07–10 son 2 piezas "set de portadas" (`formato: portadas`), **excepción a D4** | Son 9 portadas casi iguales del mismo curso; sueltas, el caso se ve disperso (PRD §5) |
| 20 nov 2026 | T8 | Las piezas se copian en JPG byte a byte a `src/assets/trabajos/`; `astro:assets` genera WebP/AVIF. No se renombran a `.webp` (PRD §7) | Evitar una segunda compresión con pérdida |
| 20 nov 2026 | T9 | El `src` de cada slide es solo el nombre del archivo (modelo del PRD §7); `src/lib/piece-images.ts` lo resuelve con `import.meta.glob` y el build falla si falta | Mantener el JSON igual al modelo del PRD |
| 20 nov 2026 | T10 | `sharp` como dependencia de desarrollo para `scripts/inventario.mjs` (hojas de contacto) | Ya venía con Astro; se declara explícita |
