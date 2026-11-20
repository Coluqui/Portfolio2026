// M05 · Chips de filtro: el fondo de tinta viaja al chip activo (traslada y escala en X).
// Dispara `filterchange` ({ detail: { id } }) en el contenedor para que la grilla filtre
// (M06, Fase 4) y actualiza el texto de aria-live con la cantidad.

export interface FilterChangeDetail {
  id: string;
  count: number;
}

let controller: AbortController | null = null;

function place(root: HTMLElement, chip: HTMLElement, indicator: HTMLElement): void {
  const scale = chip.offsetWidth / indicator.offsetWidth;
  indicator.style.transform = `translate(${chip.offsetLeft}px, ${chip.offsetTop}px) scaleX(${scale})`;
  root.dataset.enhanced = '';
}

export function initFilterChips(): void {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  document.querySelectorAll<HTMLElement>('[data-filters]').forEach((root) => {
    const indicator = root.querySelector<HTMLElement>('[data-filter-indicator]');
    const status = root.querySelector<HTMLElement>('[data-filter-status]');
    const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
    if (!indicator || chips.length === 0) return;

    const active = () => chips.find((c) => c.getAttribute('aria-pressed') === 'true') ?? chips[0];

    // Posición inicial sin animar.
    root.dataset.instant = '';
    const first = active();
    if (first) place(root, first, indicator);
    requestAnimationFrame(() => delete root.dataset.instant);

    chips.forEach((chip) =>
      chip.addEventListener(
        'click',
        () => {
          if (chip.getAttribute('aria-pressed') === 'true') return;
          chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
          place(root, chip, indicator);
          const count = Number(chip.querySelector('.chip__count')?.textContent ?? 0);
          if (status) {
            const template =
              count === 1 ? status.dataset.templateOne : (status.dataset.template ?? '');
            status.textContent = (template ?? '').replace('{n}', String(count));
          }
          root.dispatchEvent(
            new CustomEvent<FilterChangeDetail>('filterchange', {
              detail: { id: chip.dataset.filter ?? '', count },
              bubbles: true,
            }),
          );
        },
        { signal },
      ),
    );

    // Si cambia el ancho (wrap de chips), se reacomoda sin animar.
    const observer = new ResizeObserver(() => {
      const current = active();
      if (!current) return;
      root.dataset.instant = '';
      place(root, current, indicator);
      requestAnimationFrame(() => delete root.dataset.instant);
    });
    observer.observe(root);
    signal.addEventListener('abort', () => observer.disconnect());
  });

  document.addEventListener('astro:before-swap', () => controller?.abort(), { once: true, signal });
}
