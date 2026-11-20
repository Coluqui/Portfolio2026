# Inventario de piezas — propuesta (Fase 2)

20 nov 2026 · **Pendiente de tu confirmación.** No se copió nada todavía.

- **Fuente:** `C:\Users\FRANCO\Portfolio\dist\proyectos` (solo lectura).
- **Mapeo:** `scripts/inventario.json`. Es la única fuente: si cambiás un grupo ahí, las hojas, la copia y los JSON salen del mismo archivo.
- **Hojas de contacto:** [iscamen](inventario/iscamen.jpg) · [moondesk](inventario/moondesk.jpg) · [carpa](inventario/carpa.jpg) · [condimento](inventario/condimento.jpg). Cada miniatura muestra el archivo original, su tamaño y el nombre nuevo. Los grupos en rojo son los que hay que confirmar.

**Resultado propuesto: 52 archivos → 23 piezas** (ISCAMEN 5 · MoonDesk 10 · Carpa 4 · Condimento 4).

## ISCAMEN · 19 archivos → 5 piezas

| | Pieza | Archivos | Formato · ratio | Confianza |
| --- | --- | --- | --- | --- |
| A | Bioinsumos de exportación | 01–07 (7 slides) | carrusel · 4:5 | Alta: portada, 5 especies, cierre con logos |
| B | Huerto urbano | 08–12 (5 slides) | carrusel · 4:5 | **Media → P1** |
| C | Día del Trabajador | 13 | story · 9:16 | Alta |
| D | La mujer en la ciencia | 14 | story · 9:16 | Alta |
| E | Cítricos | 15–19 (5 slides) | carrusel · 4:5 | **Media → P2** |

## MoonDesk · 18 archivos → 10 piezas

| | Pieza | Archivos | Formato · ratio | Confianza |
| --- | --- | --- | --- | --- |
| A | Nacimos de un error | 01–05 (5 slides) | carrusel · 4:5 | Alta: historia que cierra con "Agenda una demo" |
| B | Un cambio normativo | 06 | posteo · 4:5 | **Media → P3** |
| C | Día de la Tierra | 07–11 (5 slides) | carrusel · 4:5 | Alta |
| D | One-pager de la plataforma | 12 | one-pager · A4 | Media → P4 |
| E | El código se transforma | 13 | ebook (portada) · A4 | **Baja → P4** |
| F | 5 errores del packaging | 14 | ebook (portada) · A4 | **Baja → P4** |
| G | Feria Envase 2025 | 15 | posteo · 4:5 | Alta |
| H | ¿Qué generó más retrabajos? | 16 | posteo · 4:5 | **Media → P5** |
| I | Testimonio | 17 | story · 9:16 | Alta |
| J | Validaciones en segundos | 18 | posteo · 4:5 | Alta |

## Carpa · 11 archivos → 4 piezas

| | Pieza | Archivos | Formato · ratio | Confianza |
| --- | --- | --- | --- | --- |
| A | Portadas de bonos | 01–05 | set de portadas · 6:7 | **Baja → P6** |
| B | Oferta de lanzamiento | 06 | banner · en marco web 16:10 | Media → P7 |
| C | Portadas de módulos | 07–10 | set de portadas · 6:7 | **Baja → P6** |
| D | Mockup Método Carpa | 11 | mockup · 6:7 | Alta. Candidato a portada del caso |

## Condimento · 4 archivos → 4 piezas

| | Pieza | Archivos | Formato · ratio | Confianza |
| --- | --- | --- | --- | --- |
| A | "No necesitás otra campaña" | 01 | ad · 1:1 | Alta |
| B | "Tráfico sin ventas" | 02 | ad · 1:1 | Alta |
| C | "Auditoría gratis" | 03 | ad · 1:1 | Alta |
| D | Aplicaciones de marca | 04 | identidad · en marco 1:1 | Media → P8 |

A, B y C son un set de la misma campaña. Por D4 quedan como 3 piezas sueltas con nombres hermanos.

## Preguntas

| # | Pregunta | Si no me decís nada… |
| --- | --- | --- |
| **P1** | ISCAMEN 08–12 "Huerto urbano": ¿fue **un carrusel** o **5 posteos** (uno por encuentro, del 5 al 26 de mayo)? | Carrusel de 5 |
| **P2** | ISCAMEN 15–19 "Cítricos": ¿es un carrusel de 5 y en este orden? | Carrusel de 5 en este orden |
| **P3** | MoonDesk 06 "Un cambio normativo": ¿posteo suelto o slide 6 de "Nacimos de un error"? | Posteo suelto |
| **P4** | MoonDesk 12–14 (A4): ¿12 es un one-pager comercial y 13–14 portadas de ebook o lead magnet? ¿Tenés las páginas interiores de los ebooks? Si las tenés, cada ebook pasa a ser una pieza con varias páginas, igual que un carrusel | 12 one-pager, 13–14 portadas de ebook, solo portada |
| **P5** | MoonDesk 16 "¿Qué generó más retrabajos?": ¿posteo suelto o portada de un carrusel cuyos otros slides no están en la carpeta? | Posteo suelto |
| **P6** | Carpa 01–05 y 07–10 **no son carruseles**: son portadas de bonos y de módulos del curso (el mockup 11 las muestra como libros). ¿Las agrupo como **2 piezas "set de portadas"** (excepción a D4) o van como **9 piezas sueltas**? ¿Dónde se usaron (landing, plataforma del curso, ads)? | 2 sets: con 9 sueltas casi iguales el caso se ve disperso, que es justo lo que el PRD quiere evitar |
| **P7** | Carpa 06 (835×451): ¿es el banner de la landing? | Banner de landing, en marco web |
| **P8** | Condimento 04: ¿diseñaste la identidad de Condimento o solo las piezas? Cambia cómo se presenta el board | "Aplicaciones de marca", sin decir que la identidad es tuya |

## Formatos y filtros (propuesta)

Cada pieza tiene un `formato` (lo que se ve en la etiqueta mono `cliente · formato`). Los filtros agrupan formatos para que ningún chip quede casi vacío y no haya chips de formatos que no existen (hoy no hay mails, webs ni reels):

| Filtro | Formatos | Piezas |
| --- | --- | --- |
| Todo | — | 23 |
| Redes | carrusel, posteo, story | 15 |
| Ads | ad | 3 |
| Documentos | ebook, one-pager | 3 |
| Lanzamientos | portadas, banner, mockup | 3 (con P6 = 2 sets) |
| Identidad | identidad | 1 |

Un chip con una sola pieza (Identidad) es poco. Propongo sumarla a "Lanzamientos" o sacar el filtro hasta que haya más.

## Mosaico del hero (6 lugares, vos elegís)

Mi propuesta: una pieza por formato y por cliente, con lo más fuerte visualmente:

1. ISCAMEN · carrusel Bioinsumos (A)
2. MoonDesk · carrusel Nacimos de un error (A)
3. Carpa · mockup Método Carpa (D)
4. Condimento · ad "Tráfico sin ventas" (B)
5. ISCAMEN · story La mujer en la ciencia (D)
6. MoonDesk · ebook 5 errores del packaging (F)

## Notas técnicas

- **Extensión:** las piezas se copian en **JPG tal cual** (byte a byte) y `astro:assets` genera AVIF/WebP en el build. Renombrarlas a `.webp` como dice el PRD §7 sería comprimirlas dos veces. El resto de la convención (`<cliente>-<formato>-<tema>-NN`) se respeta.
- **Resolución:** las 4:5 están a 1080 px de ancho. Si tenés exportaciones más grandes de las piezas del mosaico, se reemplazan con el mismo nombre.
- **Alt text:** después de tu confirmación escribo un borrador ES/EN por pieza y por slide, describiendo cada imagen, para que lo revises.
