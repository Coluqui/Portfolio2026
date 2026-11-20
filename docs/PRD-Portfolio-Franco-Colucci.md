# PRD — Portfolio Franco Colucci

20 nov 2026 · Franco Colucci · **v2.1 (versión final de las etapas 0–6)**

Este documento reúne todo lo definido y aprobado desde la auditoría hasta el motion. Es la fuente de verdad para el diseño final (Etapa 7) y para Claude Code (Etapa 8), y se sigue actualizando si algo cambia.

## Estado del documento

La estructura (**wireframes v3, opción A**), el **design system "Ficha de producción"** y el **sistema de motion** (con las opciones seguras) están aprobados. Regla de contenido: **un carrusel es una sola pieza**.

| Etapa | Estado | Entregable |
| --- | --- | --- |
| 0 · Auditoría de la web actual | Hecha en forma parcial | Hallazgos en "Riesgos y decisiones" |
| 1 · PRD | Consolidado (v2.0), se mantiene vivo | Este documento |
| 2 · Referencias y concepto | Concepto elegido: Ficha de producción | Referencias de estructura + análisis de 9 portfolios |
| 3 · Arquitectura y flujos | Definida en este PRD | Mapa del sitio + flujos |
| 4 · Wireframes | Estructura aprobada | `Wireframes_v3_Estructura-combinada.pdf` |
| 5 · Design system | Aprobado (20 nov) | Documento "Design system — Portfolio Franco Colucci" + `design-system/tokens.css` v1.2 |
| 6 · Motion | **Aprobado** (20 nov), opciones seguras | `design-system/motion.md` + tokens v1.2 + prototipo "Motion — Portfolio Franco Colucci" |
| 7 · Diseño final (high-fi) | Próxima | Todas las páginas, desktop y mobile, claro y oscuro, ES y EN |
| 8 · Handoff a código | Sin empezar (el kit inicial ya existe) | Paquete de handoff + tareas ordenadas + CLAUDE.md actualizado |
| 9 · QA y lanzamiento | Sin empezar | Checklist de lanzamiento |

Descartado: formato presentación/láminas, muro de piezas, la opción B "Escaparate", las direcciones visuales "Galería" y "Malbec", el asomo y el "scrub" de carruseles en la grilla, la pasada de rodillo al cambiar de modo y la entrada animada del hero.

### Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 20 nov 2026 | 2.1 | Motion aprobado con las opciones seguras: tile de carrusel estático, cambio de modo con fundido cruzado y hero sin animación de entrada. Tokens v1.2 aprobados (sin `--duration-roller`) |
| 20 nov 2026 | 2.0 | Versión consolidada. Sistema de motion (Etapa 6): concepto "registro", principios, tokens v1.2, 37 interacciones (IDs M01–M39) especificadas y prototipo. Se cierran tres decisiones abiertas (vista previa de carruseles, cambio de modo, entrada del hero) a confirmar |
| 20 nov 2026 | 1.4 | Repo nuevo con Astro (propuesto) y kit inicial para Claude Code |
| 20 nov 2026 | 1.3 | Design system aprobado. Comportamiento responsive por componente, reglas para pantallas táctiles y tokens de layout (v1.1) |
| 20 nov 2026 | 1.2 | Regla "un carrusel = una pieza": modelo de contenido, tile, visor, conteos y performance |
| 17 nov 2026 | 1.1 | Estructura combinada aprobada |
| 17 nov 2026 | 1.0 | Primera versión |

### Documentos relacionados

| Documento | Dónde |
| --- | --- |
| Wireframes v3 | `Wireframes_v3_Estructura-combinada.pdf` (proyecto) |
| Design system | Documento "Design system — Portfolio Franco Colucci" |
| Tokens | `design-system/tokens.css` v1.2 (proyecto) |
| Sistema de motion | `design-system/motion.md` (proyecto) |
| Prototipo de motion | https://claude.ai/artifact/7FiEPDUMLfnNCLTxhGSYnE |
| Guía para Claude Code | "Guía: del PRD a Claude Code" — https://claude.ai/artifact/3MENedbRJWcsYT28VJ5CYY |

## 1. Objetivo y métricas de éxito

El portfolio existe para conseguir entrevistas en empresas, remotas o locales, en puestos de diseño gráfico/digital desde USD 2000. En los primeros segundos tiene que mostrar el mejor trabajo y transmitir nivel profesional.

| Métrica | Cómo se mide | Meta inicial |
| --- | --- | --- |
| Tiempo hasta ver trabajo | Piezas del hero visibles sin scroll en 1440×900 y 360×780 | 0 s, sin scroll |
| Contactos recibidos | Envíos del formulario + clics en mail, LinkedIn y WhatsApp | A definir tras el lanzamiento |
| Descargas del CV | Clics en "Descargar CV", por idioma | A definir tras el lanzamiento |
| Casos abiertos por visita | Visitas a páginas de caso / visitas a la home | A definir tras el lanzamiento |
| Profundidad en el visor | Piezas vistas por apertura del visor; en carruseles, % que llega al último slide | A definir tras el lanzamiento |
| Entrevistas conseguidas | Registro propio: entrevistas cuyo origen fue el portfolio | A definir |

Pendiente: elegir la herramienta de analítica (ver "Stack técnico").

## 2. Público y escenarios de uso

Quien mira decide en menos de un minuto, muchas veces desde el celular. Cada escenario necesita algo distinto de la misma página.

| Quién | Dónde y cómo llega | Qué busca | Qué tiene que encontrar |
| --- | --- | --- | --- |
| Recruiter | Celular, desde LinkedIn o una postulación | Saber si encaja con el puesto | Puesto, años, ubicación/remoto, idiomas, CV a un toque |
| Director de arte | Desktop, con tiempo para revisar | Criterio y calidad del trabajo | Mosaico del hero, casos con piezas grandes, visor a pantalla completa |
| Equipo de marketing o producto | Desktop o celular, por recomendación | Si sabe producir para sus canales | Filtros por formato (ads, mail, redes), carruseles completos como se ven en el feed, métricas por caso |
| Contacto internacional | Desktop, en inglés | Lo mismo, en su idioma | Versión EN completa, sin textos sin traducir |

## 3. Posicionamiento

**Propuesta (borrador):** diseñador gráfico y digital que produce piezas de redes, ads de performance, mails, ebooks y webs que comunican claro y rinden, con base en UX/UI y un flujo de trabajo con IA.

Qué te diferencia, en orden de peso:

1. Rango de formatos digitales: del carrusel y el reel al ad, el mail, el ebook y la web en WordPress.
2. Pensamiento de sistema: plantillas y componentes en Figma para producir mucho sin perder consistencia.
3. IA aplicada al proceso: Claude Code, ChatGPT y Antigravity para producir más rápido.
4. Experiencia con organismos públicos y marcas privadas (ISCAMEN, MoonDesk, Condimento, Carpa, RLB, Interlink).

Título del sitio: **Diseñador gráfico y digital** (EN: *Graphic & Digital Designer*). Hoy la web dice solo "Digital Designer".

**Voz de los textos:** concreta, profesional y cercana. Nada de "apasionado por el diseño" ni "transformo ideas en experiencias".

## 4. Alcance

El MVP es una home de una sola página con 5 secciones numeradas, más una página por caso. Todo existe en ES y EN, en modo claro y oscuro.

**Páginas del MVP**

| Página | Contenido |
| --- | --- |
| Home `/es/` y `/en/` | Hero (nombre, puesto, bio, expertise, mosaico de mejores piezas) · franja "Trabajé con" · 01 Trabajos · 02 Qué hago · 03 Proceso + IA · 04 Sobre mí · 05 Contacto |
| Caso `/trabajos/<slug>` × 4 | MoonDesk, ISCAMEN, Condimento, Carpa: métricas, contexto, mi rol, piezas filtrables por formato, entregables, resultado, siguiente caso |
| 404 | Mensaje corto + links a Trabajos y Contacto |

**Funcionalidades del MVP**

- [ ] Navegación numerada fija, con la sección activa marcada
- [ ] Toggle ES/EN que mantiene la página y la posición
- [ ] Toggle claro/oscuro que respeta la preferencia del sistema y la recuerda
- [ ] Mosaico del hero con links a cada caso
- [ ] Filtros por formato en la home y en cada caso
- [ ] Visor de piezas a pantalla completa (teclado, swipe, ESC), con carruseles navegables por slide y reels reproducibles
- [ ] Formulario de contacto con validación y estados de carga, éxito y error
- [ ] Links directos: copiar mail, LinkedIn, WhatsApp
- [ ] Descarga del CV en PDF, en el idioma activo
- [ ] Barra inferior fija en mobile con Contacto y CV
- [ ] Sistema de motion completo (sección 9), con versión reducida en cada interacción

**Después del MVP**

- Quinto caso (proyecto personal, a elegir)
- Página Sobre mí / CV completa, separada de la home
- Dominio propio
- Antes/después en los casos que lo tengan

## 5. Carruseles: un carrusel es una sola pieza

Un carrusel se diseña, se publica y se evalúa como una unidad, así que en el sitio se cuenta, se muestra y se navega como **una pieza con varios slides**, nunca como varias imágenes sueltas. Hoy los casos muestran 18–19 imágenes cada uno, y buena parte son slides de un mismo carrusel: así el trabajo parece más disperso de lo que es y se pierde la narrativa de cada carrusel.

| Dónde | Cómo se comporta |
| --- | --- |
| Conteos | Un carrusel suma 1 en todo: contador del visor, cantidad por filtro, "piezas por caso" y los 6 lugares del mosaico del hero |
| Tile en grilla y mosaico | Muestra la portada (slide 1) en 4:5, el ícono ⧉ y la etiqueta mono `cliente · Carrusel · 7 slides`. Los demás slides no aparecen en la grilla |
| Vista previa | **Tile estático** (M03, aprobado): hover y focus muestran las marcas de corte y la acción "Ver 7 slides ↗", como cualquier pieza. No se cargan slides extra y funciona igual en mobile |
| Visor | Abre el carrusel como una pieza: el slide en 4:5 dentro del marco de teléfono, con indicador segmentado y metadatos debajo. Contador doble: `Pieza 03 / 12 · Slide 4 / 7` |
| Navegación con teclado | ← → recorren los slides; después del último, → pasa a la pieza siguiente (y ← vuelve a la anterior desde el primero), así nunca queda trabada. Re Pág / Av Pág saltan de pieza directo. ESC cierra |
| Navegación táctil | Swipe horizontal = slides, igual que en Instagram. Después del último slide hay un panel "Siguiente pieza →" que, al soltar, pasa a la pieza siguiente. Botones fijos "Pieza anterior / siguiente" de 44 px |
| Inicio | Siempre arranca en el slide 1. Sin autoplay |
| Enlace directo | La URL guarda pieza y slide (`?pieza=<slug>&slide=4`) |
| Página de caso | El carrusel destacado puede mostrarse además como **tira de contactos**: los slides en fila horizontal, con scroll nativo; un clic abre el visor en ese slide. Una vez por caso |

**Accesibilidad:** el visor anuncia "Slide 4 de 7" con `aria-live="polite"`; cada slide tiene su propio alt; el carrusel usa `aria-roledescription="carrusel"`; el indicador segmentado es decorativo y el contador en texto es el que se lee.

**Performance:** en la grilla se carga solo la portada. Al abrir el visor se carga el slide actual y se precarga el siguiente.

## 6. Arquitectura de información y flujos

El sitio tiene dos niveles: una home con todo el resumen y una página por caso. Sobre mí y Contacto son secciones de la home, no páginas aparte, para ahorrar clics.

```
Siempre visible: nav numerada · ES/EN · claro/oscuro · CV ↓ · barra Contacto/CV en mobile

Home (/es/ y /en/)
├── Hero + mosaico de piezas ──(click en una pieza)──┐
├── Trabajé con (clientes)                            │
├── 01 Trabajos + filtros ──(click en una tarjeta)───┤
├── 02 Qué hago + herramientas                        ▼
├── 03 Proceso + IA                        Casos (/trabajos/<slug>)
├── 04 Sobre mí + CV                       ├── MoonDesk
└── 05 Contacto                            ├── ISCAMEN
                                           ├── Condimento
                                           └── Carpa
                                                 │ click en una pieza
                                                 ▼
                                           Visor de piezas
                                           (pantalla completa · ← → · swipe · ESC)
```

**Flujos clave**

1. **Ver trabajo:** entra a la home → ve el mosaico sin scroll → click en una pieza → caso. 1 clic.
2. **Buscar un formato:** filtro "Mail" en Trabajos → tarjeta → caso con el filtro "Mail" ya activo. 2 clics.
3. **Ver un carrusel completo:** click en el tile ⧉ → visor en el slide 1 → → o swipe hasta el último → la pieza siguiente. 1 clic para abrir.
4. **Descargar el CV:** botón "CV ↓" en la nav (o barra inferior en mobile) → PDF en el idioma activo. 1 clic.
5. **Contactar:** "05 Contacto" o la barra inferior → formulario o link directo (mail, LinkedIn, WhatsApp). 1 clic.
6. **Cambiar idioma o modo:** toggle en la nav → misma página y posición; la preferencia queda guardada.

## 7. Contenido

La mayor parte del trabajo pendiente es contenido, no código. Hoy cada caso tiene 18–19 imágenes sin texto ni orden por formato. Al agrupar los carruseles, cada caso va a tener menos piezas, pero más completas.

| Pieza de contenido | ES / EN | Quién | Estado |
| --- | --- | --- | --- |
| Bio corta del hero (2 líneas) y bio de Sobre mí | Ambos | Franco + Claude | Borrador en wireframes |
| Tags de expertise y 6 capacidades de "Qué hago" | Ambos | Claude propone, Franco aprueba | Borrador en wireframes |
| 4 pasos de "Proceso + IA" | Ambos | Franco + Claude | Borrador en wireframes |
| Experiencia con fechas (empresa, rol, período) | Ambos | Franco (desde el CV) | Falta |
| Por caso: contexto, desafío, mi rol, entregables, resultado | Ambos | Franco aporta datos, Claude redacta | Falta |
| Por caso: 1–4 métricas reales | — | Franco | Falta |
| **Inventario de piezas por caso:** agrupar los slides de cada carrusel en una carpeta, en orden | — | Franco | Falta (primer paso de la curaduría) |
| Por carrusel: título corto, objetivo en una línea y métrica si existe | Ambos | Franco aporta datos, Claude redacta | Falta |
| Piezas exportadas por formato, con nombre y alt text propio (en carruseles, alt por slide) | Alt en ambos | Franco | Falta curar y renombrar |
| Mockups: escenario de portada por caso + pieza principal | — | Franco (Claude Design / Photoshop) | Falta |
| Mosaico del hero: 6 piezas, una por formato (un carrusel = un lugar) | — | Franco elige | Falta |
| Logos de clientes (SVG, monocromo) | — | Franco | Falta |
| Foto (retrato 4:5 + avatar) | — | Franco | Existe una, revisar |
| CV en PDF | Ambos | Franco | Existe, "última actualización pendiente" |
| Textos de interfaz, formulario, visor, 404 y metadatos SEO | Ambos | Claude | Falta |
| Microcopy de feedback del motion: "Copiado ✓", "Descargando", "CV ✓", "Enviando", "Mensaje enviado", errores de campo | Ambos | Claude | Borrador en el prototipo |

**Nombres de archivo:** `<cliente>-<formato>-<tema>.webp` para piezas simples y `<cliente>-carrusel-<tema>-01.webp`, `-02`… para los slides, en el orden de publicación.

**Modelo de contenido por pieza** (en el archivo de cada caso):

```json
{
  "slug": "<tema>",
  "formato": "carrusel",
  "ratio": "4:5",
  "titulo": { "es": "…", "en": "…" },
  "objetivo": { "es": "…", "en": "…" },
  "metrica": { "valor": "…", "etiqueta": { "es": "…", "en": "…" } },
  "slides": [
    { "src": "iscamen-carrusel-<tema>-01.webp", "alt": { "es": "…", "en": "…" } },
    { "src": "iscamen-carrusel-<tema>-02.webp", "alt": { "es": "…", "en": "…" } }
  ]
}
```

Una pieza simple usa el mismo modelo con un solo elemento en `slides`. Así, el visor, la grilla y los conteos funcionan igual para todos los formatos.

## 8. Design system: decisiones tomadas

El detalle completo está en el documento "Design system — Portfolio Franco Colucci" y en `design-system/tokens.css`.

| Tema | Decisión |
| --- | --- |
| Concepto rector | **Ficha de producción:** el sitio como ficha técnica de un sistema de producción. Papel, tinta y una tinta de señal |
| Gesto propio | **Marcas de corte:** cuatro esquinas en naranja señal alrededor de la pieza en hover y focus, con la línea de metadatos debajo. También son el focus de teclado. Se suma la numeración 01–05 en mono |
| Color | Papel #F3F1EB / tinta #1A1917; naranja señal #D9431A como único acento (links en #B23412); verde #2E5A47 solo para estados. Oscuro diseñado aparte: #161513, piezas sobre `stage` #272521 |
| Tipografía | Instrument Sans (lectura) + Geist Mono (metadatos, numeración, métricas). Escala fluida de 360 a 1440 px; display de 40 a 88 px |
| Espaciado y grilla | Base 4 px; 4 / 8 / 12 columnas; márgenes de 20 a 64 px; contenedor máximo de 1312 px |
| Radios | 0–2 px en la interfaz; radios grandes solo dentro de los marcos de dispositivo |
| Proporciones | 4:5 carrusel/posteo, 9:16 reel/story, 1:1 posteo/ad, 3:1 cabecera de mail, 3:4 ebook, 6:5 ad 300×250, 8:1 banner 728×90, 16:10 web |
| Accesibilidad | 64 combinaciones de texto, acento y borde validadas en AA en los dos modos |
| Responsive | Mobile-first. Grilla de piezas en 2 / 3 / 4 columnas; nav con menú y barra inferior hasta 1279 px; en el visor mobile la pieza va sin marco de dispositivo; componentes con container queries |
| Pantallas táctiles | Hover solo con `(hover: hover) and (pointer: fine)`. En táctil, los metadatos están siempre visibles y las marcas de corte aparecen al tocar y en la pieza abierta |

## 9. Motion

La especificación completa (37 interacciones, IDs M01–M39, con disparador, propiedades, duración, easing, delay y versión reducida) está en `design-system/motion.md` v1.1, aprobada. El prototipo navegable muestra las clave y tiene un interruptor para ver la versión reducida.

**Idea: registro.** En imprenta, *registro* es cuando las tintas de cada pasada caen exactas una sobre otra. Lo importante llega apenas fuera de lugar y se asienta exacto, con la curva `ease-register`. Las marcas de corte son la firma visual y también la del movimiento: aparecen en hover y focus, enmarcan la pieza abierta en el visor y cierran el envío del formulario. Se eligieron las opciones seguras: el motion vive en la interacción, no en la carga.

**Principios**

1. **La pieza no se toca.** Nada de zoom, tilt ni blur sobre el trabajo; se mueve la ficha alrededor.
2. **Cada eje significa algo.** Horizontal = recorrer dentro de algo (slides, filtros, idioma). Vertical = pasar a otra cosa (pieza siguiente, secciones). Profundidad = abrir y cerrar.
3. **Feedback en el lugar.** La confirmación aparece en el mismo control que se tocó.
4. **Un protagonista por momento.**
5. **Nunca hacer esperar.** Nada del primer viewport arranca invisible; todo se puede interrumpir.
6. **Reducido no es roto.** Con `prefers-reduced-motion`, fundidos de 120 ms o cambios instantáneos, con el mismo feedback.

**Momentos clave**

| Momento | Qué pasa |
| --- | --- |
| Hover / focus en una pieza (M01–M03) | Marcas de corte que entran en registro (6 px, 200 ms) y la acción "Ver pieza ↗". Los carruseles se comportan igual: tile estático |
| Filtros (M05–M06) | El fondo del chip activo viaja con un rebote mínimo; la grilla se reordena con FLIP |
| Tarjeta → caso (M10–M12) | View Transition: el mockup se convierte en el hero del caso y el nombre en el H1 (700 ms) |
| Visor (M13–M19) | La pieza viaja del tile al visor (500 ms); slides en horizontal con scroll nativo; pieza siguiente en vertical; contador que rueda |
| Cambio de modo (M23) | Fundido cruzado de toda la página (300 ms), sin salto de layout; el ícono gira 180° |
| Hero (M26) | Sin animación de entrada: el hero y el mosaico se ven completos en el primer frame |
| Entradas por scroll (M25, M27) | Los filetes se dibujan de izquierda a derecha; los números no cuentan hacia arriba |
| Acciones (M33–M39) | CV que "cae en la bandeja", "Copiado ✓" en el mismo lugar, filete de carga en el botón, confirmación con marcas de corte |

**Tokens nuevos (v1.2):** `--ease-spring`, `--stagger-fast` (40 ms), `--crop-travel` (6 px), `--delay-chrome` (200 ms), `--hold-feedback` (1800 ms). Todos tienen su valor reducido.

**Fuera del sistema:** asomo o scrub de carruseles, pasada de rodillo, entrada animada del hero, zoom o parallax en piezas, cursor custom, partículas, texto que se escribe solo, contadores animados, marquee de logos, pantallas de carga, scroll-jacking, sacudida del formulario y la barra inferior que se esconde al scrollear.

## 10. Requisitos no funcionales

| Área | Requisito | Criterio de aceptación |
| --- | --- | --- |
| Accesibilidad | WCAG 2.2 AA en ambos modos | Contraste 4.5:1 en texto (3:1 texto grande y componentes), focus visible (marcas de corte + anillo), objetivos táctiles de 44×44 px, H1–H3 en orden, alt propio por pieza y por slide, foco atrapado en el visor y devuelto al cerrar |
| Motion | `prefers-reduced-motion` respetado | Cada ID M01–M39 tiene versión reducida; solo `transform` y `opacity` (única excepción: el acordeón de "Qué hago"); sin scroll-jacking ni pantallas de carga; 60 fps en Android de gama media; CLS = 0 al cambiar modo, idioma o filtro |
| Performance | Carga rápida con muchas imágenes | Lighthouse ≥ 90 en mobile; LCP < 2,5 s (el hero no tiene animación de entrada); imágenes AVIF/WebP con `srcset` y carga diferida fuera del fold; en carruseles solo la portada en la grilla |
| SEO | Cada caso indexable | Title y description por página y por idioma, Open Graph con imagen, `hreflang` ES/EN, sitemap |
| Responsive | Mobile-first | Probado en 360, 768, 1280 y 1440 px o más, sin scroll horizontal (salvo la tira de contactos, que es un scroll horizontal deliberado) |
| i18n | ES y EN completos | Rutas `/es/` y `/en/`; ningún layout se rompe con el texto más largo (ES) |
| Modos | Claro y oscuro diseñados, no invertidos | Toggle sin salto de layout; sin parpadeo del modo al cargar |
| Formulario | Envío confiable y sin spam | Validación inline al salir del campo, estados de carga, éxito y error (sin perder lo escrito), protección anti-spam |

## 11. Stack técnico

El sitio nuevo arranca en un **repo nuevo** con Astro y un kit inicial (CLAUDE.md, reglas, skill `/cargar-trabajos`, tokens y PRD). El sitio actual (`Coluqui/Portfolio---Franco-Colucci`, en Vercel) sigue online hasta el lanzamiento. Se mantienen las rutas `/es/`, `/en/` y `/trabajos/<slug>/`.

| Pieza | Decisión | Estado |
| --- | --- | --- |
| Hosting | Vercel, dominio gratuito por ahora | Decidido |
| Desarrollo | Claude Code, con un CLAUDE.md que fija tokens y reglas | Decidido |
| Tokens | `design-system/tokens.css` v1.2 como fuente de verdad (regenerar `tokens.json` desde este archivo) | Aprobado (v1.2) |
| Fuentes | Instrument Sans (400, 600) + Geist Mono (400, 500), Google Fonts, `font-display: swap` | Aprobado |
| Framework | **Astro** en un repo nuevo (i18n, optimización de imágenes, colecciones de contenido con esquema, transiciones de página) | Propuesto |
| Contenido | Un archivo por caso (Markdown/JSON) con textos ES/EN, métricas y piezas con el modelo de `slides` | Propuesto |
| Imágenes | Optimización en build (AVIF/WebP + `srcset`) | Propuesto |
| Motion | CSS para microinteracciones; View Transitions con `<ClientRouter />` (`transition:name`, `transition:persist`) para tarjeta → caso, idioma y modo; Web Animations API para FLIP de filtros y visor; `scroll-snap` nativo para slides. **Sin librería** en el MVP | Aprobado (Etapa 6) |
| Formulario | Servicio de formularios o función de Vercel + mail | Abierto |
| Analítica | Vercel Analytics o equivalente sin cookies | Abierto |

## 12. Próximas etapas

| Etapa | Qué incluye | Entrada que necesita |
| --- | --- | --- |
| 7 · Diseño final | Home, caso, visor, 404 y estados de componentes en desktop y mobile, claro y oscuro, ES y EN, con contenido real | Inventario de piezas, mockups del mosaico y de las portadas de los 4 casos, textos de caso |
| 8 · Handoff | Specs por página, assets exportados, criterios de aceptación, lista de tareas ordenada, CLAUDE.md actualizado con las reglas de motion | Etapa 7 aprobada |
| 9 · QA y lanzamiento | Revisión contra diseño, accesibilidad, performance, SEO, enlaces, formulario, los dos idiomas y los dos modos en navegadores y dispositivos reales | Sitio implementado |

## 13. Riesgos y decisiones abiertas

**Riesgos**

| Riesgo | Por qué importa | Mitigación |
| --- | --- | --- |
| Que se vea como plantilla | La estructura es conocida; Anima y Magic Portfolio son templates | La personalidad sale del concepto, las marcas de corte y el motion de registro |
| Casos sin texto ni métricas | Hoy cada caso es una tira de imágenes; un recruiter no entiende qué hiciste | Plantilla de caso obligatoria: contexto, rol, métricas, entregables |
| Carruseles desarmados | Si los slides quedan sueltos, el trabajo se ve disperso | Regla "un carrusel = una pieza", inventario por carpeta antes de exportar |
| Navegación del visor confusa | Slides y piezas en el mismo gesto pueden desorientar | Ejes distintos (slide = horizontal, pieza = vertical), contador doble y panel "Siguiente pieza →"; probado en el prototipo, validar con 2–3 personas en el celular |
| Motion que pese o distraiga | Muchas animaciones en una página con muchas imágenes | Solo `transform`/`opacity`, un protagonista por momento, la pieza nunca se anima en hover, criterios de 60 fps y LCP |
| Soporte de View Transitions | No todos los navegadores las soportan | Degradan a navegación normal sin error; el sitio no depende de ellas |
| Peso de las imágenes | Muchos slides + mosaico + reels | Solo portadas en la grilla, precarga del slide siguiente, optimización en build, videos cortos y mudos |
| Inglés incompleto | Un texto sin traducir resta en postulaciones internacionales | Todo texto vive en archivos ES/EN; QA en los dos idiomas |
| Producción de mockups | Es la tarea más larga y frena el resto | Empezar por los 6 del mosaico y las portadas de los 4 casos |

**Decisiones cerradas en la Etapa 6**

- [x] Vista previa de carruseles: tile estático
- [x] Cambio de modo: fundido cruzado
- [x] Entrada del hero: sin animación
- [x] Tokens de motion v1.2

**Decisiones abiertas**

- [ ] ¿La regla "un carrusel = una pieza" aplica a otros grupos? Un set de ads de una campaña en varios tamaños o una secuencia de stories podrían contarse como una pieza con variantes
- [ ] Quinto proyecto (personal): cuál y cuándo
- [ ] Fechas de experiencia y métricas por caso: pasarlas desde el CV
- [ ] Confirmar Astro en el repo nuevo
- [ ] Servicio de formulario y analítica
- [ ] ¿Canva en el stack público? Hoy queda afuera porque no lo usás
