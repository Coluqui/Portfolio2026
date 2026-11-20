// M24 · Cambio de idioma. Mueve el subrayado al idioma elegido, guarda la preferencia
// en una cookie (la lee `/` en la próxima visita) y conserva la sección actual (hash).

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
        if (!lang) return;
        document.cookie = `lang=${lang}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
        if (location.hash) link.hash = location.hash;
        const nav = link.closest<HTMLElement>('[data-lang-switch]');
        if (nav) nav.dataset.active = lang;
      },
      { signal },
    ),
  );

  document.addEventListener('astro:before-swap', () => controller?.abort(), { once: true, signal });
}
