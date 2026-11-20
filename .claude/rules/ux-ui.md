# Reglas de UX/UI

Concepto rector: **Ficha de producción**. Papel, tinta y una tinta de señal. Gesto propio: **marcas de corte** en naranja señal alrededor de la pieza en hover y focus, más la numeración 01–05 en mono. Toda decisión visual se justifica desde ahí; si no se puede, sobra.

## Design system

- Todo valor sale de `src/styles/tokens.css`. **Cero valores sueltos**: ni hex, ni px de espaciado, ni duraciones, ni `font-size` fuera de los tokens. Si un caso no entra, proponé un token nuevo (no una excepción) y anotalo en `docs/decisiones.md`.
- Componentes usan solo tokens **semánticos** (`--color-bg`, `--color-text-primary`…), nunca la paleta base (`--paper-*`, `--ink-*`, `--signal-*`).
- Tipografía: Instrument Sans (400, 600) para lectura; Geist Mono (400, 500) solo para metadatos, numeración, etiquetas y métricas. Nada más.
- Radios 0–2 px en la interfaz. Radios grandes solo dentro de marcos de dispositivo.
- Naranja señal es el **único** acento. Verde solo para estados de éxito. Rojo solo para errores.
- El modo oscuro está diseñado aparte: no se invierte nada; las piezas van sobre `--color-stage`.

## Jerarquía y flujo

- El primer trabajo se ve **sin scroll** en 1440×900 y en 360×780 (mosaico del hero).
- Contacto y CV a **un clic** desde cualquier página (nav en desktop, barra inferior fija en mobile hasta 1279 px).
- Navegación numerada 01–05 fija, con la sección activa marcada.
- Caso de estudio escaneable: título, rol, contexto, desafío, solución, resultado. Texto breve, imágenes grandes.
- Piezas siempre en contexto (mockup o marco de formato), nunca sueltas sobre el fondo sin ficha.
- Tile de pieza: proporción real del formato (tokens `--ratio-*`), etiqueta mono `cliente · formato` siempre visible; carrusel con ⧉ y `· 7 slides`.

## Accesibilidad (WCAG 2.2 AA, no negociable)

- Contraste 4.5:1 en texto y 3:1 en texto grande y componentes, en los dos modos. Los pares de tokens ya están validados: no inventes combinaciones nuevas sin verificarlas.
- Focus visible y diseñado: marcas de corte + anillo de `--focus-ring-width`. Nunca `outline: none` sin reemplazo.
- Objetivos táctiles ≥ 44×44 px (`--target-min`) con 8 px de separación.
- Un solo H1 por página, H2–H3 en orden. Landmarks: `header`, `nav`, `main`, `footer`.
- HTML semántico primero: `<button>` para acciones, `<a>` para navegación. Nada de `div` clickeable.
- Visor: `role="dialog"`, `aria-modal`, foco atrapado, ESC cierra, foco vuelve al tile. Contador con `aria-live="polite"`.
- Formularios: `<label>` visible en cada campo, errores asociados con `aria-describedby`, sin depender solo del color.
- Toggles con estado anunciado (`aria-pressed` o `aria-checked`) y `lang` correcto en `<html>` y en el link de idioma.
- Todo funciona solo con teclado.

## Responsive

- Mobile-first. Breakpoints de los tokens: 768, 1280, 1440. Probar en 360, 768, 1280 y 1440+.
- Mobile no es una versión reducida: se diseña con la misma atención.
- Componentes con container queries cuando su layout depende del espacio, no del viewport.
- Hover solo en `@media (hover: hover) and (pointer: fine)`. En táctil, metadatos siempre visibles.
- Sin scroll horizontal, salvo la tira de contactos del caso (deliberado).
- Respetar safe areas (`--safe-*`) en la barra inferior y el visor.

## i18n

- El español es más largo: todo layout se prueba con el texto ES. Nada de anchos fijos en botones con texto.
- Cambiar idioma conserva página y sección. La preferencia se guarda.
- Nunca un string sin traducir en `/en/`. `astro check` + un script que compare las claves de `es.json` y `en.json`.

## Anticlichés (prohibido)

Degradados violeta/azul, blobs, glassmorphism, bento grids genéricos, Inter, cursores custom, partículas, texto que se escribe solo, contadores "+100 proyectos", marquee de logos, intros o pantallas de carga, emojis decorativos, ilustraciones 3D de stock, sombras exageradas en tarjetas.
