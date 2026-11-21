// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// URL pública (canonical, hreflang, sitemap): SITE_URL si está definida (dominio propio);
// si no, el dominio de producción que Vercel expone en el build; en local, localhost.
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

export default defineConfig({
  site,
  // Páginas estáticas; solo `/` (redirección por idioma) y `/api/contacto` son server.
  output: 'static',
  // En Vercel se usa su adapter; en local, Node, para que `npm run preview` funcione
  // (el adapter de Vercel no soporta `astro preview`). Ver docs/decisiones.md.
  adapter: process.env.VERCEL ? vercel() : node({ mode: 'standalone' }),
  // Routing manual: las rutas /es/ y /en/ salen de src/pages/[lang]/ y `/` redirige por
  // cookie o Accept-Language (src/pages/index.astro). Con el routing automático, `astro dev`
  // devolvía 404 en toda ruta sin prefijo de idioma (/dev/*, robots.txt, /api/*). Ver T19.
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: 'manual',
  },
  integrations: [
    sitemap({
      // `/` solo redirige por idioma y /dev/ es interno: ninguno va al sitemap.
      filter: (page) => new URL(page).pathname !== '/' && !page.includes('/dev/'),
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-AR', en: 'en' },
      },
    }),
  ],
  // Formulario de contacto (backend.md). Todo opcional: sin RESEND_API_KEY el endpoint
  // funciona en modo local (no envía, loguea y responde 200).
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_TO_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_FROM_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Firma del token anti-spam. Obligatorio en producción (varias instancias).
      CONTACT_FORM_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  // El chequeo de origen de Astro compara contra la URL armada con SITE_URL y rechaza los
  // POST en local y en los deploys de preview. Lo reemplaza sameOrigin() de
  // src/lib/contact-form.ts, que compara contra el host real de la petición (T31).
  security: { checkOrigin: false },
  // CSS incrustado en cada página: sin peticiones que bloqueen el render (LCP, Fase 8).
  build: { inlineStylesheets: 'always' },
  // Scripts siempre como archivos (nunca incrustados): la CSP de vercel.json permite solo
  // 'self' más el hash del script de tema (scripts/check-csp.mjs lo verifica en el build).
  vite: { build: { assetsInlineLimit: 0 } },
  devToolbar: { enabled: false },
});
