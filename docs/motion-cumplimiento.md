# Cumplimiento de motion — M01–M39

21 nov 2026 · Fase 7 · contra `docs/motion.md` v1.1.

**Cómo se verificó:** revisión del código contra la especificación, una por una, más `npm run audit:motion` (`scripts/motion-audit.mjs`). La auditoría corre en Chrome sobre el build real (`npm run build` + `astro preview`) con y sin `prefers-reduced-motion`, y deja el detalle en `docs/motion-audit.json`. Última corrida: **38/38 OK**.

Leyenda: ✅ cumple · 🔁 cumple con una diferencia anotada · ➖ no aplica todavía · 🧪 verificado por la auditoría automática.

## Piezas y grilla

| ID | Interacción | Normal | Reducido | Verif. | Dónde / notas |
| --- | --- | --- | --- | --- | --- |
| M01 | Marcas de corte en hover/foco | ✅ 6 px → 0, 200 ms, register | ✅ sin desplazamiento, instantáneas | 🧪 | `base.css` (`.crop-marks`). Visibles con teclado en tiles, portada del caso y visor |
| M01b | Marcas al salir | ✅ opacidad 100 ms, in | ✅ igual | | `base.css` |
| M02 | Acción "Ver pieza ↗" | ✅ sube 4 px, 200 ms, out, delay 40 | ✅ fundido 120 ms | | `PieceTile.astro`. Solo con puntero fino; en táctil no se muestra |
| M03 | Tile de carrusel estático | ✅ | ✅ | | Igual que M01 + M02; "Ver N slides ↗". No carga slides extra |
| M04 | Press en una pieza | ✅ marcas 2 px más cerca, 100 ms | ✅ sin desplazamiento | | `base.css` (`--crop-travel / -3`) |
| M05 | Indicador del filtro activo | ✅ traslada y escala, 300 ms, spring | ✅ instantáneo | 🧪 | `FilterChips.astro` + `filters.ts` |
| M06 | Filtro: FLIP | ✅ sale 200 · viaja 300 · entra stagger 40 | ✅ fundido de la grilla 120 ms | 🧪 | `works.ts`. Interrumpible. `aria-live` "Mostrando N piezas" |

## Navegación entre páginas y visor

| ID | Interacción | Normal | Reducido | Verif. | Dónde / notas |
| --- | --- | --- | --- | --- | --- |
| M10 | Tarjeta → caso | ✅ morph de portada y nombre 700 ms, register; página anterior 200 ms; textos entran 8 px tras 200 ms | 🔁 cambio instantáneo | | `view-transition-class: case-morph` en `base.css`. **Diferencia:** en reducido Astro anula todas las View Transitions con `!important` (sin fundido de 120 ms). Cumple el principio 6 ("fundido corto o cambio instantáneo") |
| M11 | Caso → Trabajos | ✅ misma transición, 500 ms; el router restaura el scroll | 🔁 instantáneo | | Ídem M10 |
| M12 | Siguiente caso | ✅ el nombre se convierte en el H1, 700 ms | 🔁 instantáneo | | Ídem M10 |
| M13 | Abrir visor | ✅ FLIP 500 ms register, velo 300 ms, controles tras 200 ms | ✅ fundido 120 ms sin viaje | 🧪 | `viewer.ts`. Marcas de corte enmarcan la pieza abierta |
| M14 | Cerrar visor | ✅ vuelve al tile 300 ms (o fundido si no está a la vista) | ✅ fundido 120 ms | 🧪 | Foco vuelve al tile; URL limpia. ESC + reabrir enseguida: estado consistente |
| M15 | Slide siguiente | 🔁 scroll-snap nativo; teclado y flechas con `scrollTo({ behavior: 'smooth' })` | ✅ sin desplazamiento | 🧪 | **Diferencia:** la duración del scroll suave la define el navegador (~300–400 ms), como prevé `motion.md` §7 |
| M16 | Pieza siguiente (vertical) | ✅ sale 8 px arriba 200 ms in, entra 8 px desde abajo 300 ms register; el número rueda | ✅ fundido 120 ms | 🧪 | `viewer.ts` |
| M17 | Panel "Siguiente pieza →" | ✅ al soltar ahí pasa de pieza | ✅ igual | | Solo carruseles con pieza siguiente |
| M18 | Indicador segmentado | ✅ `scaleX` 300 ms, out | ✅ instantáneo | 🧪 | `Viewer.astro` |
| M19 | Reel play/pausa | ➖ | ➖ | | **No implementado:** no hay videos en el inventario (T29). Se hace cuando lleguen los MP4 |

## Navegación, toggles y entradas

| ID | Interacción | Normal | Reducido | Verif. | Dónde / notas |
| --- | --- | --- | --- | --- | --- |
| M20 | Sección activa en la nav | ✅ filete 2 px, 300 ms, in-out | ✅ instantáneo | | `SiteHeader.astro` + `nav.ts`. Se re-mide al cambiar de ancho |
| M21 | Nav al scrollear | ✅ borde y sombra por opacidad, 200 ms | 🔁 instantáneo | | La spec dice "igual"; `--duration-fast` vale 0 en reducido |
| M22 | Menú mobile | ✅ hoja 300 ms register, links con stagger 40, ☰ → × | ✅ fundido 120 ms | | Se cierra con ESC, clic afuera o al salir el foco |
| M23 | Cambio de modo | ✅ View Transition 300 ms in-out; ícono gira 180° | ✅ instantáneo | 🧪 | CLS = 0. Con CPU ×4 hay un cuadro largo (~160 ms) en la captura inicial de la transición, antes del fundido |
| M24 | Cambio de idioma | ✅ subrayado viaja 300 ms; página 200 ms con la nav quieta | 🔁 instantáneo | 🧪 | La nav usa `transition:name` + `animate none` en vez de `persist` (T11). CLS inesperado = 0 |
| M25 | Entrada de sección | ✅ filete 500 ms register; número y título suben 8 px, stagger 60 | ✅ sin entrada, todo visible | 🧪 | `reveal.ts`: un solo IntersectionObserver, una vez. Sin JS, todo visible |
| M26 | Hero | ✅ sin animación de entrada | ✅ igual | 🧪 | Hero sin mosaico ni imagen desde D9 |
| M27 | Métricas del caso | ✅ filetes con stagger 60; números sin contar | ✅ sin entrada | | Implementado; **no se ve todavía** porque ningún caso tiene métricas cargadas |
| M28 | Acordeón "Qué hago" | ✅ `grid-template-rows` 300 ms; + gira a × | ✅ apertura instantánea | | Única animación de layout. Solo mobile |
| M29 | Tira de contactos | ✅ scroll nativo con snap, bordes con máscara, flechas en hover | ✅ igual | | `ContactStrip.astro` |

## Microinteracciones de acción

| ID | Interacción | Normal | Reducido | Verif. | Dónde / notas |
| --- | --- | --- | --- | --- | --- |
| M30 | Botón hover | ✅ fondo un tono distinto, flecha 4 px, 200 ms | ✅ sin desplazamiento de flecha | | El fondo pasa a `--color-text-secondary` (T13; propuesta de token pendiente) |
| M31 | Botón press | ✅ `scale(0.98)`, 100 ms | ✅ sin escala | | |
| M32 | Link de texto hover | ✅ subrayado 1 → 2 px (`scaleY`) y acento, 100 ms | ✅ igual | | `TextLink.astro` |
| M33 | Descargar CV | ✅ flecha baja 6 px y cae en el filete; "Descargando" → "CV ✓" 1,8 s | ✅ solo cambio de texto | | Los estados alternativos quedan fuera del nombre accesible (corregido en esta fase) |
| M34 | Copiar mail | ✅ texto sale arriba, "Copiado ✓" entra en verde, 200 ms; vuelve a 1,8 s | ✅ cambio de texto sin desplazamiento | | `aria-live` lo anuncia |
| M35 | Campo: foco | ✅ filete en acento `scaleX`, 200 ms | ✅ aparece sin dibujarse | | |
| M36 | Campo: error | ✅ baja 4 px y aparece, 200 ms; sin sacudida | ✅ fundido 120 ms | | Corregido en esta fase (antes era instantáneo) |
| M37 | Enviando | ✅ el botón mantiene el ancho; filete indeterminado, loop 1200 ms | ✅ texto sin filete | | |
| M38 | Envío exitoso | ✅ el formulario se desvanece; confirmación con marcas de corte en registro, 500 ms | ✅ fundido 120 ms | | Probado en navegador (Fase 6) |
| M39 | Error de envío | ✅ mensaje inline con "Reintentar" y mail, 200 ms; no se pierde lo escrito | ✅ fundido 120 ms | | Corregido en esta fase (antes era instantáneo) |

## Criterios de aceptación (`motion.md` §8)

| Criterio | Estado |
| --- | --- |
| Cada ID tiene versión reducida y se probó con la preferencia activa | ✅ en Chrome con `prefers-reduced-motion` emulado. **Falta** probarlo en macOS, iOS y Android reales (Fase 8 / QA de lanzamiento). M19 ➖ |
| 60 fps con CPU ×4 en M06, M13, M15 y M23 | ✅ como máximo 2 cuadros de más de 25 ms por interacción (Chrome de escritorio; falta un Android de gama media real) |
| Hero y mosaico completos en el primer frame | ✅ sin animaciones al cargar; nada invisible en el primer viewport |
| LCP igual con y sin animaciones | ✅ el H1 es el LCP y no se anima (ver `motion-audit.json`) |
| CLS = 0 al cambiar modo, idioma o filtro | ✅ CLS inesperado 0 en los tres. Al filtrar la grilla se reacomoda, pero es un cambio pedido por el usuario y no cuenta para CLS |
| ESC, segundo clic o swipe interrumpen el visor sin estados rotos | ✅ ESC + reabrir de inmediato: consistente. El swipe se apoya en el scroll nativo (no probado en táctil real) |
| Marcas de corte visibles con teclado en piezas, tarjetas y visor | ✅ |
| Ninguna animación demora la navegación ni el acceso al contenido | ✅ |

## Correcciones hechas en esta fase

- **M10/M24:** el fundido de página del ClientRouter pasa de 180 ms (preset de Astro) a `--duration-fast` (200 ms).
- **M20 reducido:** el filete de la nav pasa a instantáneo.
- **M02, M36 y M39 reducidos:** fundido de 120 ms, como pide la spec. Antes eran instantáneos porque `--duration-fast` vale 0 en reducido.
- **M33:** "Descargando" y "CV ✓" quedan con `aria-hidden`. El lector de pantalla leía los tres textos del botón; ahora el estado se anuncia por `aria-live`.

## Desvíos que quedan (para decidir)

1. **Transiciones de color.** Hover de botones (M30), links (M32) y el color del texto de los chips (M05) usan `transition` de color de 100–300 ms. La regla dice "animar solo `transform` y `opacity`", pero la propia spec de M30 y M32 describe esos cambios de color. Son baratos (solo repintado). Si preferís la regla estricta, pasan a ser instantáneos.
2. **M10–M12 y M24 en reducido** son instantáneos (Astro), no un fundido de 120 ms. Forzar el fundido exigiría `!important`, que está prohibido.
