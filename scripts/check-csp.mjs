// Verifica, después del build, que cada <script> incrustado esté permitido por la CSP de
// vercel.json (hash sha256). Si alguien cambia el script de tema de Base.astro o Astro
// vuelve a incrustar scripts, el build falla acá en vez de romper el sitio en producción.
//   node scripts/check-csp.mjs        (lo corre `npm run build`)
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
// Build local (adapter Node) o build en Vercel (Build Output API).
const candidates = [join(root, 'dist/client'), join(root, '.vercel/output/static')];
if (process.env.VERCEL) candidates.reverse();
const outDir = candidates.find(existsSync);
if (!outDir) {
  console.error('check-csp: no encuentro el build (dist/client ni .vercel/output/static).');
  process.exit(1);
}

const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
const csp = vercel.headers
  .flatMap((h) => h.headers)
  .find((h) => h.key === 'Content-Security-Policy')?.value;
const allowed = new Set([...(csp ?? '').matchAll(/'sha256-([^']+)'/g)].map((m) => m[1]));

const htmlFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });

const inline = /<script(?![^>]*\bsrc=)(?![^>]*application\/json)[^>]*>([\s\S]*?)<\/script>/g;
const missing = new Map();
let pages = 0;
for (const file of htmlFiles(outDir)) {
  pages++;
  for (const match of readFileSync(file, 'utf8').matchAll(inline)) {
    const hash = createHash('sha256')
      .update(match[1] ?? '')
      .digest('base64');
    if (!allowed.has(hash)) missing.set(hash, file.replace(root, ''));
  }
}

if (missing.size) {
  console.error('check-csp: hay scripts incrustados que la CSP de vercel.json bloquearía:');
  for (const [hash, file] of missing) console.error(`  'sha256-${hash}'  (por ejemplo en ${file})`);
  console.error('Actualizá script-src en vercel.json o evitá el script incrustado.');
  process.exit(1);
}
console.log(`check-csp: ${pages} páginas, todos los scripts incrustados están en la CSP.`);
