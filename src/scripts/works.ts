// M06 · Filtro de la grilla de trabajos con FLIP (Web Animations API).
// 1. Las piezas que salen se desvanecen (--duration-fast, in).
// 2. Las que quedan viajan a su nueva posición (--duration-base, in-out).
// 3. Las que entran aparecen con stagger (--stagger-fast).
// Interrumpible: un clic nuevo cancela lo que esté corriendo. Reducido: fundido de la grilla.
import type { FilterChangeDetail } from './filters';
import { tokenMs } from './motion';

let controller: AbortController | null = null;
let running: Animation[] = [];
let generation = 0;

const css = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'ease';
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function cancelRunning(): void {
  running.forEach((animation) => animation.cancel());
  running = [];
}

function settle(root: HTMLElement, items: HTMLElement[], matches: (el: HTMLElement) => boolean) {
  items.forEach((el) => (el.hidden = !matches(el)));
  root.querySelectorAll<HTMLElement>('[data-company]').forEach((company) => {
    company.hidden = !company.querySelector('[data-work-item]:not([hidden])');
  });
  const empty = root.querySelector<HTMLElement>('[data-work-empty]');
  if (empty) empty.hidden = items.some((el) => !el.hidden);
}

async function applyFilter(root: HTMLElement, id: string): Promise<void> {
  const current = ++generation;
  cancelRunning();

  const items = [...root.querySelectorAll<HTMLElement>('[data-work-item]')];
  const matches = (el: HTMLElement) => id === 'todo' || el.dataset.familia === id;

  if (reducedMotion()) {
    settle(root, items, matches);
    running.push(
      root.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: tokenMs('--duration-base'),
        easing: css('--ease-out'),
      }),
    );
    return;
  }

  const leaving = items.filter((el) => !el.hidden && !matches(el));
  const entering = items.filter((el) => el.hidden && matches(el));
  const staying = items.filter((el) => !el.hidden && matches(el));

  // 1 · salida
  const out = leaving.map((el) =>
    el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: tokenMs('--duration-fast'),
      easing: css('--ease-in'),
      fill: 'forwards',
    }),
  );
  running.push(...out);
  try {
    await Promise.all(out.map((animation) => animation.finished));
  } catch {
    return; // cancelado por un filtro nuevo
  }
  if (current !== generation) return;

  // 2 · FLIP de las que quedan
  const first = new Map(staying.map((el) => [el, el.getBoundingClientRect()]));
  out.forEach((animation) => animation.cancel());
  settle(root, items, matches);

  staying.forEach((el) => {
    const before = first.get(el);
    if (!before) return;
    const after = el.getBoundingClientRect();
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    if (dx === 0 && dy === 0) return;
    running.push(
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], {
        duration: tokenMs('--duration-base'),
        easing: css('--ease-in-out'),
      }),
    );
  });

  // 3 · entrada con stagger (máx. 6 pasos)
  const maxSteps = Number(css('--stagger-max-items')) || 6;
  entering.forEach((el, i) => {
    running.push(
      el.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: tokenMs('--duration-base'),
        delay: Math.min(i, maxSteps - 1) * tokenMs('--stagger-fast'),
        easing: css('--ease-out'),
        fill: 'backwards',
      }),
    );
  });
}

/** Flujo 2 (PRD §6): los links a los casos llevan el filtro activo (?filtro=<id>). */
function syncCaseLinks(root: HTMLElement, id: string): void {
  root.querySelectorAll<HTMLAnchorElement>('[data-case-link]').forEach((link) => {
    const url = new URL(link.href);
    if (id === 'todo') url.searchParams.delete('filtro');
    else url.searchParams.set('filtro', id);
    link.href = url.pathname + url.search + url.hash;
  });
}

export function initWorkFilters(): void {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  const initial = new URL(location.href).searchParams.get('filtro');

  document.querySelectorAll<HTMLElement>('[data-work]').forEach((root) => {
    const section = root.closest('section');
    if (!section) return;

    section.addEventListener(
      'filterchange',
      (event) => {
        const { id } = (event as CustomEvent<FilterChangeDetail>).detail;
        syncCaseLinks(root, id);
        void applyFilter(root, id);
      },
      { signal },
    );

    // Llega con ?filtro=<id>: se activa ese chip (sin animar, antes de que se vea).
    if (initial) {
      const chip = section.querySelector<HTMLButtonElement>(
        `[data-filter="${CSS.escape(initial)}"]`,
      );
      if (chip && chip.getAttribute('aria-pressed') !== 'true') {
        const items = [...root.querySelectorAll<HTMLElement>('[data-work-item]')];
        settle(root, items, (el) => el.dataset.familia === initial);
        // Al frame siguiente: los chips (FilterChips) ya registraron sus listeners.
        requestAnimationFrame(() => chip.click());
      }
    }
  });

  document.addEventListener(
    'astro:before-swap',
    () => {
      cancelRunning();
      controller?.abort();
    },
    { once: true, signal },
  );
}
