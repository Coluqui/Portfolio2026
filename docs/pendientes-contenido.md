# Pendientes de contenido

Lo que falta para que el sitio tenga contenido real. En el código, cada hueco es un `TODO(contenido): …` visible. `npm run pendientes` los lista y los cuenta.

Actualizado: 21 nov 2026 (Fase 4).

## Casos (`src/content/casos/*.json`)

Por cada uno de los 4 casos (MoonDesk, ISCAMEN, Condimento, Carpa):

- [ ] Nombre o título del caso (ES/EN)
- [ ] Mi rol
- [ ] Contexto, desafío, solución y resultado (2–3 líneas cada uno). Pasame los datos y redacto yo
- [ ] 1–4 métricas reales. Sin dato no se muestra nada; nunca se inventa
- [ ] Entregables
- [ ] Objetivo en una línea por pieza (23 piezas; puede quedar vacío en las piezas simples)
- [ ] Métrica por carrusel, si existe

## Revisar lo que redacté

- [ ] **Títulos de las 23 piezas** (ES/EN): los saqué del titular de cada pieza
- [ ] **Alt text de los 52 slides** (ES/EN): describen lo que se ve y lo que dice cada pieza; los datos que aparecen (USD 50.000, US$ 497, etc.) están en la pieza misma
- [ ] Condimento 04 se presenta como "Aplicaciones de marca", sin decir que la identidad es tuya (P8)

## Piezas e imágenes

- [x] **Mosaico del hero:** propuesto por Claude (`src/lib/home.ts`). Cambialo si querés otras
- [x] **Mejores piezas por empresa** para la home: propuestas en `destacadas` de cada caso. Revisalas
- [ ] Exportaciones de más resolución (≥ 1440 px de ancho) para las piezas del mosaico y las portadas
- [ ] Mockups o escenas de portada por caso (si no hay, uso marcos de dispositivo en CSS)
- [ ] Páginas interiores de los ebooks de MoonDesk (si existen)
- [ ] Reels o videos, si querés alguno en el MVP (hoy no hay)
- [ ] Logos de clientes en SVG monocromo (respaldo: los JPG del sitio actual)
- [ ] Foto de retrato 4:5 + avatar (¿uso `franco-photo.png` del sitio actual?)

## Home y textos generales

- [ ] **Revisar** la bio del hero y de Sobre mí, las especialidades, las 6 capacidades de "Qué hago" y los 4 pasos de "Proceso + IA" (borradores de Claude a partir del PRD y del CV, en `src/i18n/*.json` → `home`)
- [x] Experiencia con fechas: tomada del CV
- [x] Experiencia e inglés en el sitio: más de 5 años, B2 (pedido de Franco)
- [ ] **Actualizar el CV** para que coincida con el sitio: hoy dice "más de 7 años" e inglés B1
- [ ] Hero: la foto es provisoria hasta definir un arreglo gráfico o ilustración (D9)
- [ ] Foto de más resolución (la actual es 600×900)

## Contacto y CV

- [x] CV en inglés: era la página 2 del CV; ahora es `public/cv/franco-colucci-cv-en.pdf`
- [x] Mail, LinkedIn y WhatsApp: los mismos del sitio actual
- [ ] "Última actualización" del CV (el PRD la marca como pendiente)
