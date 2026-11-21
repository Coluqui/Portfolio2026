// Curaduría de la home. Las piezas se referencian por caso y slug; el build falla si alguna
// no existe (ver resolvePieces).
import type { CollectionEntry } from 'astro:content';

type Caso = CollectionEntry<'casos'>;
export type Pieza = Caso['data']['piezas'][number];

export interface PieceRef {
  caso: string;
  slug: string;
}

/** Mosaico del hero: 6 lugares, uno por formato (un carrusel = un lugar). Orden de lectura. */
export const mosaic: PieceRef[] = [
  { caso: 'iscamen', slug: 'bioinsumos' },
  { caso: 'moondesk', slug: 'nacimos-de-un-error' },
  { caso: 'carpa', slug: 'metodo-carpa' },
  { caso: 'condimento', slug: 'trafico-sin-ventas' },
  { caso: 'iscamen', slug: 'mujer-en-la-ciencia' },
  { caso: 'moondesk', slug: 'errores-packaging' },
];

/** "Trabajé con" (PRD §3). Texto hasta tener los logos en SVG monocromo. */
export const clients = ['ISCAMEN', 'MoonDesk', 'Carpa', 'Condimento', 'RLB', 'Interlink'];

export interface ResolvedPiece {
  caso: string;
  cliente: string;
  pieza: Pieza;
}

export function resolvePieces(casos: Caso[], refs: PieceRef[]): ResolvedPiece[] {
  return refs.map(({ caso, slug }) => {
    const entry = casos.find((c) => c.data.slug === caso);
    const pieza = entry?.data.piezas.find((p) => p.slug === slug);
    if (!entry || !pieza) throw new Error(`home: no existe la pieza ${caso}/${slug}`);
    return { caso, cliente: entry.data.cliente, pieza };
  });
}

/** Link a una pieza dentro de su caso (el visor de la Fase 5 lo abrirá con ?pieza=). */
export function pieceHref(lang: string, caso: string, slug: string): string {
  return `/${lang}/trabajos/${caso}/#${slug}`;
}
