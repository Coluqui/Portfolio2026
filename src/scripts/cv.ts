// M33 · Descargar CV. La descarga la hace el navegador (link con `download`); esto solo
// muestra el feedback en el mismo botón: Descargando → CV ✓ (--hold-feedback) → vuelve.
import { tokenMs, wait } from './motion';

let controller: AbortController | null = null;

async function feedback(link: HTMLAnchorElement, status: Element | null, signal: AbortSignal) {
  link.dataset.state = 'downloading';
  await wait(tokenMs('--duration-slow') + tokenMs('--duration-base'), signal);
  if (signal.aborted) return;
  link.dataset.state = 'done';
  if (status) status.textContent = link.dataset.doneAnnounce ?? '';
  await wait(tokenMs('--hold-feedback'), signal);
  if (signal.aborted) return;
  link.dataset.state = 'idle';
  if (status) status.textContent = '';
}

export function initCvButtons(): void {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  document.querySelectorAll<HTMLAnchorElement>('[data-cv]').forEach((link) => {
    if (link.dataset.force) return; // demos de /dev/componentes
    const status = link.parentElement?.querySelector('[data-cv-status]') ?? null;
    link.addEventListener(
      'click',
      () => {
        if (link.dataset.state !== 'idle') return;
        void feedback(link, status, signal);
      },
      { signal },
    );
  });

  document.addEventListener('astro:before-swap', () => controller?.abort(), { once: true, signal });
}
