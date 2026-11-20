# Reglas de front end

## Código

- TypeScript estricto (`astro/tsconfigs/strict`). Sin `any`; si hace falta, comentá por qué.
- Componentes Astro chicos y de una sola responsabilidad. Props tipadas con `interface Props`.
- JS del cliente mínimo: solo donde hay interacción (visor, filtros, toggles, formulario, reveal). Nada de frameworks de UI (React, Vue…) salvo que lo apruebe.
- Scripts como módulos en `src/scripts/`, importados con `<script>` de Astro (se empaquetan y deduplican). Cada uno se reinicializa en `astro:page-load` por el ClientRouter, y limpia listeners en `astro:before-swap`.
- Progressive enhancement: sin JS, el sitio se lee entero, los links funcionan y las piezas se ven (el visor degrada a link a la imagen).
- CSS: estilos dentro de cada componente (scoped). Globales solo en `base.css` (reset, tipografía base, focus, utilidades `.visually-hidden`). Nesting nativo y propiedades lógicas (`margin-inline`, `padding-block`). Sin `!important`.
- Nombres en inglés en el código (`PieceTile`, `useViewer`); textos visibles siempre desde i18n.
- ESLint + Prettier configurados y sin errores antes de cada commit.

## Tema claro/oscuro

- `<html data-theme="light|dark">`; sin atributo sigue al sistema (ya resuelto en tokens.css).
- Script inline y bloqueante en el `<head>` que lee `localStorage` y pone el atributo **antes del primer paint** (sin parpadeo). Envolverlo en try/catch.
- `<meta name="color-scheme" content="light dark">` y `theme-color` por modo.

## Fuentes

- Self-hosted desde `design-system/fonts/` (woff2), con `@font-face`, `font-display: swap` y `preload` solo de Instrument Sans 400 y 600. Subset latino. Sin Google Fonts en runtime.
- Fallbacks con métricas ajustadas (`size-adjust`, `ascent-override`) para evitar CLS.

## Imágenes y video

- Siempre `astro:assets`: AVIF + WebP, `srcset` y `sizes` reales por layout, `width`/`height` para reservar espacio.
- Mosaico del hero y primera pieza visible: `loading="eager"` y `fetchpriority="high"`. Todo lo demás `lazy`.
- En grilla y mosaico se carga **solo la portada** de cada carrusel. El visor carga el slide actual y precarga el siguiente.
- Reels: MP4 H.264 cortos, mudos, `preload="none"`, `poster`, sin autoplay.
- Nunca subir los originales pesados a `public/`: van a `src/assets/` para que se optimicen.

## Performance (presupuesto)

- Lighthouse mobile ≥ 90 en las 4 categorías, en home y en un caso.
- LCP < 2,5 s, CLS < 0,05 (0 en cambios de modo/idioma/filtro), INP < 200 ms.
- JS total del cliente < 50 kB gzip en la home.
- Medir con `npm run build && npm run preview`, nunca sobre `dev`.

## SEO

- `title` y `description` por página y por idioma desde i18n/contenido.
- Open Graph y Twitter Card con imagen por caso (1200×630).
- `hreflang` ES/EN + `x-default`, canonical, `sitemap` (`@astrojs/sitemap`), `robots.txt`.
- Datos estructurados `Person` en la home y `CreativeWork` en cada caso.

## Calidad antes de cerrar una fase

1. `npm run check` y `npm run lint` sin errores.
2. `npm run build` sin warnings nuevos.
3. Revisión en 360, 768, 1280 y 1440 px, ES y EN, claro y oscuro, con y sin reduced motion.
4. Navegación completa solo con teclado.
5. Skills de revisión (`design-critique`, `accessibility-review`, `code-review`) y corrección de lo que encuentren.
