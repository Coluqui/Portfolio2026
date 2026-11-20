// Nav: M20 sección activa · M21 borde al scrollear · M22 menú mobile.

let controller: AbortController | null = null;

const SCROLL_THRESHOLD = 8; // px, M21

/** M21: borde y sombra cuando la página bajó más de 8 px. */
function initScrolled(header: HTMLElement, signal: AbortSignal): void {
  let ticking = false;
  const update = () => {
    header.toggleAttribute('data-scrolled', window.scrollY > SCROLL_THRESHOLD);
    ticking = false;
  };
  update();
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true, signal },
  );
}

/** M20: marca el link de la sección visible y mueve el filete bajo su número. */
function initActiveSection(nav: HTMLElement, signal: AbortSignal): void {
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')];
  const indicator = nav.querySelector<HTMLElement>('[data-nav-indicator]');
  const sections = links
    .map((link) => document.getElementById(link.dataset.navLink ?? ''))
    .filter((el): el is HTMLElement => el !== null);
  if (!indicator || sections.length === 0) return;

  const moveTo = (id: string | null) => {
    links.forEach((link) =>
      link.dataset.navLink === id
        ? link.setAttribute('aria-current', 'true')
        : link.removeAttribute('aria-current'),
    );
    const active = links.find((link) => link.dataset.navLink === id);
    const num = active?.querySelector<HTMLElement>('.num');
    if (!active || !num) {
      indicator.removeAttribute('data-visible');
      return;
    }
    // Debajo de 1280 px la nav está oculta: no hay nada que medir.
    if (indicator.offsetWidth === 0) return;
    const navBox = nav.getBoundingClientRect();
    const box = num.getBoundingClientRect();
    const scale = box.width / indicator.offsetWidth;
    indicator.style.transform = `translateX(${box.left - navBox.left}px) scaleX(${scale})`;
    indicator.setAttribute('data-visible', '');
  };

  // La sección activa es la que cruza una línea a un tercio de la pantalla.
  const visible = new Map<string, boolean>();
  const update = () => moveTo(sections.find((section) => visible.get(section.id))?.id ?? null);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting));
      update();
    },
    { rootMargin: '-33% 0px -66% 0px' },
  );
  sections.forEach((section) => observer.observe(section));
  // Al cambiar el ancho (p. ej. cruzar 1280 px) se vuelve a medir.
  const resize = new ResizeObserver(update);
  resize.observe(nav);
  signal.addEventListener('abort', () => {
    observer.disconnect();
    resize.disconnect();
  });
}

/** M22: menú mobile. Disclosure con ESC, clic afuera y cierre al elegir un link. */
function initMenu(header: HTMLElement, signal: AbortSignal): void {
  const button = header.querySelector<HTMLButtonElement>('[data-menu-button]');
  const menu = header.querySelector<HTMLElement>('[data-menu]');
  if (!button || !menu) return;
  const labelOpen = button.querySelector<HTMLElement>('[data-menu-label-open]');
  const labelClose = button.querySelector<HTMLElement>('[data-menu-label-close]');

  const setOpen = (open: boolean, restoreFocus = false) => {
    button.setAttribute('aria-expanded', String(open));
    menu.dataset.open = String(open);
    if (labelOpen) labelOpen.hidden = open;
    if (labelClose) labelClose.hidden = !open;
    // Al frame siguiente: la hoja recién deja de estar `visibility: hidden` y ya acepta foco.
    if (open)
      requestAnimationFrame(() =>
        menu.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true }),
      );
    else if (restoreFocus) button.focus();
  };

  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'), {
    signal,
  });
  menu
    .querySelectorAll('[data-menu-link]')
    .forEach((link) => link.addEventListener('click', () => setOpen(false), { signal }));
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && menu.dataset.open === 'true') setOpen(false, true);
    },
    { signal },
  );
  document.addEventListener(
    'click',
    (event) => {
      if (menu.dataset.open === 'true' && !header.contains(event.target as Node)) setOpen(false);
    },
    { signal },
  );
  // Si el foco sale del header (Tab después del último control), se cierra: lo que queda
  // debajo de la hoja no puede recibir foco tapado (WCAG 2.4.11).
  header.addEventListener(
    'focusout',
    (event) => {
      const next = event.relatedTarget as Node | null;
      if (menu.dataset.open === 'true' && next && !header.contains(next)) setOpen(false);
    },
    { signal },
  );
  // Si se agranda la ventana a desktop con el menú abierto, se cierra.
  window
    .matchMedia('(min-width: 80rem)')
    .addEventListener('change', (e) => e.matches && setOpen(false), { signal });
}

export function initNav(): void {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) return;
  initScrolled(header, signal);
  const nav = header.querySelector<HTMLElement>('[data-nav]');
  if (nav) initActiveSection(nav, signal);
  initMenu(header, signal);

  document.addEventListener('astro:before-swap', () => controller?.abort(), { once: true, signal });
}
