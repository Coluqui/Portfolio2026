// Lee tokens.css en build para la página interna /dev/tokens.
// Resuelve var() de la paleta base y calcula contrastes WCAG por modo.
import raw from '../styles/tokens.css?raw';

export type TokenMap = Map<string, string>;

function block(selector: RegExp): string {
  const start = raw.search(selector);
  if (start === -1) throw new Error(`tokens.css: no encuentro ${selector}`);
  const open = raw.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < raw.length; i++) {
    if (raw[i] === '{') depth++;
    if (raw[i] === '}') depth--;
    if (depth === 0) return raw.slice(open + 1, i);
  }
  throw new Error(`tokens.css: bloque sin cerrar en ${selector}`);
}

function parse(css: string): TokenMap {
  const map: TokenMap = new Map();
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const match of clean.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    const [, name, value] = match;
    if (name && value) map.set(`--${name}`, value.trim());
  }
  return map;
}

const rootTokens = parse(block(/:root\s*\{/));
const darkOverrides = parse(block(/:root\[data-theme=["']?dark["']?\]\s*\{/));
const reducedOverrides = parse(block(/@media\s*\(prefers-reduced-motion:\s*reduce\)/));

export const light: TokenMap = rootTokens;
export const dark: TokenMap = new Map([...rootTokens, ...darkOverrides]);
export const reduced: TokenMap = reducedOverrides;

export function resolve(map: TokenMap, value: string, depth = 0): string {
  const ref = value.match(/^var\((--[\w-]+)\)$/);
  if (!ref?.[1] || depth > 5) return value;
  const next = map.get(ref[1]);
  return next ? resolve(map, next, depth + 1) : value;
}

export function tokensWithPrefix(map: TokenMap, prefix: string): string[] {
  return [...map.keys()].filter((key) => key.startsWith(prefix));
}

// ---- Contraste WCAG ----
function luminance(hex: string): number | null {
  const digits = hex.match(/^#([0-9a-f]{6})$/i)?.[1];
  if (!digits) return null;
  const channels = [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(map: TokenMap, fg: string, bg: string): number | null {
  const a = luminance(resolve(map, map.get(fg) ?? ''));
  const b = luminance(resolve(map, map.get(bg) ?? ''));
  if (a === null || b === null) return null;
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export const semanticColors = tokensWithPrefix(light, '--color-').filter(
  (key) => !['--color-scrim'].includes(key),
);
export const paletteColors = [
  ...tokensWithPrefix(light, '--paper-'),
  ...tokensWithPrefix(light, '--ink-'),
  ...tokensWithPrefix(light, '--signal-'),
  ...tokensWithPrefix(light, '--green-'),
  ...tokensWithPrefix(light, '--crimson-'),
];

export const contrastText = [
  '--color-text-primary',
  '--color-text-secondary',
  '--color-text-disabled',
  '--color-accent-text',
  '--color-accent-text-hover',
  '--color-success',
  '--color-danger',
];
export const contrastUi = ['--color-border-strong', '--color-accent'];
export const contrastBackgrounds = [
  '--color-bg',
  '--color-surface',
  '--color-raised',
  '--color-stage',
];
