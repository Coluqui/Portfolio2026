# Portfolio 2026 — Franco Colucci

Portfolio de Franco Colucci, diseñador gráfico y digital (Mendoza, Argentina). Astro + TypeScript, sin frameworks de UI ni librerías de animación.

## Comandos

| Comando                         | Qué hace                                                       |
| ------------------------------- | -------------------------------------------------------------- |
| `npm install`                   | Instala dependencias (Node 22.23+)                             |
| `npm run dev`                   | Servidor local en http://localhost:4321                        |
| `npm run build`                 | Build de producción en `dist/`                                 |
| `npx astro preview --port 4322` | Sirve el build (para medir y auditar)                          |
| `npm run check`                 | Tipos, contenido e i18n                                        |
| `npm run lint`                  | ESLint + Prettier                                              |
| `npm run audit:motion`          | Auditoría de motion sobre el build (puerto 4322)               |
| `npm run qa`                    | Matriz de QA: anchos × idiomas × modos + teclado (puerto 4322) |
| `npm run pendientes`            | Lista los `TODO(contenido)`                                    |

## Documentación

- `CLAUDE.md` y `.claude/rules/`: reglas del proyecto.
- `docs/`: PRD, motion, decisiones, inventario de piezas, cumplimiento de motion, QA y flujo de git.

## Ramas

Ver `docs/flujo-git.md`. Resumen: `main` es lo publicado, `develop` integra, y cada cambio va en su propia rama (`feat/…`, `fix/…`, `docs/…`) con pull request a `develop`.
