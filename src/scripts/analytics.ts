// Vercel Web Analytics (sin cookies, sin banner; backend.md). Solo en producción.
// `inject()` agrega /_vercel/insights/script.js como archivo (mismo origen): la CSP de
// vercel.json no necesita cambios. Las páginas vistas, incluidas las navegaciones del
// ClientRouter, se registran solas.
// Eventos: cv_download (idioma) · contact_submit · contact_link (mail/linkedin/whatsapp) ·
// case_open (caso) · viewer_open (caso, pieza).
import { inject, track } from '@vercel/analytics';

type Props = Record<string, string | number | boolean>;

let ready = false;

export function trackEvent(name: string, props?: Props): void {
  if (!import.meta.env.PROD) return;
  try {
    track(name, props);
  } catch {
    // La analítica nunca rompe el sitio.
  }
}

function channelOf(link: HTMLAnchorElement): string | null {
  if (link.protocol === 'mailto:') return 'mail';
  if (link.hostname.endsWith('linkedin.com')) return 'linkedin';
  if (link.hostname === 'wa.me') return 'whatsapp';
  return null;
}

export function initAnalytics(): void {
  if (ready || !import.meta.env.PROD) return;
  ready = true;
  inject({ mode: 'production', framework: 'astro' });

  // contact_link: clics en mail, LinkedIn y WhatsApp en cualquier página.
  document.addEventListener('click', (event) => {
    const link = (event.target as Element).closest?.('a[href]');
    if (!(link instanceof HTMLAnchorElement)) return;
    const canal = channelOf(link);
    if (canal) trackEvent('contact_link', { canal });
  });

  // case_open: cada vez que se muestra una página de caso (también por ClientRouter).
  document.addEventListener('astro:page-load', () => {
    const match = location.pathname.match(/^\/(?:es|en)\/trabajos\/([^/]+)\/?$/);
    if (match?.[1]) trackEvent('case_open', { caso: match[1] });
  });
}
