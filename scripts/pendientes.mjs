// Lista los `TODO(contenido)` que quedan en el contenido y en los textos de interfaz.
// Uso: npm run pendientes
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dirs = ['src/content/casos', 'src/i18n'];
let total = 0;

for (const dir of dirs) {
  for (const file of readdirSync(join(root, dir)).filter((f) => f.endsWith('.json'))) {
    const text = readFileSync(join(root, dir, file), 'utf8');
    const hits = [...text.matchAll(/"([^"]+)":\s*"TODO\(contenido\):\s*([^"]*)"/g)];
    if (!hits.length) continue;
    total += hits.length;
    const unique = [...new Set(hits.map(([, key, what]) => `${key}: ${what}`))];
    console.log(`\n${dir}/${file} — ${hits.length}`);
    for (const line of unique) console.log(`  · ${line}`);
  }
}
console.log(`\nTotal: ${total} TODO(contenido).`);
