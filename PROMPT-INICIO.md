# Prompt de arranque para Claude Code

Cómo abrirlo (en la carpeta del repo nuevo, dándole acceso de lectura a las piezas):

```powershell
cd "C:\Users\FRANCO\Portfolio 2"
claude --add-dir "C:\Users\FRANCO\Portfolio\dist\proyectos"
```

Después pegá esto:

---

Vamos a construir mi portfolio desde cero en este repo. Leé primero `CLAUDE.md` y las reglas de `.claude/rules/`, después el PRD, `tokens.css` y el documento de motion. Son la fuente de verdad: no reabras decisiones que ya están cerradas ahí.

**Qué hay en el repo:** una carpeta del design system con los tokens y las fuentes, una carpeta con el PRD y una carpeta con el md del motion. Mi CV en PDF está en la raíz. Mis trabajos están en `C:\Users\FRANCO\Portfolio\dist\proyectos`, separados en una carpeta por trabajo. Esa carpeta es **solo lectura**: copiás, nunca movés ni borrás.

**Objetivo de esta etapa:** verlo funcionando en local (`npm run dev`) con mi contenido real. Nada de GitHub ni Vercel hasta que te lo pida.

**Skills:** antes de empezar, listá las skills que tengo instaladas y decime en qué fase vas a usar cada una. Usalas siempre que apliquen, pero el design system y el motion aprobados mandan sobre cualquier sugerencia de una skill.

Trabajá por fases y **frená al final de cada una** para que yo revise:

**Fase 0 · Reconocimiento (sin escribir código)**
- Confirmá las rutas reales de cada documento y corregí la tabla de `CLAUDE.md` si no coinciden.
- Recorré la carpeta de proyectos: cuántas imágenes y videos hay por trabajo, formatos, tamaños y pesos, y si parecen archivos ya comprimidos por un build anterior.
- Listá las skills disponibles y el mapeo por fase.
- Escribí `docs/plan.md` con las fases de abajo, ajustadas a lo que encontraste, y decime qué te falta de mí.

**Fase 1 · Base**
- Astro + TypeScript estricto + ESLint/Prettier, `git init` y `.gitignore` (con `.env`).
- `tokens.css` copiado a `src/styles/`, fuentes self-hosted, `base.css`.
- i18n `/es/` y `/en/`, tema claro/oscuro sin parpadeo, layout base con `<ClientRouter />` y SEO base.
- Una página `/dev/tokens` que muestre colores, tipografía, espaciado y motion tokens en los dos modos.

**Fase 2 · Inventario de piezas**
- Copiá las piezas a `src/assets/trabajos/<slug>/` con la convención de nombres del PRD.
- **Agrupá los slides de cada carrusel en una sola pieza** (regla del PRD §5). Si no podés saber con certeza qué slides van juntos, proponé la agrupación en `docs/inventario.md` con miniaturas o nombres y esperá mi confirmación.
- Generá los `src/content/casos/<slug>.json` con el modelo de `slides`, formato y ratio de cada pieza. Los textos que no estén en el PRD quedan como `TODO(contenido)`.

**Fase 3 · Componentes**
- Nav numerada, toggles de idioma y modo, botones, links, tile de pieza con marcas de corte, chips de filtro, barra inferior mobile, footer, campos del formulario.
- Todos los estados (default, hover, focus, active, disabled, loading, error, éxito) en una página `/dev/componentes`.

**Fase 4 · Home** — hero con mosaico, Trabajé con, 01 Trabajos con filtros, 02 Qué hago, 03 Proceso + IA, 04 Sobre mí, 05 Contacto.

**Fase 5 · Caso + visor** — plantilla de caso, tira de contactos, visor completo (teclado, swipe, carruseles, reels, URL con pieza y slide), transición tarjeta → caso.

**Fase 6 · Contacto y CV** — endpoint `/api/contacto` en modo local (sin enviar mails), descarga del CV por idioma, copiar mail, LinkedIn y WhatsApp.

**Fase 7 · Pasada de motion** — revisá M01–M39 contra `motion.md`, una por una, con y sin reduced motion, y entregame la tabla de cumplimiento.

**Fase 8 · QA** — Lighthouse, accesibilidad, 4 anchos, ES/EN, claro/oscuro, teclado. Corré las skills de revisión y corregí lo que encuentren.

Al cerrar cada fase decime: qué hiciste, la URL local exacta para verlo, qué quedó pendiente (contenido incluido) y qué decisión necesitás de mí. Empezá por la Fase 0.
