// M23 · Cambio de modo. Sin atributo, el sitio sigue al sistema (tokens.css); al tocar el
// toggle se fija el modo opuesto al que se ve y se guarda. Fundido cruzado de toda la
// página con View Transitions (300 ms, in-out); sin soporte o con movimiento reducido,
// cambio instantáneo (versión reducida de M23).

type Theme = 'light' | 'dark';

let controller: AbortController | null = null;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function currentTheme(): Theme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function save(theme: Theme): void {
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Sin storage (modo privado): el cambio vale solo para esta visita.
  }
}

/** theme-color del navegador: con modo forzado, los dos metas toman --color-bg del modo
 *  activo; siguiendo al sistema, vuelven a sus valores con media query (Base.astro). */
function syncThemeColor(): void {
  const forced = document.documentElement.dataset.theme;
  const color = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.dataset.media ??= meta.media;
    meta.dataset.content ??= meta.content;
    if (forced && color) {
      meta.content = color;
      meta.removeAttribute('media');
    } else {
      meta.media = meta.dataset.media;
      meta.content = meta.dataset.content;
    }
  });
}

function sync(): void {
  const isDark = currentTheme() === 'dark';
  document
    .querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')
    .forEach((button) => button.setAttribute('aria-checked', String(isDark)));
  syncThemeColor();
}

function apply(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  save(theme);
  sync();
}

function toggle(): void {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
  if (!document.startViewTransition || reducedMotion()) {
    apply(next);
    return;
  }
  // El atributo limita las reglas ::view-transition de base.css a este cambio
  // (las navegaciones del ClientRouter usan sus propias animaciones).
  const root = document.documentElement;
  root.dataset.themeSwitch = '';
  const transition = document.startViewTransition(() => apply(next));
  transition.finished.finally(() => delete root.dataset.themeSwitch);
}

export function initThemeToggle(): void {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  sync();
  document
    .querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')
    .forEach((button) => button.addEventListener('click', toggle, { signal }));

  // Si sigue al sistema y el sistema cambia, el estado anunciado se actualiza.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', sync, { signal });
  document.addEventListener('astro:before-swap', () => controller?.abort(), { once: true, signal });
}
