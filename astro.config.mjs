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
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
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
