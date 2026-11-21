// Captura de pantalla para QA: node scripts/shot.mjs <url> <salida.png> [ancho] [alto] [light|dark] [full]
// Usa el Chrome instalado (playwright-core no descarga navegadores).
import { chromium } from 'playwright-core';
const [url, out, w = '1440', h = '900', scheme = 'light', full = ''] = process.argv.slice(2);
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const page = await browser.newPage({ viewport: { width: +w, height: +h }, colorScheme: scheme });
await page.goto(url, { waitUntil: 'networkidle' });
await page.screenshot({ path: out, fullPage: full === 'full' });
await browser.close();
console.log('ok', out);
