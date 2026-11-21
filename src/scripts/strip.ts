// M29 · Flechas de la tira de contactos: avanzan una "página" de slides con scrollBy.
let controller: AbortController | null = null;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initStrip(): void {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  document.querySelectorAll<HTMLElement>('[data-strip]').forEach((wrap) => {
    const trackEl = wrap.querySelector<HTMLElement>('[data-strip-track]');
    if (!trackEl) return;
    const step = (dir: number) =>
      trackEl.scrollBy({
        left: dir * trackEl.clientWidth * 0.8,
        behavior: reducedMotion() ? 'instant' : 'smooth',
      });
    wrap.querySelector('[data-strip-prev]')?.addEventListener('click', () => step(-1), { signal });
    wrap.querySelector('[data-strip-next]')?.addEventListener('click', () => step(1), { signal });
  });

  document.addEventListener('astro:before-swap', () => controller?.abort(), { once: true, signal });
}
