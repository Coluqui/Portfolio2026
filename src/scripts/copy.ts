// M34 · Copiar mail. Feedback en el mismo botón ("Copiado ✓") durante --hold-feedback.
import { tokenMs, wait } from './motion';

let controller: AbortController | null = null;

export function initCopyEmail(): void {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  document.querySelectorAll<HTMLElement>('[data-copy-email]').forEach((root) => {
    const button = root.querySelector<HTMLButtonElement>('button');
    const status = root.querySelector('[data-copy-status]');
    const fallback = root.querySelector<HTMLElement>('[data-copy-fallback]');
    const announce = root.querySelector('[data-copied-announce]')?.textContent?.trim() ?? '';
    const email = root.dataset.copyEmail ?? '';
    if (!button || button.dataset.force) return;

    button.addEventListener(
      'click',
      async () => {
        if (root.dataset.state === 'done') return;
        try {
          await navigator.clipboard.writeText(email);
        } catch {
          root.dataset.state = 'failed';
          if (fallback) fallback.hidden = false;
          return;
        }
        if (fallback) fallback.hidden = true;
        root.dataset.state = 'done';
        if (status) status.textContent = announce;
        await wait(tokenMs('--hold-feedback'), signal);
        if (signal.aborted) return;
        root.dataset.state = 'idle';
        if (status) status.textContent = '';
      },
      { signal },
    );
  });

  document.addEventListener('astro:before-swap', () => controller?.abort(), { once: true, signal });
}
