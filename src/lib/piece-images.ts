// Resuelve el `src` de cada slide (nombre de archivo, PRD §7) a la imagen importada
// de src/assets/trabajos/<caso>/, para usarla con <Image>/<Picture> de astro:assets.
// Si un archivo no existe, el build falla con un mensaje claro.
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/trabajos/*/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

export function pieceImage(caso: string, src: string): ImageMetadata {
  const match = files[`/src/assets/trabajos/${caso}/${src}`];
  if (!match) {
    throw new Error(`Falta la imagen src/assets/trabajos/${caso}/${src} (revisá ${caso}.json)`);
  }
  return match.default;
}
