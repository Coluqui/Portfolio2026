# Reglas de back end

El sitio es estático. El único back end es el **formulario de contacto** en `src/pages/api/contacto.ts` (`export const prerender = false`), desplegado como función de Vercel con `@astrojs/vercel`.

## Formulario de contacto

- Envío de mail con **Resend** (plan gratuito). Destinatario y API key en variables de entorno.
- Campos: nombre, mail, mensaje (y empresa opcional). Validación con Zod **en el servidor**, aunque el cliente también valide.
- Límites: nombre ≤ 100, mail válido ≤ 254, mensaje 10–3000 caracteres. Rechazar HTML.
- Anti-spam sin captcha visible: campo honeypot oculto + tiempo mínimo de llenado (≥ 3 s, timestamp firmado) + rate limit simple por IP (en memoria; aceptable para el volumen esperado).
- Respuestas JSON con código HTTP correcto: `200 { ok: true }`, `400 { ok: false, errors: { campo: clave_i18n } }`, `429`, `500`. Los mensajes visibles salen de i18n, no del servidor.
- El cliente nunca pierde lo escrito ante un error (M39) y ofrece el mail como alternativa.
- Sin JS: el `<form>` hace POST normal y el endpoint redirige a `/<lang>/gracias` o vuelve con el error.
- **Modo local**: si falta `RESEND_API_KEY`, el endpoint no envía, loguea el payload en consola y responde `200`. Así se prueba todo el flujo sin credenciales.

## Secretos y configuración

- Variables: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`. Tipadas con `astro:env` (`envField`, `access: "secret"`, `context: "server"`).
- `.env` en `.gitignore` desde el primer commit. Crear `.env.example` con las claves vacías.
- Nunca imprimir secretos en logs, ni exponer el mail de destino en el cliente.

## Seguridad

- Headers en `vercel.json`: `Content-Security-Policy` (sin `unsafe-eval`; `unsafe-inline` solo si el script de tema lo exige, mejor con hash), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restrictiva, `frame-ancestors 'none'`.
- El endpoint acepta solo `POST` y `Content-Type` de formulario o JSON; verifica `Origin`.
- Escapar todo lo que el usuario escribe antes de meterlo en el mail.

## CV y archivos

- CV en `public/cv/franco-colucci-cv-es.pdf` y `-en.pdf`. El botón descarga el del idioma activo con `download` y nombre legible.
- Si falta una versión, el botón usa la que existe y queda anotado en `docs/pendientes-contenido.md`.

## Analítica

- Vercel Web Analytics (sin cookies, sin banner). Eventos: `cv_download` (con idioma), `contact_submit`, `contact_link` (mail/linkedin/whatsapp), `case_open`, `viewer_open`. Se activa recién en el deploy.

## Deploy (solo cuando lo pida)

1. `git init`, rama `main`, commits por fase.
2. Crear el repo en GitHub (privado hasta el lanzamiento) y hacer push.
3. Importar en Vercel, cargar las variables de entorno, deploy de preview.
4. QA sobre la URL de preview antes de reemplazar el sitio actual.
