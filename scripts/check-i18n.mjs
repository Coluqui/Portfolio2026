// Compara las claves de es.json y en.json: ninguna puede faltar ni quedar vacía.
import { readFileSync } from 'node:fs';

const load = (lang) =>
  JSON.parse(readFileSync(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8'));

function leaves(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value !== null && typeof value === 'object' ? leaves(value, path) : [[path, value]];
  });
}

const es = new Map(leaves(load('es')));
const en = new Map(leaves(load('en')));
const errors = [];

for (const key of es.keys()) if (!en.has(key)) errors.push(`Falta en en.json: ${key}`);
for (const key of en.keys()) if (!es.has(key)) errors.push(`Falta en es.json: ${key}`);
for (const [lang, map] of [
  ['es', es],
  ['en', en],
]) {
  for (const [key, value] of map) {
    if (typeof value !== 'string' || value.trim() === '') errors.push(`Vacía en ${lang}: ${key}`);
  }
}

if (errors.length) {
  console.error(`i18n: ${errors.length} problema(s)\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`i18n: ${es.size} claves, ES y EN coinciden.`);
