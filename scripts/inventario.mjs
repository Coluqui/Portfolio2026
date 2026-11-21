// Inventario de piezas a partir de scripts/inventario.json.
//
//   node scripts/inventario.mjs check   → valida el mapeo contra la carpeta original
//   node scripts/inventario.mjs sheets  → hojas de contacto en docs/inventario/<caso>.jpg
//   node scripts/inventario.mjs copy    → copia (byte a byte) a src/assets/trabajos/<caso>/
//   node scripts/inventario.mjs json    → crea src/content/casos/<caso>.json (no pisa existentes)
//
// La carpeta original es solo lectura: este script nunca escribe, mueve ni borra ahí.
import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const config = JSON.parse(await readFile(join(ROOT, 'scripts/inventario.json'), 'utf8'));
const SOURCE = config.source;
const IMAGE = /\.(jpe?g|png|webp|avif)$/i;
const VIDEO = /\.(mp4|mov|webm)$/i;

/** Nombre final según PRD §7: <cliente>-<formato>-<tema>[-NN].<ext> */
function targetName(caso, group, index) {
  const ext = group.files[index].split('.').pop().toLowerCase().replace('jpeg', 'jpg');
  const base = `${caso}-${group.formato}-${group.tema}`;
  return group.files.length > 1
    ? `${base}-${String(index + 1).padStart(2, '0')}.${ext}`
    : `${base}.${ext}`;
}

async function check() {
  const errors = [];
  for (const [caso, groups] of Object.entries(config.casos)) {
    const onDisk = (await readdir(join(SOURCE, caso))).filter(
      (f) => IMAGE.test(f) || VIDEO.test(f),
    );
    const mapped = groups.flatMap((g) => g.files);
    const dupes = mapped.filter((f, i) => mapped.indexOf(f) !== i);
    for (const f of dupes) errors.push(`${caso}/${f}: asignado más de una vez`);
    for (const f of onDisk) if (!mapped.includes(f)) errors.push(`${caso}/${f}: sin asignar`);
    for (const f of mapped) if (!onDisk.includes(f)) errors.push(`${caso}/${f}: no existe`);
    const names = groups.flatMap((g) => g.files.map((_, i) => targetName(caso, g, i)));
    for (const n of names.filter((n, i) => names.indexOf(n) !== i))
      errors.push(`${caso}: nombre repetido ${n}`);
  }
  if (errors.length) {
    console.error(`Inventario con ${errors.length} problema(s):\n  ${errors.join('\n  ')}`);
    process.exit(1);
  }
  const total = Object.values(config.casos).flat();
  console.log(
    `Inventario OK: ${total.reduce((n, g) => n + g.files.length, 0)} archivos → ${total.length} piezas.`,
  );
}

const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );

function textSvg(width, height, lines, { size = 18, color = '#1A1917', bold = false } = {}) {
  const tspans = lines
    .map((l, i) => `<text x="0" y="${size * (i + 1) * 1.3}">${esc(l)}</text>`)
    .join('');
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g font-family="Arial, sans-serif" font-size="${size}" font-weight="${bold ? 700 : 400}" fill="${color}">${tspans}</g></svg>`,
  );
}

async function sheets() {
  const out = join(ROOT, 'docs/inventario');
  await mkdir(out, { recursive: true });
  const THUMB_H = 260;
  const PAD = 16;
  const MAX_W = 1800;
  const LABEL_H = 44;
  const HEADER_H = 56;

  for (const [caso, groups] of Object.entries(config.casos)) {
    const composites = [];
    let y = PAD;
    for (const group of groups) {
      const conf = group.confianza === 'alta' ? '' : `  ·  confianza ${group.confianza}: CONFIRMAR`;
      composites.push({
        input: textSvg(
          MAX_W,
          HEADER_H,
          [
            `${group.id} · ${group.formato} · ${group.tema} · ${group.files.length} ${group.files.length > 1 ? 'archivos' : 'archivo'}${conf}`,
          ],
          { size: 22, bold: true, color: group.confianza === 'alta' ? '#1A1917' : '#B23412' },
        ),
        top: y,
        left: PAD,
      });
      y += HEADER_H;
      let x = PAD;
      let rowH = 0;
      for (const [i, file] of group.files.entries()) {
        const img = sharp(join(SOURCE, caso, file));
        const meta = await img.metadata();
        const w = Math.round((meta.width / meta.height) * THUMB_H);
        if (x + w > MAX_W - PAD) {
          x = PAD;
          y += rowH;
          rowH = 0;
        }
        composites.push({
          input: await img.resize({ height: THUMB_H }).toBuffer(),
          top: y,
          left: x,
        });
        composites.push({
          input: textSvg(
            Math.max(w, 200),
            LABEL_H,
            [`${file}  ${meta.width}×${meta.height}`, targetName(caso, group, i)],
            { size: 13, color: '#5F5C55' },
          ),
          top: y + THUMB_H + 4,
          left: x,
        });
        x += Math.max(w, 200) + PAD;
        rowH = THUMB_H + LABEL_H + PAD;
      }
      y += rowH + PAD;
    }
    await sharp({
      create: { width: MAX_W, height: y + PAD, channels: 3, background: '#F3F1EB' },
    })
      .composite(composites)
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(join(out, `${caso}.jpg`));
    console.log(`docs/inventario/${caso}.jpg`);
  }
}

async function copy() {
  await check();
  let copied = 0;
  let skipped = 0;
  for (const [caso, groups] of Object.entries(config.casos)) {
    const dest = join(ROOT, 'src/assets/trabajos', caso);
    await mkdir(dest, { recursive: true });
    for (const group of groups) {
      for (const [i, file] of group.files.entries()) {
        const from = join(SOURCE, caso, file);
        const to = join(dest, targetName(caso, group, i));
        if (existsSync(to)) {
          const [a, b] = await Promise.all([stat(from), stat(to)]);
          if (a.size === b.size) {
            skipped++;
            continue;
          }
          throw new Error(`${to} ya existe con otro contenido: no lo piso.`);
        }
        await copyFile(from, to);
        copied++;
      }
    }
  }
  console.log(`Copiados: ${copied} · ya estaban: ${skipped}. Originales sin tocar.`);
}

async function json() {
  await check();
  const todo = (what) => ({ es: `TODO(contenido): ${what}`, en: `TODO(contenido): ${what}` });
  const dir = join(ROOT, 'src/content/casos');
  await mkdir(dir, { recursive: true });
  for (const [caso, groups] of Object.entries(config.casos)) {
    const file = join(dir, `${caso}.json`);
    if (existsSync(file)) {
      console.log(`src/content/casos/${caso}.json ya existe: no lo piso.`);
      continue;
    }
    const piezas = groups.map((group) => ({
      slug: group.tema,
      formato: group.formato,
      ratio: group.ratio,
      titulo: todo(`título de la pieza ${group.tema}`),
      objetivo: todo(`objetivo en una línea de ${group.tema}`),
      slides: group.files.map((_, i) => ({
        src: targetName(caso, group, i),
        alt: todo(`alt del slide ${i + 1}`),
      })),
    }));
    const meta = config.meta?.[caso] ?? {};
    const data = {
      slug: caso,
      cliente: meta.cliente ?? caso,
      orden: meta.orden ?? 99,
      ...(meta.portada && { portada: meta.portada }),
      ...(meta.destacado && { destacado: meta.destacado }),
      rol: todo('mi rol'),
      descripcion: todo('qué es el cliente y qué diseñé (2–3 líneas)'),
      metricas: [],
      entregables: [],
      piezas,
    };
    await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
    console.log(`src/content/casos/${caso}.json`);
  }
}

const commands = { check, sheets, copy, json };
const cmd = process.argv[2];
if (!commands[cmd]) {
  console.error(`Uso: node scripts/inventario.mjs <${Object.keys(commands).join('|')}>`);
  process.exit(1);
}
await commands[cmd]();
