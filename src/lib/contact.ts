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

// Mismos datos que publica el sitio actual y el CV (21 nov 2026).
export const contact: ContactData = {
  email: 'fcoluccidg@gmail.com',
  linkedin: 'https://www.linkedin.com/in/francocolucci93/',
  whatsapp: '5492615581727',
};

/** Número legible para mostrar junto al link de WhatsApp. */
export const whatsappDisplay = '+54 261 558 1727';

export const TODO_EMAIL = 'TODO(contenido): mail público';

/** CV del idioma activo; si esa versión no existe, la que haya (backend.md). */
export function cvHref(lang: Lang): string {
  const file = (l: Lang) => `cv/franco-colucci-cv-${l}.pdf`;
  if (existsSync(join(process.cwd(), 'public', file(lang)))) return `/${file(lang)}`;
  return `/${file('es')}`;
}
