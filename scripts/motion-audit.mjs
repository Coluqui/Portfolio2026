// Auditoría de motion (Fase 7) contra docs/motion.md, sobre el build real.
//   npm run build && npx astro preview --port 4322
//   node scripts/motion-audit.mjs [baseUrl]
// Corre cada prueba en Chrome con y sin prefers-reduced-motion, mide fps con la CPU 4× más
// lenta (M06, M13, M15, M23), CLS al cambiar modo, idioma y filtro, LCP con y sin
// animaciones, interrupciones del visor y marcas de corte con teclado.
// Usa el Chrome instalado (playwright-core no descarga navegadores).
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const BASE = process.argv[2] ?? 'http://localhost:4322';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const results = [];
const record = (id, mode, check, pass, detail = '') => {
  results.push({ id, mode, check, pass, detail });
  console.log(
    `${pass ? 'OK ' : 'NO '} ${id.padEnd(5)} ${mode.padEnd(8)} ${check}${detail ? ` · ${detail}` : ''}`,
  );
};

const browser = await chromium.launch({ executablePath: CHROME });

async function newPage(reduced, { width = 1440, height = 900, throttle = 1 } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reduced ? 'reduce' : 'no-preference',
    colorScheme: 'light',
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    // CLS y LCP desde el inicio; espía de startViewTransition.
    window.__cls = { all: 0, unexpected: 0 };
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        window.__cls.all += e.value;
        if (!e.hadRecentInput) window.__cls.unexpected += e.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
    window.__lcp = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__lcp = e.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    window.__vt = 0;
    const original = document.startViewTransition?.bind(document);
    if (original) {
      document.startViewTransition = (...args) => {
        window.__vt++;
        return original(...args);
      };
    }
  });
  if (throttle > 1) {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
  }
  return { page, context };
}

/** Mide fps con rAF durante `ms` después de `action`. */
async function measureFps(page, action, ms = 900) {
  await page.evaluate((ms) => {
    window.__samples = [];
    const start = performance.now();
    const tick = (t) => {
      window.__samples.push(t);
      if (t - start < ms) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, ms);
  await action();
  await page.waitForTimeout(ms + 100);
  return page.evaluate(() => {
    const f = window.__samples;
    const gaps = f.slice(1).map((t, i) => t - f[i]);
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    return {
      fps: Math.round(1000 / avg),
      long: gaps.filter((g) => g > 25).length,
      max: Math.round(Math.max(...gaps)),
      frames: gaps.length,
    };
  });
}

const resetCls = (page) => page.evaluate(() => (window.__cls = { all: 0, unexpected: 0 }));
const cls = (page) => page.evaluate(() => window.__cls);
const animationsOn = (page, selector) =>
  page.evaluate(
    (sel) =>
      document
        .getAnimations()
        .filter((a) => !sel || a.effect?.target?.closest?.(sel))
        .map((a) => Math.round(a.effect.getComputedTiming().duration)),
    selector,
  );

for (const reduced of [false, true]) {
  const mode = reduced ? 'reducido' : 'normal';

  // ---------- Tokens ----------
  {
    const { page, context } = await newPage(reduced);
    await page.goto(`${BASE}/es/`, { waitUntil: 'networkidle' });
    const tokens = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      // Chrome normaliza "200ms" a ".2s": se pasa todo a ms para comparar.
      const norm = (v) =>
        v.endsWith('ms') ? v : v.endsWith('s') ? `${Math.round(parseFloat(v) * 1000)}ms` : v;
      return [
        '--duration-fast',
        '--duration-base',
        '--duration-slow',
        '--duration-page',
        '--crop-travel',
        '--delay-chrome',
        '--hold-feedback',
      ].map((t) => `${t}=${norm(s.getPropertyValue(t).trim())}`);
    });
    const expected = reduced
      ? [
          '--duration-fast=0ms',
          '--duration-base=120ms',
          '--duration-slow=120ms',
          '--duration-page=120ms',
          '--crop-travel=0px',
          '--delay-chrome=0ms',
          '--hold-feedback=1800ms',
        ]
      : [
          '--duration-fast=200ms',
          '--duration-base=300ms',
          '--duration-slow=500ms',
          '--duration-page=700ms',
          '--crop-travel=6px',
          '--delay-chrome=200ms',
          '--hold-feedback=1800ms',
        ];
    record(
      'tok',
      mode,
      'tokens de motion',
      JSON.stringify(tokens) === JSON.stringify(expected),
      tokens.join(' '),
    );

    // M26 · hero sin animación de entrada, nada invisible en el primer viewport
    const m26 = await page.evaluate(() => {
      const invisible = [...document.querySelectorAll('.hero *')].filter((el) => {
        const r = el.getBoundingClientRect();
        // Los estados alternativos de un control (aria-hidden) no cuentan como contenido.
        if (el.closest('[aria-hidden="true"]')) return false;
        return r.top < innerHeight && r.height > 0 && Number(getComputedStyle(el).opacity) < 1;
      }).length;
      return { animations: document.getAnimations().length, invisible };
    });
    record(
      'M26',
      mode,
      'hero completo en el primer frame',
      m26.animations === 0 && m26.invisible === 0,
      `animaciones ${m26.animations}, invisibles ${m26.invisible}`,
    );

    // LCP
    const lcp = await page.evaluate(() => Math.round(window.__lcp));
    record('LCP', mode, 'LCP de la home', lcp > 0 && lcp < 2500, `${lcp} ms`);

    // M25 · entrada de sección: pendiente fuera del viewport, "in" al llegar; reducido visible
    const before = await page.evaluate(() => {
      const h = document.querySelector('#que-hago [data-reveal]');
      return {
        state: h?.dataset.reveal,
        opacity: getComputedStyle(h.querySelector('.title')).opacity,
      };
    });
    await page.evaluate(() => document.getElementById('que-hago').scrollIntoView());
    await page.waitForTimeout(800);
    const after = await page.evaluate(
      () => document.querySelector('#que-hago [data-reveal]')?.dataset.reveal,
    );
    record(
      'M25',
      mode,
      reduced ? 'secciones visibles sin entrada' : 'filete y título entran una vez',
      reduced
        ? before.opacity === '1' && after === 'in'
        : before.state === 'pending' && before.opacity === '0' && after === 'in',
      `antes ${before.state}/${before.opacity}, después ${after}`,
    );

    // M05 + M06 · filtro
    await page.evaluate(() => document.getElementById('trabajos').scrollIntoView());
    await page.waitForTimeout(300);
    await resetCls(page);
    await page.click('#trabajos [data-filter="ads"]');
    await page.waitForTimeout(60);
    const filterAnims = await animationsOn(page, '[data-work]');
    await page.waitForTimeout(900);
    const filterCls = await cls(page);
    const visible = await page.evaluate(
      () => [...document.querySelectorAll('[data-work-item]')].filter((e) => !e.hidden).length,
    );
    record(
      'M06',
      mode,
      reduced ? 'filtro: fundido de la grilla 120 ms' : 'filtro: salida + FLIP + entrada',
      visible === 3 && (reduced ? filterAnims.every((d) => d <= 120) : filterAnims.length > 0),
      `piezas ${visible}, animaciones [${filterAnims.join(',')}]`,
    );
    record(
      'CLS',
      mode,
      'CLS inesperado al filtrar = 0',
      filterCls.unexpected === 0,
      `total ${filterCls.all.toFixed(4)}, inesperado ${filterCls.unexpected.toFixed(4)}`,
    );

    // M23 · cambio de modo
    await page.evaluate(() => window.scrollTo(0, 0));
    await resetCls(page);
    const vtBefore = await page.evaluate(() => window.__vt);
    await page.click('.desktop-only [data-theme-toggle]');
    await page.waitForTimeout(500);
    const m23 = await page.evaluate(
      (vtBefore) => ({ vt: window.__vt - vtBefore, theme: document.documentElement.dataset.theme }),
      vtBefore,
    );
    const modeCls = await cls(page);
    record(
      'M23',
      mode,
      reduced ? 'modo: cambio instantáneo' : 'modo: fundido con View Transition',
      m23.theme === 'dark' && (reduced ? m23.vt === 0 : m23.vt === 1),
      `vt ${m23.vt}, tema ${m23.theme}`,
    );
    record('CLS', mode, 'CLS al cambiar modo = 0', modeCls.all === 0, `${modeCls.all.toFixed(4)}`);

    // M24 · idioma
    await resetCls(page);
    await page.click('[data-lang-link="en"] >> nth=0');
    await page.waitForURL('**/en/**');
    await page.waitForTimeout(600);
    const langCls = await cls(page);
    const lang = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      theme: document.documentElement.dataset.theme,
    }));
    record(
      'M24',
      mode,
      'idioma: misma página, tema conservado',
      lang.lang === 'en' && lang.theme === 'dark',
      JSON.stringify(lang),
    );
    record(
      'CLS',
      mode,
      'CLS inesperado al cambiar idioma = 0',
      langCls.unexpected === 0,
      `inesperado ${langCls.unexpected.toFixed(4)}`,
    );
    await context.close();
  }

  // ---------- Visor (M13–M18) y marcas de corte ----------
  {
    const { page, context } = await newPage(reduced);
    await page.goto(`${BASE}/es/trabajos/moondesk/`, { waitUntil: 'networkidle' });

    // M01 · marcas de corte con teclado
    // Pieza 0 = carrusel "Nacimos de un error" (5 slides)
    await page.focus('#case-grid [data-viewer-piece="1"]');
    await page.keyboard.press('Shift+Tab');
    await page.waitForTimeout(400);
    const marks = await page.evaluate(() => {
      const t = document.activeElement;
      const i = t?.querySelector('.crop-marks i');
      return {
        opacity: i ? getComputedStyle(i).opacity : null,
        transform: i ? getComputedStyle(i).transform : null,
      };
    });
    record(
      'M01',
      mode,
      'marcas de corte visibles con teclado',
      marks.opacity === '1' &&
        (marks.transform === 'none' || marks.transform === 'matrix(1, 0, 0, 1, 0, 0)'),
      JSON.stringify(marks),
    );

    // M13 · abrir
    await page.keyboard.press('Enter');
    await page.waitForTimeout(60);
    const openAnims = await page.evaluate(() =>
      document.getAnimations().map((a) => ({
        el: a.effect.target.matches('[data-viewer-frame]')
          ? 'pieza'
          : a.effect.target.matches('[data-viewer-scrim]')
            ? 'velo'
            : a.effect.target.matches('[data-viewer]')
              ? 'visor'
              : 'otro',
        ms: Math.round(a.effect.getComputedTiming().duration),
      })),
    );
    await page.waitForTimeout(800);
    const open = await page.evaluate(() => {
      const v = document.querySelector('[data-viewer]');
      return {
        open: !v.hidden,
        ready: v.hasAttribute('data-ready'),
        inert: document.querySelector('main').inert,
        crop: getComputedStyle(v.querySelector('[data-viewer-screen] .crop-marks i')).opacity,
        url: location.search,
      };
    });
    const pieceAnim = openAnims.find((a) => a.el === 'pieza');
    record(
      'M13',
      mode,
      reduced ? 'abrir: fundido 120 ms sin viaje' : 'abrir: FLIP 500 ms + velo 300 ms',
      open.open &&
        open.ready &&
        open.inert &&
        (reduced
          ? !pieceAnim && openAnims.some((a) => a.el === 'visor' && a.ms === 120)
          : pieceAnim?.ms === 500 && openAnims.some((a) => a.el === 'velo' && a.ms === 300)),
      JSON.stringify(openAnims),
    );
    record(
      'M01',
      mode,
      'marcas de corte enmarcan la pieza abierta',
      open.crop === '1',
      `opacidad ${open.crop}`,
    );

    // M15 + M18 · slide siguiente con teclado
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(900);
    const slide = await page.evaluate(() => ({
      url: location.search,
      done: document.querySelectorAll('[data-viewer-segments] li[data-done]').length,
      live: document.querySelector('[data-viewer-live]').textContent,
    }));
    record(
      'M15',
      mode,
      '→ pasa al slide 2',
      slide.url.includes('pieza=nacimos-de-un-error&slide=2') && slide.done === 2,
      JSON.stringify(slide),
    );

    // M16 · pieza siguiente (Av Pág)
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(80);
    const pieceAnims = await animationsOn(page, '[data-viewer]');
    await page.waitForTimeout(700);
    const piece = await page.evaluate(() => location.search);
    record(
      'M16',
      mode,
      reduced ? 'pieza siguiente: fundido corto' : 'pieza siguiente: sale 200 / entra 300',
      piece.includes('pieza=cambio-normativo') &&
        (reduced ? pieceAnims.every((d) => d <= 120) : true),
      `[${pieceAnims.join(',')}] ${piece}`,
    );

    // M14 + interrupción: ESC y reabrir enseguida otra pieza
    await page.keyboard.press('Escape');
    await page.waitForTimeout(50);
    await page.click('#case-grid [data-viewer-piece="2"]');
    await page.waitForTimeout(900);
    const interrupted = await page.evaluate(() => ({
      open: !document.querySelector('[data-viewer]').hidden,
      inert: document.querySelector('main').inert,
      title: document.querySelector('[data-viewer-title]').textContent,
    }));
    record(
      'M14',
      mode,
      'ESC + reabrir enseguida: estado consistente',
      interrupted.open && interrupted.inert && interrupted.title === 'Día de la Tierra',
      JSON.stringify(interrupted),
    );
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
    const closed = await page.evaluate(() => ({
      hidden: document.querySelector('[data-viewer]').hidden,
      inert: document.querySelector('main').inert,
      focus: document.activeElement?.dataset.viewerPiece,
      url: location.search,
    }));
    record(
      'M14',
      mode,
      'cerrar: foco vuelve al tile, URL limpia',
      closed.hidden && !closed.inert && closed.focus === '2' && closed.url === '',
      JSON.stringify(closed),
    );
    await context.close();
  }
}

// ---------- 60 fps con CPU 4× (M06, M13, M15, M23) ----------
{
  const { page, context } = await newPage(false, { throttle: 4 });
  await page.goto(`${BASE}/es/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.getElementById('trabajos').scrollIntoView());
  await page.waitForTimeout(500);
  const m06 = await measureFps(page, () => page.click('#trabajos [data-filter="redes"]'));
  record('M06', 'cpu 4×', 'fps del filtro (FLIP)', m06.long <= 2, JSON.stringify(m06));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const m23 = await measureFps(page, () => page.click('.desktop-only [data-theme-toggle]'), 600);
  record('M23', 'cpu 4×', 'fps del cambio de modo', m23.long <= 2, JSON.stringify(m23));
  await page.goto(`${BASE}/es/trabajos/iscamen/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.getElementById('case-grid').scrollIntoView());
  await page.waitForTimeout(500);
  const m13 = await measureFps(page, () => page.click('#case-grid [data-viewer-piece="0"]'));
  record('M13', 'cpu 4×', 'fps al abrir el visor', m13.long <= 2, JSON.stringify(m13));
  await page.waitForTimeout(500);
  const m15 = await measureFps(page, () => page.keyboard.press('ArrowRight'));
  record('M15', 'cpu 4×', 'fps del slide siguiente', m15.long <= 2, JSON.stringify(m15));
  await context.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
writeFileSync(
  new URL('../docs/motion-audit.json', import.meta.url),
  `${JSON.stringify({ date: new Date().toISOString(), base: BASE, results }, null, 2)}\n`,
);
console.log(`\n${results.length - failed.length}/${results.length} OK`);
process.exit(failed.length ? 1 : 0);
