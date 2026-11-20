import en from './en.json';
import es from './es.json';

export const languages = ['es', 'en'] as const;
export type Lang = (typeof languages)[number];
export const defaultLang: Lang = 'es';

type Dictionary = typeof es;

// `en` tiene que tener exactamente la misma forma que `es` (lo verifica también check-i18n).
const dictionaries: Record<Lang, Dictionary> = { es, en };

/** Claves con puntos de las hojas de texto: 'meta.role', 'lang.short.es'… */
type Leaves<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Leaves<T[K]>}`;
}[keyof T & string];

export type TranslationKey = Leaves<Dictionary>;

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (languages as readonly string[]).includes(value);
}

/** Traductor de un idioma. Las variables se escriben `{nombre}` en el JSON. */
export function useTranslations(lang: Lang) {
  return function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    let node: unknown = dictionaries[lang];
    for (const part of key.split('.')) {
      node = (node as Record<string, unknown>)[part];
    }
    if (typeof node !== 'string') {
      throw new Error(`i18n: falta la clave "${key}" en ${lang}`);
    }
    if (!vars) return node;
    return node.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in vars ? String(vars[name]) : match,
    );
  };
}

/** Misma ruta en otro idioma: /es/trabajos/x/ → /en/trabajos/x/ */
export function localizePath(pathname: string, lang: Lang): string {
  const rest = pathname.replace(/^\/(es|en)(?=\/|$)/, '');
  const path = `/${lang}${rest.startsWith('/') ? rest : `/${rest}`}`;
  return path.endsWith('/') ? path : `${path}/`;
}

/** Elige idioma desde Accept-Language respetando los pesos q. Fallback: español. */
export function pickLang(acceptLanguage: string | null): Lang {
  if (!acceptLanguage) return defaultLang;
  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag = '', ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { base: tag.toLowerCase().split('-')[0], q: q ? Number(q.split('=')[1]) : 1 };
    })
    .filter((entry) => !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q);
  const match = ranked.find((entry) => isLang(entry.base));
  return match && isLang(match.base) ? match.base : defaultLang;
}
