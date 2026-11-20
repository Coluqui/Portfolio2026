# Reglas de motion

La especificación completa está en `docs/motion.md` (v1.1, aprobada): 37 interacciones con IDs M01–M39. **Implementá exactamente lo especificado**; si algo no se puede, avisá antes de improvisar. Citá el ID en el código (`/* M13 · abrir visor */`) y en los commits.

## Idea: registro

Lo importante llega apenas fuera de lugar y se asienta exacto, con `--ease-register`. Las marcas de corte son la firma visual y la del movimiento.

## Principios

1. **La pieza no se toca.** Nunca scale, rotate, blur ni tilt sobre una pieza en hover. Se mueve la ficha alrededor (marcas, metadatos, contador). La pieza solo se desplaza para cambiar de lugar, sin deformarse.
2. **Cada eje significa algo.** Horizontal = dentro de algo (slides, filtros, idioma). Vertical = otra cosa (pieza siguiente, secciones). Profundidad = abrir/cerrar.
3. **Feedback en el lugar.** La confirmación aparece en el control que se tocó. Sin toasts para acciones locales.
4. **Un protagonista por momento.**
5. **Nunca hacer esperar.** Nada del primer viewport arranca invisible. Todo se puede interrumpir.
6. **Reducido no es roto.** Con `prefers-reduced-motion`, fundido de 120 ms o cambio instantáneo, mismo feedback.

## Reglas de código

- Duraciones, curvas, delays y distancias **solo desde tokens** (`--duration-*`, `--ease-*`, `--stagger*`, `--crop-travel`, `--delay-chrome`, `--hold-feedback`). En JS se leen con `getComputedStyle(document.documentElement)`, así el modo reducido funciona sin ramas especiales.
- Animar solo `transform` y `opacity`. Única excepción: M28 (acordeón con `grid-template-rows`).
- Nunca animar `width`, `height`, `top`, `left`, `margin`, `box-shadow` ni `filter`.
- `will-change` solo durante la animación; se quita al terminar.
- Microinteracciones (M01–M05, M30–M36): CSS puro con `transition`.
- Tarjeta → caso, idioma y modo (M10–M12, M23, M24): View Transitions con `<ClientRouter />`, `transition:name` en mockup y título, `transition:persist` en la nav. Sin soporte → navegación normal, sin error.
- Filtros y visor (M06, M13, M14, M16): FLIP con Web Animations API, interrumpible con `animation.cancel()`.
- Slides (M15, M17): `scroll-snap-type: x mandatory` + `scrollend`; teclado y flechas con `scrollTo`.
- Entradas por scroll (M25, M27): un solo IntersectionObserver (umbral 0.15), clase `.is-in` una vez y desconectar. **Sin JS, todo visible** (la clase que oculta se agrega desde JS).
- Gestos: swipe confirma con > 20 % del ancho o > 0,35 px/ms; cerrar visor con arrastre vertical > 120 px.

## Decisiones cerradas (no reabrir)

- Hero y mosaico **sin animación de entrada** (M26).
- Tile de carrusel **estático** (M03).
- Cambio de modo con **fundido cruzado** de 300 ms (M23).

## Fuera del sistema

Zoom/tilt/parallax en piezas, scroll-jacking, scroll suave forzado, secciones pinneadas, contadores que suben, marquee, intro animada, sacudida de formulario, barra inferior que se esconde al scrollear, librerías de animación (GSAP, Framer Motion, Lenis…) sin aprobación.

## Criterios de aceptación

- Cada ID M01–M39 tiene versión reducida y se probó con la preferencia activa.
- 60 fps con 4× CPU throttling en M06, M13, M15 y M23.
- CLS = 0 al cambiar modo, idioma o filtro. LCP igual con y sin animaciones.
- ESC, segundo clic o swipe cortan cualquier animación del visor sin estados rotos.
- Marcas de corte visibles con teclado en piezas, tarjetas y visor.
