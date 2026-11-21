# QA — Fase 8

21 nov 2026 · sobre el build real (`npm run build` + `astro preview`, sin las variables de Resend: modo local).

## Cómo repetirlo

```powershell
npm run build
npx astro preview --port 4322
npm run audit:motion
npm run qa
npx lighthouse http://localhost:4322/es/ --preset=perf
```

`npm run audit:motion` y `npm run qa` apuntan a `http://localhost:4322` por defecto y usan el Chrome instalado.

## Resultados

| Área | Resultado |
| --- | --- |
| `astro check` · i18n · ESLint/Prettier | 0 errores, 0 avisos, 0 pistas · 218 claves ES = EN · sin problemas |
| Lighthouse mobile — home `/es/` | **Rendimiento 97 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100** · LCP 2,1 s · CLS 0 · TBT 0 ms |
| Lighthouse mobile — caso `/es/trabajos/moondesk/` | **96 · 100 · 100 · 100** · LCP 2,5 s · CLS 0 |
| Lighthouse mobile — caso `/en/trabajos/iscamen/` | **95 · 100 · 100 · 100** · LCP 2,6 s · CLS 0 |
| Matriz 360 / 768 / 1280 / 1440 × claro/oscuro, 7 páginas (ES y EN, caso, contacto sin JS, gracias, 404) | 56 vistas sin scroll horizontal, una sola H1, sin imágenes rotas ni sin alt, sin errores de consola, sin texto en español en `/en/` |
| Teclado (home) | 79 paradas con Tab: todas con foco visible (anillo, marcas de corte o filete del campo) y ninguna tapada por la nav |
| Motion | 38/38 (`docs/motion-cumplimiento.md`) |
| JS del cliente | 14,2 kB gzip en total (presupuesto: 50 kB en la home) |
| Formulario | Probado en la Fase 6: con JS (éxito, error de red, validación) y sin JS (confirmación, errores, 303 a gracias) |

## Notas

- **LCP de los casos (2,5–2,6 s en la simulación de 4G lento).** El LCP es la imagen de portada; en una medición real, sus fases suman unos 130 ms. La diferencia sale de que `astro preview` no comprime: el HTML viaja en ~160 kB contra ~27 kB con gzip/brotli. En Vercel, con compresión, tendría que bajar de 2,5 s: **verificar en el deploy de preview**.
- **CSS incrustado** en cada página (`build.inlineStylesheets: 'always'`): sacó ~550 ms de CSS que bloqueaba el render y subió el rendimiento de 95 a 96–97.
- **Lo que no se puede probar acá:** lectores de pantalla reales (NVDA/VoiceOver), iOS y Android reales (movimiento reducido, swipe, safe areas) y el envío con Resend. Van al checklist de lanzamiento (QA sobre la URL de preview).

## Revisiones con skills (Fase 8)

- **design-critique:** aplicado "texto del caso alineado arriba". Quedan como propuestas para Franco: que asome trabajo en el primer viewport de desktop (regla original del PRD; hoy el hero es solo texto, D9) y el botón CV compacto en la nav.
- **accessibility-review:** sin hallazgos nuevos (Lighthouse 100 en las tres páginas, matriz de QA y recorrido de teclado). Las revisiones de las Fases 3, 5 y 6 ya están aplicadas.
- **code-review:** aplicado en cada fase con cambios de código grandes (Fases 3, 5 y 6; ver commits).
