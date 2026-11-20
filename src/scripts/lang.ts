// Guarda el idioma elegido en una cookie para que `/` redirija ahí en la próxima visita,
// y conserva la sección actual (hash) al cambiar de idioma.

const ONE_YEAR = 60 * 60 * 24 * 365;

let controller: AbortController | null = null;

export function initLangSwitch(): void {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  document.querySelectorAll<HTMLAnchorElement>('[data-lang-link]').forEach((link) =>
    link.addEventListener(
      'click',
      () => {
        const lang = link.dataset.langLink;
        if (lang) document.cookie = `lang=${lang}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
        if (location.hash) link.hash = location.hash;
      },
      { signal },
    ),
  );

  document.addEventListener('astro:before-swap', () => controller?.abort(), { once: true, signal });
}
