# Sistema de motion — Portfolio Franco Colucci

20 nov 2026 · Etapa 6 · **v1.1, aprobada** (opciones seguras) · Concepto rector: **Ficha de producción**

Este documento es la especificación de motion para pasar a código. Los tokens viven en `design-system/tokens.css` (v1.2). Cada interacción tiene un ID (`M01`…) para referenciarla en el handoff y en los criterios de aceptación.

## 1. Idea: registro

En imprenta, *registro* es el momento en que las tintas de cada pasada caen exactas una sobre otra. El motion del sitio se arma sobre ese gesto: **lo que importa llega apenas fuera de lugar y se asienta exacto**, con la curva `ease-register` (arranca rápido y se asienta largo). Las marcas de corte, que ya son la firma visual del sitio, son también la firma del movimiento.

## 2. Principios

| # | Principio | Qué significa en la práctica |
| --- | --- | --- |
| 1 | **La pieza no se toca** | Las piezas nunca se escalan, giran, desenfocan ni inclinan en hover. Lo que se mueve es la ficha alrededor: marcas de corte, metadatos, contador. La pieza solo se desplaza para cambiar de lugar (grilla → visor, tarjeta → caso) y siempre sin deformarse |
| 2 | **Cada eje significa algo** | Horizontal = recorrer *dentro* de algo (slides, filtros, idioma). Vertical = pasar a *otra* cosa (pieza siguiente, entradas de sección). Profundidad (elemento compartido) = abrir y cerrar. El usuario aprende el sistema sin darse cuenta |
| 3 | **Feedback en el lugar** | La confirmación aparece en el mismo control que se tocó (copiar mail, CV, enviar). Nada de toasts lejanos para acciones locales |
| 4 | **Un protagonista por momento** | Si se abre el visor, el resto se queda quieto. Las entradas por scroll no coinciden con una transición de página |
| 5 | **Nunca hacer esperar** | Nada del primer viewport arranca invisible. Toda animación se puede interrumpir: un segundo clic, ESC o un swipe cortan la anterior y arrancan desde el estado actual |
| 6 | **Reducido no es roto** | Con `prefers-reduced-motion`, todo desplazamiento pasa a fundido corto (120 ms) o a cambio instantáneo. La información y el feedback se mantienen iguales |

## 3. Tokens (v1.2)

Se mantienen los de la v1.1 y se suman seis. Valores reducidos entre paréntesis.

| Token | Valor | Uso |
| --- | --- | --- |
| `--duration-instant` | 100 ms (100) | Press, cambio de color de links, focus |
| `--duration-fast` | 200 ms (0) | Hover, marcas de corte, metadatos, salidas |
| `--duration-base` | 300 ms (120) | Indicadores que viajan, slides, filtros |
| `--duration-slow` | 500 ms (120) | Abrir visor, entradas por scroll |
| `--duration-page` | 700 ms (120) | Tarjeta → caso |
| `--ease-out` | cubic-bezier(0.16, 1, 0.3, 1) | Entradas |
| `--ease-in` | cubic-bezier(0.7, 0, 0.84, 0) | Salidas |
| `--ease-in-out` | cubic-bezier(0.65, 0, 0.35, 1) | De un punto a otro (indicadores, FLIP) |
| `--ease-register` | cubic-bezier(0.2, 0.9, 0.1, 1) | Momentos clave: marcas de corte, visor, tarjeta → caso |
| **`--ease-spring`** *(nuevo)* | `linear()` con un rebote de ~4 % | Solo el pulgar de los toggles y el indicador del filtro activo |
| `--stagger` | 60 ms (0) | Entradas de grupos (máx. 6 elementos) |
| **`--stagger-fast`** *(nuevo)* | 40 ms (0) | Menú mobile, chips, letras del contador |
| **`--crop-travel`** *(nuevo)* | 6 px (0) | Distancia que recorren las marcas de corte hasta su lugar |
| **`--delay-chrome`** *(nuevo)* | 200 ms (0) | Controles del visor y textos del caso esperan a que termine el elemento compartido |
| **`--hold-feedback`** *(nuevo)* | 1800 ms (1800) | Tiempo que se ve "Copiado ✓" o "Descargando" antes de volver |
| **`--reveal-threshold`** *(nuevo, JS)* | 0.15 | Porcentaje visible para disparar una entrada por scroll |

Constantes de gesto (JS, no CSS): swipe confirma con más de 20 % del ancho o con velocidad > 0,35 px/ms; el visor se cierra con un arrastre vertical de más de 120 px en táctil.

## 4. Especificación por interacción

Formato: disparador · propiedades · duración · easing · delay · versión reducida. Solo se animan `transform` y `opacity`, salvo la excepción marcada con ⚠.

### Piezas y grilla

| ID | Interacción | Disparador | Qué pasa | Dur. | Easing | Delay | Reducido |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M01 | **Marcas de corte** (gesto propio) | Hover (puntero fino) o focus de teclado en una pieza | Las 4 esquinas aparecen desplazadas 6 px hacia afuera (`--crop-travel`) y entran en registro. Opacidad 0 → 1. La pieza no se mueve | 200 | register | 0 | Aparecen sin desplazarse, instantáneas |
| M01b | Marcas de corte al salir | Mouse sale / blur | Opacidad 1 → 0, sin desplazamiento (salir no necesita gesto) | 100 | in | 0 | Igual |
| M02 | Línea de metadatos | Junto con M01 | La etiqueta `cliente · formato` está siempre visible. En hover se suma la acción ("Ver pieza ↗" / "Ver 7 slides ↗"), que sube 4 px y aparece. En táctil la acción no se muestra: todo el tile es tocable | 200 | out | 40 | Fundido |
| M03 | Tile de carrusel (estático) | Hover o focus en un tile ⧉ | Igual que cualquier pieza (M01 + M02): la portada no cambia y la acción dice "Ver 7 slides ↗". No se cargan slides extra | — | — | — | Igual |
| M04 | Press en una pieza | pointerdown | Sin escala (principio 1). Las marcas de corte se acercan 2 px más: se "ajusta" | 100 | out | 0 | Igual sin desplazamiento |
| M05 | Filtro: indicador activo | Clic en un chip | El fondo de tinta viaja del chip anterior al nuevo (un solo elemento que se traslada y se escala en X) | 300 | spring | 0 | Cambio instantáneo |
| M06 | Filtro: reordenamiento (FLIP) | Cambio de filtro | Las piezas que salen se desvanecen (200 ms, in). Las que quedan viajan a su nueva posición (300 ms, in-out). Las que entran aparecen con stagger de 40 ms. El conteo del chip se actualiza. `aria-live`: "Mostrando 4 piezas" | 200 + 300 | in / in-out | stagger 40 | Fundido cruzado de la grilla, 120 ms |

### Navegación entre páginas y visor

| ID | Interacción | Disparador | Qué pasa | Dur. | Easing | Delay | Reducido |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M10 | **Tarjeta → caso** | Clic en una tarjeta de Trabajos o en el mosaico | View Transition: el mockup de la tarjeta se convierte en el hero del caso y el nombre del cliente pasa a ser el H1 (`transition:name`). La página anterior se desvanece en 200 ms. Los textos del caso entran 8 px desde abajo, después del delay | 700 | register | chrome 200 | Fundido cruzado 120 ms |
| M11 | Caso → Trabajos | "← Todos los trabajos" o atrás del navegador | La misma transición al revés; el scroll vuelve a la tarjeta de origen | 500 | register | 0 | Fundido 120 ms |
| M12 | Siguiente caso | Link al pie del caso | El bloque "Siguiente: ISCAMEN" se convierte en el H1 del caso siguiente; la página sube | 700 | register | 0 | Fundido 120 ms |
| M13 | **Abrir visor** | Clic o Enter en una pieza | FLIP: la pieza viaja desde el tile hasta su lugar en el visor, sin deformarse. El velo aparece en 300 ms. Las marcas de corte quedan enmarcando la pieza abierta. Contador, metadatos y controles aparecen después | 500 | register | chrome 200 | Fundido 120 ms, sin viaje |
| M14 | Cerrar visor | ESC, ×, clic en el velo o arrastre vertical en táctil | La pieza vuelve a su tile (si está visible; si no, se desvanece). El foco vuelve al tile | 300 | in-out | 0 | Fundido 120 ms |
| M15 | **Slide siguiente** (eje horizontal) | → / swipe / botón › | Pista con `scroll-snap`: el slide se desplaza el 100 % del ancho. En táctil sigue al dedo 1:1 y suelta con la inercia nativa | 300 | out (nativo en swipe) | 0 | Cambio sin desplazamiento, fundido 120 ms |
| M16 | **Pieza siguiente** (eje vertical) | → después del último slide, Av Pág, botón "Pieza siguiente" | La pieza actual sale 8 px hacia arriba y se desvanece (200 ms, in); la nueva entra 8 px desde abajo (300 ms, register). El número de pieza del contador rueda en vertical | 200 + 300 | in / register | 0 | Fundido 120 ms |
| M17 | Fin del carrusel en táctil | Swipe más allá del último slide | Aparece un último panel "Siguiente pieza →"; al soltar ahí se dispara M16. Así el gesto nunca se traba | — | — | — | Igual |
| M18 | Indicador segmentado | Cambio de slide | El segmento activo se llena de izquierda a derecha (`scaleX`) | 300 | out | 0 | Cambio instantáneo |
| M19 | Reel: play/pausa | Clic en el reel | El ícono ▶ se convierte en ‖ (fundido cruzado + 90°). Los reels arrancan en pausa, mudos | 200 | out | 0 | Sin giro |

### Navegación, toggles y entradas

| ID | Interacción | Disparador | Qué pasa | Dur. | Easing | Delay | Reducido |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M20 | Indicador de sección activa | Scroll (IntersectionObserver) | Un filete naranja de 2 px viaja bajo el número de la sección activa (01–05) | 300 | in-out | 0 | Instantáneo |
| M21 | Nav al scrollear | Scroll > 8 px | Aparece el borde hairline y la sombra flotante | 200 | out | 0 | Igual |
| M22 | Menú mobile | Botón ☰ | La hoja baja desde arriba (translateY -100 % → 0); los 5 links entran con stagger de 40 ms. ☰ pasa a × | 300 | register | stagger 40 | Fundido 120 ms |
| M23 | **Cambio de modo** | Toggle ◐ | View Transition con fundido cruzado de toda la página (los colores pasan de un modo al otro sin salto de layout). El ícono gira 180° | 300 | in-out | 0 | Cambio instantáneo |
| M24 | Cambio de idioma | Toggle ES / EN | El subrayado viaja de ES a EN (300 ms, in-out). La página nueva hace un fundido de textos de 200 ms con la nav fija (`transition:persist`) y conserva el scroll en la misma sección | 200 / 300 | out / in-out | 0 | Fundido 120 ms |
| M25 | **Entrada de sección** | La sección entra 15 % en pantalla, una sola vez | El filete de 3 px se dibuja de izquierda a derecha (`scaleX` 0 → 1, 500 ms, register). El número y el título suben 8 px y aparecen (stagger 60 ms) | 500 | register / out | 0 / 60 | Sin entrada: todo visible |
| M26 | Hero y mosaico | Carga de la home | **Sin animación de entrada.** El hero y las 6 piezas aparecen pintados desde el primer frame: el trabajo se ve en 0 s y el LCP no depende del motion. El motion del hero empieza con la interacción (M01) | — | — | — | Igual |
| M27 | Métricas del caso | Entran en pantalla | Los filetes sobre cada métrica se dibujan con stagger de 60 ms. Los números **no** cuentan hacia arriba | 500 | register | 60 c/u | Sin entrada |
| M28 | Acordeón "Qué hago" (mobile) | Toque en un ítem | `+` gira 45° y pasa a ×. El contenido se abre con `grid-template-rows` 0fr → 1fr ⚠ (es la única animación de layout permitida) | 300 | in-out | 0 | Apertura instantánea |
| M29 | Tira de contactos | Scroll horizontal en el caso | Scroll nativo con `scroll-snap`; los bordes se desvanecen con una máscara. En desktop aparecen flechas al hacer hover | — | — | — | Igual |

### Microinteracciones de acción

| ID | Interacción | Disparador | Qué pasa | Dur. | Easing | Delay | Reducido |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M30 | Botón: hover | Hover | Fondo tinta → tinta un tono más alto; la flecha → avanza 4 px | 200 | out | 0 | Sin desplazamiento de flecha |
| M31 | Botón: press | pointerdown | `scale(0.98)` | 100 | out | 0 | Sin escala |
| M32 | Link de texto: hover | Hover | El subrayado pasa de 1 px a 2 px y a color acento (se dibuja con un pseudo-elemento `scaleY`) | 100 | out | 0 | Igual |
| M33 | **Descargar CV** | Clic en "CV ↓" | La flecha baja 6 px y cae dentro de un filete (como algo que entra a la bandeja); el texto pasa a "Descargando" y después a "CV ✓" durante `--hold-feedback`, y vuelve | 300 | register | 0 | Solo cambio de texto |
| M34 | **Copiar mail** | Clic en el mail | El texto "Copiar mail" sale hacia arriba y entra "Copiado ✓" en verde, desde abajo. `aria-live` lo anuncia. Vuelve a los 1,8 s | 200 | out | 0 | Cambio de texto sin desplazamiento |
| M35 | Campo: focus | Focus en un input | El filete inferior se dibuja en acento de izquierda a derecha (`scaleX`) | 200 | out | 0 | Aparece sin dibujarse |
| M36 | Campo: error | Validación al salir del campo o al enviar | El mensaje baja 4 px y aparece debajo del campo. **Sin sacudida**: el error informa, no reta | 200 | out | 0 | Fundido |
| M37 | Enviando | Submit válido | El botón mantiene el ancho; el texto pasa a "Enviando" y un filete indeterminado recorre la base del botón | loop 1200 | in-out | 0 | Texto "Enviando…" sin filete |
| M38 | **Envío exitoso** | Respuesta OK | El formulario se desvanece y aparece la confirmación con las **marcas de corte entrando en registro** alrededor (el gesto propio cierra el flujo) | 500 | register | 0 | Fundido 120 ms |
| M39 | Error de envío | Respuesta con error | Mensaje inline arriba del botón con "Reintentar" y el mail como alternativa. Los datos cargados no se pierden | 200 | out | 0 | Fundido |

## 5. Lo que queda afuera

Cada cosa de esta lista se descarta porque compite con las piezas o porque es un cliché de portfolio:

- Zoom, tilt 3D o parallax sobre las piezas (rompe el principio 1)
- Cursor custom, partículas, blobs, texto que se escribe solo
- Contadores que suben ("+40 piezas" animado)
- Marquee infinito de logos de clientes: la franja "Trabajé con" queda estática
- Pantalla de carga o intro animada
- Scroll-jacking, scroll suave forzado, secciones "pinneadas"
- Sacudida del formulario en error
- Barra inferior mobile que se esconde al scrollear: queda siempre visible, porque Contacto y CV tienen que estar a un toque

## 6. Decisiones cerradas (20 nov)

Franco eligió las opciones seguras en los tres temas.

| Tema | Decisión | Descartado |
| --- | --- | --- |
| Vista previa de carruseles | **Tile estático** con portada, ⧉ y cantidad de slides (M03) | Asomo del slide 2 y "scrub" de hoja de contactos |
| Cambio de modo | **Fundido cruzado**, 300 ms (M23) | Pasada de rodillo |
| Entrada del hero | **Sin animación de entrada** (M26) | Mosaico con stagger y "pasada de registro" |

## 7. Implementación

| Pieza | Cómo |
| --- | --- |
| Microinteracciones (M01–M05, M30–M36) | CSS puro: `transition` con tokens. Hover solo dentro de `@media (hover: hover) and (pointer: fine)` |
| Tarjeta → caso, idioma, modo (M10–M12, M23, M24) | View Transitions. En Astro: `<ClientRouter />`, `transition:name` en mockup y título, `transition:persist` en la nav. Donde el navegador no las soporta, la navegación es normal (sin animación, sin error) |
| Filtros y visor (M06, M13, M14, M16) | FLIP con Web Animations API (`element.animate`), interrumpible con `animation.cancel()` |
| Slides (M15, M17) | Pista con `scroll-snap-type: x mandatory` + evento `scrollend`. Las flechas y el teclado usan `scrollTo({ behavior })` |
| Entradas por scroll (M25–M27) | Un solo IntersectionObserver; la clase `.is-in` se agrega una vez y se desconecta. Sin JS, todo se ve |
| Librerías | Ninguna en el MVP. Si el visor se complica, se evalúa Motion (motion.dev, módulo `animate`, ~3 kB) |

**Reglas de código**

- `will-change` solo durante la animación; se quita al terminar.
- Ninguna animación toca `width`, `height`, `top` ni `left` (única excepción: M28).
- El visor bloquea el scroll del body mientras está abierto y devuelve el foco al cerrar.
- Todo lo animado en JS lee las duraciones de los tokens con `getComputedStyle`, así el modo reducido funciona sin ramas especiales.

## 8. Criterios de aceptación

- [ ] Cada interacción (IDs M01–M39) tiene su versión reducida y se probó con la preferencia activa (macOS, iOS y Android)
- [ ] 60 fps en un Android de gama media (perfil de rendimiento de Chrome, 4× CPU throttling) en M06, M13, M15 y M23
- [ ] El hero y el mosaico se ven completos en el primer frame, sin entrada animada
- [ ] LCP sin cambios con y sin animaciones (el H1 y la primera pieza no se animan)
- [ ] CLS = 0 al cambiar de modo, de idioma o de filtro
- [ ] ESC, un segundo clic o un swipe interrumpen cualquier animación del visor sin estados rotos
- [ ] Las marcas de corte se ven al navegar con teclado en todas las piezas, tarjetas y en el visor
- [ ] Ninguna animación demora la navegación ni el acceso al contenido

## Prototipo

Prototipo navegable con las interacciones clave (M01–M06, M10–M18, M20, M21, M23, M24, M25, M27, M31, M33–M39) y un interruptor para ver la versión reducida: artifact "Motion — Portfolio Franco Colucci" (https://claude.ai/artifact/7FiEPDUMLfnNCLTxhGSYnE). Las piezas son placeholders.
