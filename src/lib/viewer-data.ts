// Datos del visor de una página de caso: piezas, slides con srcset AVIF/WebP y textos.
// Se serializan en JSON dentro de la página; el visor carga solo el slide actual y precarga
// el siguiente (PRD §5, performance).
import type { CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import { type Lang, useTranslations } from '../i18n/utils';
import { pieceImage } from './piece-images';

type Caso = CollectionEntry<'casos'>['data'];

export type FrameKind = 'phone' | 'browser' | 'paper';

export interface ViewerSlide {
  avif: string;
  webp: string;
  /** WebP más grande: fallback y link sin JS. */
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface ViewerPiece {
  slug: string;
  cliente: string;
  formato: string;
  titulo: string;
  frame: FrameKind;
  slides: ViewerSlide[];
}

export interface ViewerData {
  pieces: ViewerPiece[];
  labels: Record<
    | 'piece'
    | 'slide'
    | 'slideAnnounce'
    | 'close'
    | 'prevPiece'
    | 'nextPiece'
    | 'prevSlide'
    | 'nextSlide'
    | 'nextPanel'
    | 'slideRole',
    string
  >;
}

const WIDTHS = [720, 1080, 1440];

/** Marco de contexto por formato: redes y ads en teléfono, web en navegador, el resto en papel. */
export function frameFor(formato: string): FrameKind {
  if (['carrusel', 'posteo', 'story', 'reel', 'ad'].includes(formato)) return 'phone';
  if (['banner', 'web', 'mail'].includes(formato)) return 'browser';
  return 'paper';
}

async function slideImages(caso: string, src: string) {
  const image = pieceImage(caso, src);
  // Anchos del srcset que no superan el original; si es más chico que todos, su propio ancho.
  const fitting = WIDTHS.filter((w) => w <= image.width);
  const widths = fitting.length > 0 ? fitting : [image.width];
  const [avif, webp] = await Promise.all(
    (['avif', 'webp'] as const).map((format) => getImage({ src: image, widths, format })),
  );
  return {
    avif: avif?.srcSet.attribute ?? '',
    webp: webp?.srcSet.attribute ?? '',
    src: webp?.src ?? image.src,
    width: image.width,
    height: image.height,
  };
}

export async function buildViewerData(caso: Caso, lang: Lang): Promise<ViewerData> {
  const t = useTranslations(lang);
  const pieces = await Promise.all(
    caso.piezas.map(async (pieza) => ({
      slug: pieza.slug,
      cliente: caso.cliente,
      formato: t(`formats.${pieza.formato}`),
      titulo: pieza.titulo[lang],
      frame: frameFor(pieza.formato),
      slides: await Promise.all(
        pieza.slides.map(async (slide) => ({
          ...(await slideImages(caso.slug, slide.src)),
          alt: slide.alt[lang],
        })),
      ),
    })),
  );
  return {
    pieces,
    labels: {
      piece: t('viewer.piece'),
      slide: t('viewer.slide'),
      slideAnnounce: t('viewer.slideAnnounce'),
      close: t('viewer.close'),
      prevPiece: t('viewer.prevPiece'),
      nextPiece: t('viewer.nextPiece'),
      prevSlide: t('viewer.prevSlide'),
      nextSlide: t('viewer.nextSlide'),
      nextPanel: t('viewer.nextPanel'),
      slideRole: t('viewer.slideRole'),
    },
  };
}
