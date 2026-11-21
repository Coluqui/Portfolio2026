// QA de la Fase 8 sobre el build real: 4 anchos × ES/EN × claro/oscuro.
//   node scripts/qa-check.mjs [baseUrl] [carpetaCapturas]
// Por página: scroll horizontal, un solo H1, imágenes sin alt o rotas, errores de consola,
// textos en español en /en/ y foco visible con teclado. Guarda capturas para revisar a ojo.
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const BASE = process.argv[2] ?? 'http://localhost:4322';
const SHOTS = process.argv[3];
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const widths = [360, 768, 1280, 1440];
const pages = [
  '/es/',
  '/en/',
  '/es/trabajos/moondesk/',
  '/en/trabajos/carpa/',
  '/es/contacto/',
  '/en/gracias/',
  '/en/no-existe/',
];
// Palabras que delatan un texto en español dentro de /en/ (fuera de nombres propios y del CV).
const SPANISH =
  /\b(Trabajos|Qué hago|Herramientas|Sobre mí|Contacto|Descargar|Enviar|piezas|Diseñador|Ver caso|Mi rol)\b/;

if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME });
const problems = [];
let checks = 0;

for (const scheme of ['light', 'dark']) {
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      colorScheme: scheme,
    });
    for (const path of pages) {
      const page = await context.newPage();
      const errors = [];
      page.on(
        'console',
        (m) => m.type() === 'error' && !/404/.test(m.text()) && errors.push(m.text()),
      );
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      const r = await page.evaluate((spanishSource) => {
        const spanish = new RegExp(spanishSource);
        const strip = document.querySelector('[data-strip-track]');
        const wide = [...document.body.querySelectorAll('*')].filter((el) => {
          if (strip && (strip.contains(el) || el === strip)) return false;
          const b = el.getBoundingClientRect();
          return (
            b.width > 0 && b.right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed'
          );
        });
        const en = document.documentElement.lang === 'en';
        const main = document.querySelector('main')?.innerText ?? '';
        const nav = document.querySelector('header')?.innerText ?? '';
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          wide: wide.slice(0, 3).map((el) => el.tagName + '.' + [...el.classList].join('.')),
          h1: document.querySelectorAll('h1').length,
          noAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
          broken: [...document.images].filter(
            (i) => i.complete && i.naturalWidth === 0 && i.loading !== 'lazy',
          ).length,
          spanishInEn: en
            ? (nav + '\n' + main)
                .split('\n')
                .filter((l) => spanish.test(l))
                .slice(0, 3)
            : [],
        };
      }, SPANISH.source);
      checks++;
      const where = `${scheme} ${width} ${path}`;
      if (r.overflow) problems.push(`${where}: scroll horizontal (${r.wide.join(', ')})`);
      if (r.h1 !== 1) problems.push(`${where}: ${r.h1} H1`);
      if (r.noAlt) problems.push(`${where}: ${r.noAlt} imágenes sin alt`);
      if (r.broken) problems.push(`${where}: ${r.broken} imágenes rotas`);
      if (r.spanishInEn.length)
        problems.push(`${where}: texto en español en /en/: ${r.spanishInEn.join(' | ')}`);
      if (errors.length)
        problems.push(`${where}: errores de consola: ${errors.slice(0, 2).join(' | ')}`);
      if (SHOTS && ['/es/', '/en/trabajos/carpa/'].includes(path)) {
        await page.screenshot({
          path: `${SHOTS}/${scheme}-${width}${path.replaceAll('/', '_')}.png`,
        });
      }
      await page.close();
    }
    await context.close();
  }
}

// ---------- Teclado: recorrido con Tab por la home ----------
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/es/`, { waitUntil: 'networkidle' });
  const stops = [];
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      const ring = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
      const crop = el.querySelector?.('.crop-marks i');
      const marks = crop ? getComputedStyle(crop).opacity === '1' : false;
      const rule = el.closest('[data-field]')?.querySelector('.field__rule');
      const fieldRule = rule
        ? getComputedStyle(rule).transform !== 'matrix(0, 0, 0, 1, 0, 0)'
        : false;
      const r = el.getBoundingClientRect();
      const header = document.querySelector('[data-site-header]')?.getBoundingClientRect();
      // El link de salto aparece sobre la nav a propósito (capa superior): no cuenta.
      const hidden =
        header &&
        !el.classList.contains('skip-link') &&
        !el.closest('[data-site-header]') &&
        r.top < header.bottom - 1 &&
        r.bottom > 0;
      return {
        name: (el.getAttribute('aria-label') || el.textContent || el.name || el.tagName)
          .trim()
          .slice(0, 30),
        visible: ring || marks || fieldRule,
        obscured: !!hidden,
      };
    });
    if (!info) continue;
    stops.push(info);
  }
  checks++;
  const invisible = stops.filter((s) => !s.visible);
  const obscured = stops.filter((s) => s.obscured);
  if (invisible.length)
    problems.push(
      `teclado: foco sin indicador visible en ${invisible.map((s) => s.name).join(', ')}`,
    );
  if (obscured.length)
    problems.push(`teclado: foco tapado por la nav en ${obscured.map((s) => s.name).join(', ')}`);
  console.log(
    `Teclado: ${stops.length} paradas en la home, ${invisible.length} sin indicador, ${obscured.length} tapadas`,
  );
  await page.close();
}

await browser.close();
console.log(`${checks} páginas/recorridos revisados · ${problems.length} problema(s)`);
problems.forEach((p) => console.log(' · ' + p));
process.exit(problems.length ? 1 : 0);
