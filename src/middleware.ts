// Requerido por `i18n.routing: 'manual'` (astro.config.mjs). No reescribe ni redirige nada:
// el idioma lo definen las rutas src/pages/[lang]/ y la redirección de `/` (pages/index.astro).
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((_context, next) => next());
