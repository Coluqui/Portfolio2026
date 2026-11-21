// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// URL pública: se define en el deploy (SITE_URL). En local, localhost.
const site = process.env.SITE_URL ?? 'http://localhost:4321';

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
  devToolbar: { enabled: false },
});
