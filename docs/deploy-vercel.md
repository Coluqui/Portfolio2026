# Deploy en Vercel

El repo está listo: `@astrojs/vercel` se activa solo en Vercel, `vercel.json` trae los headers de seguridad y el build falla si la CSP queda desactualizada (`scripts/check-csp.mjs`).

## 1 · Importar el proyecto (una vez)

1. En vercel.com → **Add New… → Project** → importá `Coluqui/Portfolio2026`.
2. **Framework Preset:** Astro (lo detecta solo). Build command `npm run build`, output lo maneja el adapter. No cambies nada más.
3. **Production Branch:** `main` (Settings → Git). Cada push a `develop` o a una rama de trabajo genera un **deploy de preview** con su propia URL.

## 2 · Variables de entorno (Settings → Environment Variables)

| Variable | Valor | Entornos |
| --- | --- | --- |
| `CONTACT_FORM_SECRET` | Un texto largo y aleatorio (por ejemplo, 64 caracteres). **Obligatoria** | Production y Preview |
| `RESEND_API_KEY` | La API key de Resend | Production (y Preview si querés recibir mails de prueba) |
| `CONTACT_TO_EMAIL` | El mail donde recibís los mensajes | Production / Preview |
| `CONTACT_FROM_EMAIL` | Remitente verificado en Resend (p. ej. `Portfolio <hola@tudominio.com>`) | Production / Preview |
| `SITE_URL` | Solo si usás dominio propio (`https://tudominio.com`). Si no, se usa el dominio de Vercel | Production |

Sin las tres de Resend, el formulario funciona en **modo local**: no envía y deja el mensaje en los logs de la función. Sirve para probar el preview.

> La clave de Resend que hoy está en las variables de tu Windows **no es válida** (Resend respondió 401). Generá una nueva en resend.com y cargala solo en Vercel. Después borrá las variables `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` y `SITE_URL` de tu Windows, así `npm run dev` queda en modo local.

## 3 · Analítica

Settings → **Analytics → Enable** (Web Analytics, sin cookies). El sitio ya manda las páginas vistas y estos eventos: `cv_download`, `contact_submit`, `contact_link` (mail, linkedin, whatsapp), `case_open` y `viewer_open`.

## 4 · Antes de publicar (QA sobre la URL de preview)

- [ ] Home y un caso en Lighthouse mobile (PageSpeed Insights con la URL de preview): rendimiento ≥ 90; LCP < 2,5 s ya con compresión.
- [ ] Formulario: un envío real que llegue a tu mail; un error de validación; el envío sin JS (desactivá JS en el navegador).
- [ ] CV en ES y EN se descargan con el idioma correcto.
- [ ] `/` redirige a `/es/` o `/en/` según el idioma del navegador.
- [ ] Celular real (iPhone y Android): visor con swipe, barra inferior con safe area, movimiento reducido activado.
- [ ] Headers: en securityheaders.com con la URL de preview (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy).
- [ ] La barra de comentarios de Vercel (vercel.live) no aparece en los previews porque la CSP la bloquea. Es esperado.

## 5 · Publicar

Pull request de `develop` a `main` → merge → Vercel despliega producción.
