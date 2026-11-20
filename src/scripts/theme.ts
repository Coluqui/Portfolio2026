// Toggle de tema. Sin atributo, el sitio sigue al sistema (tokens.css);
// al tocar el toggle se fija el modo opuesto al que se ve y se guarda.

type Theme = 'light' | 'dark';

let controller: AbortController | null = null;

function currentTheme(): Theme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function save(theme: Theme): void {
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Sin storage (modo privado): el cambio vale solo para esta página.
  }
}

function sync(buttons: NodeListOf<HTMLButtonElement>): void {
  const isDark = currentTheme() === 'dark';
  buttons.forEach((button) => button.setAttribute('aria-pressed', String(isDark)));
}

export function initThemeToggle(): void {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');
  if (buttons.length === 0) return;
  sync(buttons);

  buttons.forEach((button) =>
    button.addEventListener(
      'click',
      () => {
        const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        save(next);
        sync(buttons);
      },
      { signal },
    ),
  );

  // Si sigue al sistema y el sistema cambia, el estado anunciado se actualiza.
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => sync(buttons), { signal });

  document.addEventListener('astro:before-swap', () => controller?.abort(), { once: true, signal });
}
