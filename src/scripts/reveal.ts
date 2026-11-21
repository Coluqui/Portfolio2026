// M25 / M27 · Entradas por scroll. Un solo IntersectionObserver (umbral 0.15): marca cada
// elemento [data-reveal] como "in" una vez y deja de observarlo. Solo se ocultan
// ("pending") los elementos que están fuera del primer viewport, así nada de lo que se ve
// al cargar arranca invisible. Sin JS, todo queda visible.

const THRESHOLD = 0.15; // --reveal-threshold (motion.md)

let observer: IntersectionObserver | null = null;

export function initReveal(): void {
  observer?.disconnect();
  const items = [...document.querySelectorAll<HTMLElement>('[data-reveal]')].filter(
    (el) => el.dataset.reveal !== 'in',
  );
  if (items.length === 0) return;

  const viewport = window.innerHeight;
  const pending = items.filter((el) => el.getBoundingClientRect().top > viewport);
  items.filter((el) => !pending.includes(el)).forEach((el) => (el.dataset.reveal = 'in'));
  if (pending.length === 0) return;
  pending.forEach((el) => (el.dataset.reveal = 'pending'));

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.reveal = 'in';
        observer?.unobserve(entry.target);
      });
    },
    { threshold: THRESHOLD },
  );
  pending.forEach((el) => observer?.observe(el));

  document.addEventListener('astro:before-swap', () => observer?.disconnect(), { once: true });
}
