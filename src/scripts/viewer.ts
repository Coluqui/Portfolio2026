// Visor de piezas (M13–M18). PRD §5 "un carrusel es una sola pieza".
//
// M13 abrir: FLIP desde el tile (500 ms, register), velo 300 ms, controles tras --delay-chrome.
// M14 cerrar: la pieza vuelve a su tile si está a la vista (300 ms, in-out); si no, fundido.
// M15 slides: pista con scroll-snap nativo; teclado y flechas con scrollTo; `scrollend`.
// M16 pieza siguiente: sale 8 px hacia arriba (200, in), entra 8 px desde abajo (300, register).
// M17 panel "Siguiente pieza →" al final de un carrusel (táctil): soltar ahí pasa de pieza.
// M18 segmentos que se llenan (CSS).
// Teclado: ← → slides (después del último, pieza siguiente; antes del primero, anterior),
// Re Pág / Av Pág saltan de pieza, ESC cierra. Arrastre vertical > 120 px cierra (táctil).
// URL: ?pieza=<slug>&slide=<n>. Foco atrapado con `inert` y devuelto al tile al cerrar.
// Interrumpible: cada acción cancela las animaciones en curso.
import type { ViewerData } from '../lib/viewer-data';
import { tokenMs } from './motion';

const CLOSE_DRAG = 120; // px (motion.md, constantes de gesto)
const DRAG_SLOP = 8; // px antes de decidir si el gesto es vertical

interface State {
  root: HTMLElement;
  data: ViewerData;
  piece: number;
  slide: number;
  opener: HTMLElement | null;
  animations: Animation[];
  inerted: HTMLElement[];
}

let state: State | null = null;
/** Cierre en curso (animando): si se reabre antes de que termine, se cancela. */
let closing: State | null = null;
let controller: AbortController | null = null;

const css = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'ease';
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = (n: number) => String(n).padStart(2, '0');
const fill = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));

function q<T extends HTMLElement>(root: HTMLElement, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`visor: falta ${selector}`);
  return el;
}

function cancelAnimations(s: State): void {
  s.animations.forEach((a) => a.cancel());
  s.animations = [];
}

function track(s: State, animation: Animation): Animation {
  s.animations.push(animation);
  return animation;
}

// ---------- Render ----------

function renderPiece(s: State): void {
  const piece = s.data.pieces[s.piece];
  if (!piece) return;
  const { root } = s;
  const first = piece.slides[0];
  const ratio = first ? first.width / first.height : 0.8;

  const frame = q(root, '[data-viewer-frame]');
  frame.dataset.kind = piece.frame;
  q(root, '[data-viewer-screen]').style.setProperty('--r', String(ratio));

  const trackEl = q(root, '[data-viewer-track]');
  trackEl.replaceChildren(
    ...piece.slides.map((_slide, i) => {
      const item = document.createElement('div');
      item.className = 'slide';
      item.setAttribute('role', 'group');
      item.setAttribute('aria-roledescription', s.data.labels.slideRole);
      item.setAttribute(
        'aria-label',
        fill(s.data.labels.slideAnnounce, { s: i + 1, n: piece.slides.length }),
      );
      item.dataset.index = String(i);
      return item;
    }),
  );

  // M17: panel final solo si hay pieza siguiente y es un carrusel.
  if (piece.slides.length > 1 && s.piece < s.data.pieces.length - 1) {
    const next = document.createElement('div');
    next.className = 'slide slide--next';
    next.setAttribute('aria-hidden', 'true');
    next.textContent = `${s.data.labels.nextPanel} →`;
    trackEl.append(next);
  }

  const segments = q(root, '[data-viewer-segments]');
  segments.replaceChildren(
    ...(piece.slides.length > 1
      ? piece.slides.map(() => {
          const li = document.createElement('li');
          li.append(document.createElement('span'));
          return li;
        })
      : []),
  );

  q(root, '[data-viewer-kind]').textContent = `${piece.cliente} · ${piece.formato}`;
  q(root, '[data-viewer-title]').textContent = piece.titulo;
  q<HTMLButtonElement>(root, '[data-viewer-prev-piece]').disabled = s.piece === 0;
  q<HTMLButtonElement>(root, '[data-viewer-next-piece]').disabled =
    s.piece === s.data.pieces.length - 1;
  trackEl.setAttribute('aria-label', piece.titulo);
}

/** Carga la imagen de un slide (y nada más): solo el actual y el siguiente. */
function loadSlide(s: State, index: number): void {
  const piece = s.data.pieces[s.piece];
  const slide = piece?.slides[index];
  const holder = s.root.querySelector<HTMLElement>(`.slide[data-index="${index}"]`);
  if (!slide || !holder || holder.childElementCount > 0) return;
  const picture = document.createElement('picture');
  const sizes = '(min-width: 48rem) 70vw, 100vw';
  for (const [type, srcset] of [
    ['image/avif', slide.avif],
    ['image/webp', slide.webp],
  ] as const) {
    if (!srcset) continue;
    const source = document.createElement('source');
    source.type = type;
    source.srcset = srcset;
    source.sizes = sizes;
    picture.append(source);
  }
  const img = document.createElement('img');
  img.src = slide.src;
  img.alt = slide.alt;
  img.width = slide.width;
  img.height = slide.height;
  img.decoding = 'async';
  picture.append(img);
  holder.append(picture);
}

function updateSlide(s: State, announce = true): void {
  const piece = s.data.pieces[s.piece];
  if (!piece) return;
  const total = piece.slides.length;
  loadSlide(s, s.slide);
  loadSlide(s, s.slide + 1);
  loadSlide(s, s.slide - 1); // swipe hacia atrás

  q(s.root, '[data-viewer-piece-count]').textContent = fill(s.data.labels.piece, {
    p: pad(s.piece + 1),
    total: pad(s.data.pieces.length),
  });
  q(s.root, '[data-viewer-slide-count]').textContent =
    total > 1 ? `· ${fill(s.data.labels.slide, { s: s.slide + 1, n: total })}` : '';

  s.root.querySelectorAll<HTMLElement>('[data-viewer-segments] li').forEach((li, i) => {
    li.toggleAttribute('data-done', i <= s.slide);
  });

  q<HTMLButtonElement>(s.root, '[data-viewer-prev-slide]').disabled =
    s.slide === 0 && s.piece === 0;
  q<HTMLButtonElement>(s.root, '[data-viewer-next-slide]').disabled =
    s.slide === total - 1 && s.piece === s.data.pieces.length - 1;

  if (announce) {
    const live = q(s.root, '[data-viewer-live]');
    live.textContent =
      total > 1
        ? `${piece.titulo}. ${fill(s.data.labels.slideAnnounce, { s: s.slide + 1, n: total })}`
        : piece.titulo;
  }
  writeUrl(s);
}

function writeUrl(s: State | null): void {
  const url = new URL(location.href);
  const piece = s ? s.data.pieces[s.piece] : null;
  if (s && piece) {
    url.searchParams.set('pieza', piece.slug);
    url.searchParams.set('slide', String(s.slide + 1));
  } else {
    url.searchParams.delete('pieza');
    url.searchParams.delete('slide');
  }
  // Conserva el estado del ClientRouter (scroll e índice del historial).
  history.replaceState(history.state, '', url);
}

// ---------- Slides (M15) ----------

function scrollToSlide(s: State, index: number, smooth = true): void {
  const trackEl = q(s.root, '[data-viewer-track]');
  trackEl.scrollTo({
    left: index * trackEl.clientWidth,
    behavior: smooth && !reducedMotion() ? 'smooth' : 'instant',
  });
}

function goSlide(s: State, delta: number): void {
  const piece = s.data.pieces[s.piece];
  if (!piece) return;
  const target = s.slide + delta;
  if (target >= piece.slides.length) return void goPiece(s, 1, 'start');
  if (target < 0) return void goPiece(s, -1, 'end');
  s.slide = target;
  loadSlide(s, target);
  scrollToSlide(s, target);
  updateSlide(s);
}

function onScrollEnd(s: State): void {
  const trackEl = q(s.root, '[data-viewer-track]');
  const piece = s.data.pieces[s.piece];
  if (!piece || trackEl.clientWidth === 0) return;
  const index = Math.round(trackEl.scrollLeft / trackEl.clientWidth);
  if (index >= piece.slides.length) {
    void goPiece(s, 1, 'start'); // M17: soltó en el panel final
    return;
  }
  if (index !== s.slide) {
    s.slide = index;
    updateSlide(s);
  }
}

// ---------- Piezas (M16) ----------

async function goPiece(s: State, delta: number, at: 'start' | 'end'): Promise<void> {
  const target = s.piece + delta;
  if (target < 0 || target >= s.data.pieces.length) return;
  cancelAnimations(s);
  const screen = q(s.root, '[data-viewer-frame]');
  const count = q(s.root, '[data-viewer-piece-count]');
  const shift = css('--shift-sm');
  const dir = delta > 0 ? 1 : -1;

  const out = track(
    s,
    screen.animate(
      [
        { opacity: 1, transform: 'none' },
        { opacity: 0, transform: `translateY(calc(${shift} * ${-dir}))` },
      ],
      { duration: tokenMs('--duration-fast'), easing: css('--ease-in'), fill: 'forwards' },
    ),
  );
  try {
    await out.finished;
  } catch {
    return;
  }

  s.piece = target;
  renderPiece(s);
  const total = s.data.pieces[target]?.slides.length ?? 1;
  s.slide = at === 'end' ? total - 1 : 0;
  updateSlide(s);
  scrollToSlide(s, s.slide, false);
  out.cancel();

  const enter = { duration: tokenMs('--duration-base'), easing: css('--ease-register') };
  track(
    s,
    screen.animate(
      [
        { opacity: 0, transform: `translateY(calc(${shift} * ${dir}))` },
        { opacity: 1, transform: 'none' },
      ],
      enter,
    ),
  );
  // El número de pieza del contador rueda en vertical.
  track(
    s,
    count.animate(
      [
        { opacity: 0, transform: `translateY(calc(${shift} * ${dir}))` },
        { opacity: 1, transform: 'none' },
      ],
      enter,
    ),
  );
}

// ---------- Abrir / cerrar (M13, M14) ----------

function lockPage(s: State): void {
  document.documentElement.classList.add('viewer-open');
  s.inerted = [...document.body.children].filter(
    (el): el is HTMLElement => el instanceof HTMLElement && el !== s.root && !el.inert,
  );
  s.inerted.forEach((el) => (el.inert = true));
}

function unlockPage(s: State): void {
  document.documentElement.classList.remove('viewer-open');
  s.inerted.forEach((el) => (el.inert = false));
  s.inerted = [];
}

function flipFrom(s: State, from: DOMRect, to: DOMRect, reverse: boolean): Animation {
  const scale = from.width / to.width;
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  const far = { transform: `translate(${dx}px, ${dy}px) scale(${scale})` };
  const near = { transform: 'none' };
  const frame = q(s.root, '[data-viewer-frame]');
  return track(
    s,
    frame.animate(reverse ? [near, far] : [far, near], {
      duration: tokenMs(reverse ? '--duration-base' : '--duration-slow'),
      easing: css(reverse ? '--ease-in-out' : '--ease-register'),
      fill: reverse ? 'forwards' : 'none',
    }),
  );
}

function open(
  root: HTMLElement,
  data: ViewerData,
  piece: number,
  slide: number,
  opener: HTMLElement | null,
  animate = true,
): void {
  if (state) close(true);
  if (closing) {
    cancelAnimations(closing);
    unlockPage(closing);
    closing = null;
  }
  const s: State = { root, data, piece, slide, opener, animations: [], inerted: [] };
  state = s;

  root.hidden = false;
  root.removeAttribute('data-ready');
  renderPiece(s);
  updateSlide(s, true);
  scrollToSlide(s, slide, false);
  lockPage(s);
  q(root, '[data-viewer-close]').focus({ preventScroll: true });

  const scrim = q(root, '[data-viewer-scrim]');
  const frame = q(root, '[data-viewer-frame]');
  const source = opener?.querySelector('.tile__frame, img') ?? null;
  if (!animate) {
    // Enlace directo: aparece sin viaje.
  } else if (reducedMotion() || !source) {
    track(
      s,
      root.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: tokenMs('--duration-base'),
        easing: css('--ease-out'),
      }),
    );
  } else {
    track(
      s,
      scrim.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: tokenMs('--duration-base'),
        easing: css('--ease-out'),
      }),
    );
    flipFrom(s, source.getBoundingClientRect(), frame.getBoundingClientRect(), false);
  }
  requestAnimationFrame(() => root.setAttribute('data-ready', ''));
}

function close(instant = false): void {
  const s = state;
  if (!s) return;
  cancelAnimations(s);
  state = null;
  const { root, opener } = s;

  const finish = () => {
    root.hidden = true;
    root.removeAttribute('data-ready');
    q(root, '[data-viewer-track]').replaceChildren();
    unlockPage(s);
    writeUrl(null);
    opener?.focus({ preventScroll: true });
  };
  if (instant) return finish();
  closing = s;

  root.removeAttribute('data-ready');
  const source = opener?.querySelector('.tile__frame, img') ?? null;
  const rect = source?.getBoundingClientRect();
  const visible = rect && rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0;
  const scrim = q(root, '[data-viewer-scrim]');
  const frame = q(root, '[data-viewer-frame]');

  let main: Animation;
  if (!reducedMotion() && visible && rect) {
    main = flipFrom(s, rect, frame.getBoundingClientRect(), true);
    track(
      s,
      scrim.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: tokenMs('--duration-base'),
        easing: css('--ease-in-out'),
        fill: 'forwards',
      }),
    );
  } else {
    main = track(
      s,
      root.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: tokenMs('--duration-base'),
        easing: css('--ease-in-out'),
        fill: 'forwards',
      }),
    );
  }
  main.finished
    .then(() => {
      closing = null;
      finish();
      s.animations.forEach((a) => a.cancel());
    })
    .catch(() => {
      // Cancelado porque se volvió a abrir: el nuevo `open` ya se ocupó.
      if (!state) finish();
    });
}

// ---------- Gestos ----------

function initDragToClose(root: HTMLElement, signal: AbortSignal): void {
  const stage = q(root, '[data-viewer-stage]');
  const frame = q(root, '[data-viewer-frame]');
  let start: { x: number; y: number; id: number } | null = null;
  let vertical = false;

  stage.addEventListener(
    'pointerdown',
    (e) => {
      if (e.pointerType !== 'touch' || !state) return;
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      vertical = false;
    },
    { signal },
  );
  stage.addEventListener(
    'pointermove',
    (e) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!vertical && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > DRAG_SLOP) vertical = true;
      if (vertical && dy > 0) frame.style.transform = `translateY(${dy}px)`;
    },
    { signal },
  );
  const end = (e: PointerEvent) => {
    if (!start || e.pointerId !== start.id) return;
    const dy = e.clientY - start.y;
    start = null;
    if (vertical && dy > CLOSE_DRAG) {
      frame.style.transform = '';
      close();
    } else if (vertical) {
      const from = frame.style.transform;
      frame.style.transform = '';
      if (state)
        track(
          state,
          frame.animate([{ transform: from }, { transform: 'none' }], {
            duration: tokenMs('--duration-base'),
            easing: css('--ease-out'),
          }),
        );
    }
  };
  stage.addEventListener('pointerup', end, { signal });
  stage.addEventListener('pointercancel', end, { signal });
}

// ---------- Init ----------

export function initViewer(): void {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;
  if (state) close(true);

  const root = document.querySelector<HTMLElement>('[data-viewer]');
  const json = root?.querySelector('[data-viewer-json]')?.textContent;
  if (!root || !json) return;
  const data = JSON.parse(json) as ViewerData;

  const indexOf = (slug: string | null) => data.pieces.findIndex((p) => p.slug === slug);

  // Abrir desde tiles y desde la tira de contactos.
  document.addEventListener(
    'click',
    (event) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>(
        '[data-viewer-piece], [data-viewer-open]',
      );
      if (!target || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      const [piece, slide] = (target.dataset.viewerOpen ?? `${target.dataset.viewerPiece}:0`)
        .split(':')
        .map(Number);
      if (piece === undefined || Number.isNaN(piece) || !data.pieces[piece]) return;
      event.preventDefault();
      event.stopPropagation();
      open(root, data, piece, slide ?? 0, target);
    },
    // Captura: corre antes que el ClientRouter, que si no navega al link de la imagen.
    { signal, capture: true },
  );

  q(root, '[data-viewer-close]').addEventListener('click', () => close(), { signal });
  q(root, '[data-viewer-scrim]').addEventListener('click', () => close(), { signal });
  q(root, '[data-viewer-prev-slide]').addEventListener('click', () => state && goSlide(state, -1), {
    signal,
  });
  q(root, '[data-viewer-next-slide]').addEventListener('click', () => state && goSlide(state, 1), {
    signal,
  });
  q(root, '[data-viewer-prev-piece]').addEventListener(
    'click',
    () => state && void goPiece(state, -1, 'start'),
    { signal },
  );
  q(root, '[data-viewer-next-piece]').addEventListener(
    'click',
    () => state && void goPiece(state, 1, 'start'),
    { signal },
  );
  q(root, '[data-viewer-track]').addEventListener('scrollend', () => state && onScrollEnd(state), {
    signal,
  });

  document.addEventListener(
    'keydown',
    (event) => {
      if (!state || event.altKey || event.ctrlKey || event.metaKey) return;
      const keys: Record<string, () => void> = {
        Escape: () => close(),
        ArrowRight: () => state && goSlide(state, 1),
        ArrowLeft: () => state && goSlide(state, -1),
        PageDown: () => state && void goPiece(state, 1, 'start'),
        PageUp: () => state && void goPiece(state, -1, 'start'),
      };
      const action = keys[event.key];
      if (!action) return;
      event.preventDefault();
      action();
    },
    { signal },
  );

  // Clic en el velo alrededor de la pieza (no en la pieza ni en los controles) cierra.
  q(root, '[data-viewer-stage]').addEventListener(
    'click',
    (event) => {
      if (event.target === event.currentTarget) close();
    },
    { signal },
  );

  initDragToClose(root, signal);

  // Enlace directo: ?pieza=<slug>&slide=<n>
  const params = new URL(location.href).searchParams;
  const initial = indexOf(params.get('pieza'));
  if (initial >= 0) {
    const total = data.pieces[initial]?.slides.length ?? 1;
    const slide = Math.min(Math.max(Number(params.get('slide') ?? 1) - 1, 0), total - 1);
    const opener = document.querySelector<HTMLElement>(`[data-viewer-piece="${initial}"]`);
    open(root, data, initial, slide, opener, false);
  }

  document.addEventListener('astro:before-swap', () => close(true), { once: true, signal });
}
