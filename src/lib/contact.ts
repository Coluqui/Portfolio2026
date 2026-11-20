// Datos de contacto públicos. Mientras falten, los componentes muestran un
// `TODO(contenido)` visible (ver docs/pendientes-contenido.md). Nunca se inventan.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Lang } from '../i18n/utils';

export interface ContactData {
  email: string | null;
  linkedin: string | null;
  /** Número en formato internacional sin "+" ni espacios (wa.me). */
  whatsapp: string | null;
}

export const contact: ContactData = {
  email: null,
  linkedin: null,
  whatsapp: null,
};

export const TODO_EMAIL = 'TODO(contenido): mail público';

/** CV del idioma activo; si esa versión no existe, la que haya (backend.md). */
export function cvHref(lang: Lang): string {
  const file = (l: Lang) => `cv/franco-colucci-cv-${l}.pdf`;
  if (existsSync(join(process.cwd(), 'public', file(lang)))) return `/${file(lang)}`;
  return `/${file('es')}`;
}
