import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Texto en los dos idiomas. Los textos pendientes llevan `TODO(contenido): …` (PRD, CLAUDE.md). */
const i18nText = z.object({ es: z.string().min(1), en: z.string().min(1) });

/** Formatos de pieza (etiqueta mono `cliente · formato`). Ver docs/inventario.md. */
export const formatos = [
  'carrusel',
  'posteo',
  'story',
  'reel',
  'ad',
  'mail',
  'ebook',
  'one-pager',
  'banner',
  'web',
  'portadas',
  'mockup',
  'identidad',
] as const;

/** Cada valor corresponde a un token `--ratio-<valor>` de tokens.css. */
export const ratios = [
  'carousel',
  'reel',
  'square',
  'mail-header',
  'ebook',
  'ad-mrec',
  'ad-leaderboard',
  'web',
  'a4',
  'landing',
] as const;

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug en minúsculas con guiones');

/** Un slide: imagen (o video en reels) con alt propio en ES y EN. `src` es el nombre del
 *  archivo dentro de src/assets/trabajos/<caso>/ (PRD §7). */
const slide = z.object({
  src: z.string().regex(/^[a-z0-9-]+\.(jpg|png|webp|avif|mp4)$/, 'nombre de archivo del PRD'),
  alt: i18nText,
  poster: z.string().optional(),
});

/** Una pieza. Un carrusel es UNA pieza con varios slides; una pieza simple tiene un solo slide. */
const pieza = z.object({
  slug,
  formato: z.enum(formatos),
  ratio: z.enum(ratios),
  titulo: i18nText,
  objetivo: i18nText.optional(),
  metrica: z.object({ valor: z.string().min(1), etiqueta: i18nText }).optional(),
  slides: z.array(slide).min(1),
});

const metrica = z.object({ valor: z.string().min(1), etiqueta: i18nText });

const casos = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/casos' }),
  schema: z
    .object({
      slug,
      cliente: z.string().min(1),
      /** Orden en Trabajos y para "Siguiente caso". */
      orden: z.number().int().positive(),
      titulo: i18nText,
      rol: i18nText,
      contexto: i18nText,
      desafio: i18nText,
      solucion: i18nText,
      resultado: i18nText,
      metricas: z.array(metrica).max(4),
      entregables: z.array(i18nText),
      /** Slug de la pieza que hace de portada (tarjeta y hero del caso). */
      portada: slug.optional(),
      /** Slug del carrusel que se muestra además como tira de contactos (una vez por caso). */
      destacado: slug.optional(),
      /** Mejores piezas del caso, en orden: las que muestra la home en 01 Trabajos. */
      destacadas: z.array(slug).min(1).max(4),
      piezas: z.array(pieza).min(1),
    })
    .superRefine((caso, ctx) => {
      const slugs = caso.piezas.map((p) => p.slug);
      slugs.forEach((s, i) => {
        if (slugs.indexOf(s) !== i)
          ctx.addIssue({ code: 'custom', message: `pieza repetida: ${s}`, path: ['piezas', i] });
      });
      caso.destacadas.forEach((value, i) => {
        if (!slugs.includes(value))
          ctx.addIssue({
            code: 'custom',
            message: `destacadas: "${value}" no es una pieza`,
            path: ['destacadas', i],
          });
      });
      for (const key of ['portada', 'destacado'] as const) {
        const value = caso[key];
        if (value && !slugs.includes(value))
          ctx.addIssue({
            code: 'custom',
            message: `${key} "${value}" no es una pieza`,
            path: [key],
          });
      }
      const destacado = caso.piezas.find((p) => p.slug === caso.destacado);
      if (destacado && destacado.slides.length < 2)
        ctx.addIssue({
          code: 'custom',
          message: 'destacado tiene que ser un carrusel',
          path: ['destacado'],
        });
    }),
});

export const collections = { casos };
