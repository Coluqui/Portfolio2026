// Filtros por familia de formato (docs/inventario.md). Cada pieza cuenta 1, aunque sea un
// carrusel. Un filtro sin piezas no se muestra.
import type { CollectionEntry } from 'astro:content';
import type { FilterOption } from '../components/FilterChips.astro';
import type { formatos } from '../content.config';
import { type Lang, useTranslations } from '../i18n/utils';

type Formato = (typeof formatos)[number];
type Pieza = CollectionEntry<'casos'>['data']['piezas'][number];

export const familias = {
  redes: ['carrusel', 'posteo', 'story', 'reel'],
  ads: ['ad'],
  documentos: ['ebook', 'one-pager', 'mail'],
  lanzamientos: ['portadas', 'banner', 'mockup', 'web', 'identidad'],
} as const satisfies Record<string, readonly Formato[]>;

export type Familia = keyof typeof familias;

export function familiaDe(formato: Formato): Familia {
  const entry = Object.entries(familias).find(([, list]) =>
    (list as readonly Formato[]).includes(formato),
  );
  if (!entry) throw new Error(`Formato sin familia de filtro: ${formato}`);
  return entry[0] as Familia;
}

export function filterOptions(piezas: Pieza[], lang: Lang): FilterOption[] {
  const t = useTranslations(lang);
  const counts = Object.keys(familias).map((id) => ({
    id,
    label: t(`filters.${id as Familia}`),
    count: piezas.filter((p) => familiaDe(p.formato) === id).length,
  }));
  return [
    { id: 'todo', label: t('filters.all'), count: piezas.length },
    ...counts.filter((option) => option.count > 0),
  ];
}
