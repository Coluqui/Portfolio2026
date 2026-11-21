// M28 · Acordeón de "Qué hago" (solo mobile). Con JS arranca cerrado; sin JS, todo abierto.

let controller: AbortController | null = null;

export function initAccordion(): void {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  document.querySelectorAll<HTMLElement>('[data-accordion]').forEach((root) => {
    const items = [...root.querySelectorAll<HTMLElement>('[data-accordion-item]')];
    items.forEach((item) => {
      const button = item.querySelector<HTMLButtonElement>('[data-accordion-button]');
      if (!button) return;
      item.dataset.open = 'false';
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener(
        'click',
        () => {
          const open = item.dataset.open !== 'true';
          item.dataset.open = String(open);
          button.setAttribute('aria-expanded', String(open));
        },
        { signal },
      );
    });
    root.dataset.enhanced = '';
  });

  document.addEventListener('astro:before-swap', () => controller?.abort(), { once: true, signal });
}
