// Formulario de contacto (solo servidor). Lo usan /api/contacto (con JS) y
// /<lang>/contacto (sin JS). Reglas: .claude/rules/backend.md.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import {
  CONTACT_FORM_SECRET,
  CONTACT_FROM_EMAIL,
  CONTACT_TO_EMAIL,
  RESEND_API_KEY,
} from 'astro:env/server';
import { z } from 'astro/zod';

/** Claves de error: coinciden con `form.errors.*` de i18n (los textos no salen del servidor). */
export type FieldErrorKey =
  'required' | 'nameTooLong' | 'emailInvalid' | 'messageTooShort' | 'messageTooLong' | 'noHtml';
export type FormErrorKey = 'tooFast' | 'confirm';
export type FieldName = 'nombre' | 'mail' | 'empresa' | 'mensaje';
export type FieldErrors = Partial<Record<FieldName, FieldErrorKey>>;
export type ContactValues = Record<FieldName, string>;

export type ContactResult =
  | { status: 200; ok: true }
  | { status: 400; ok: false; errors: FieldErrors; form?: FormErrorKey }
  | { status: 403 | 429 | 500; ok: false };

const HTML = /<[^>]*>/;
const noHtml = (s: string) => !HTML.test(s);

const schema = z.object({
  nombre: z.string().trim().min(1, 'required').max(100, 'nameTooLong').refine(noHtml, 'noHtml'),
  mail: z.string().trim().min(1, 'required').max(254, 'emailInvalid').pipe(z.email('emailInvalid')),
  empresa: z.string().trim().max(100, 'nameTooLong').refine(noHtml, 'noHtml'),
  mensaje: z
    .string()
    .trim()
    .min(1, 'required')
    .min(10, 'messageTooShort')
    .max(3000, 'messageTooLong')
    .refine(noHtml, 'noHtml'),
});

// ---------- Token anti-spam: timestamp firmado ----------

const MIN_AGE_MS = 3000; // tiempo mínimo de llenado (backend.md)
const MAX_AGE_MS = 2 * 60 * 60 * 1000; // el token vence a las 2 horas
// En local, sin secreto configurado, uno por proceso (en producción es obligatorio).
const secret = CONTACT_FORM_SECRET || randomBytes(32).toString('hex');
if (!CONTACT_FORM_SECRET && import.meta.env.PROD) {
  console.warn(
    '[contacto] Falta CONTACT_FORM_SECRET: con varias instancias los tokens fallan (403). Definilo en el deploy.',
  );
}

const sign = (value: string) => createHmac('sha256', secret).update(value).digest('base64url');

export function issueToken(now = Date.now()): string {
  const ts = String(now);
  return `${ts}.${sign(ts)}`;
}

type TokenCheck = 'ok' | 'missing' | 'invalid' | 'tooFast' | 'expired';

export function checkToken(token: string | undefined, now = Date.now()): TokenCheck {
  if (!token) return 'missing';
  const [ts, signature] = token.split('.');
  if (!ts || !signature) return 'invalid';
  const expected = Buffer.from(sign(ts));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return 'invalid';
  const age = now - Number(ts);
  if (Number.isNaN(age) || age < 0) return 'invalid';
  if (age < MIN_AGE_MS) return 'tooFast';
  if (age > MAX_AGE_MS) return 'expired';
  return 'ok';
}

// ---------- Rate limit simple por IP (en memoria, por instancia) ----------

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 1000) {
    for (const [key, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
  }
  return recent.length > MAX_PER_WINDOW;
}

// ---------- Envío ----------

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );

async function deliver(values: ContactValues, lang: string): Promise<boolean> {
  const configured = RESEND_API_KEY && CONTACT_TO_EMAIL && CONTACT_FROM_EMAIL;
  if (!configured) {
    // Modo local: no envía; deja el mensaje en la consola (sin secretos ni destinatario).
    console.info('[contacto · modo local] mensaje recibido', { ...values, lang });
    return true;
  }
  const lines = [
    `Nombre: ${values.nombre}`,
    `Mail: ${values.mail}`,
    `Empresa: ${values.empresa || '—'}`,
    `Idioma del sitio: ${lang}`,
    '',
    values.mensaje,
  ];
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL,
      to: CONTACT_TO_EMAIL,
      reply_to: values.mail,
      subject: `Portfolio · mensaje de ${values.nombre}`,
      text: lines.join('\n'),
      html: `<p>${lines.map(escapeHtml).join('<br>')}</p>`,
    }),
  });
  if (!response.ok) console.error('[contacto] Resend respondió', response.status);
  return response.ok;
}

// ---------- Flujo completo ----------

export interface ContactInput {
  nombre?: unknown;
  mail?: unknown;
  empresa?: unknown;
  mensaje?: unknown;
  /** Honeypot: un humano no lo ve ni lo llena. Nombre que el autocompletado no reconoce. */
  hp_ref?: unknown;
  token?: unknown;
  lang?: unknown;
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');

export function readValues(input: ContactInput): ContactValues {
  return {
    nombre: str(input.nombre),
    mail: str(input.mail),
    empresa: str(input.empresa),
    mensaje: str(input.mensaje),
  };
}

export async function handleContact(input: ContactInput, ip: string): Promise<ContactResult> {
  const values = readValues(input);
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const errors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as FieldName;
      errors[field] ??= issue.message as FieldErrorKey;
    }
    return { status: 400, ok: false, errors };
  }

  const token = checkToken(str(input.token) || undefined);
  if (token === 'missing') return { status: 400, ok: false, errors: {}, form: 'confirm' };
  if (token === 'tooFast') return { status: 400, ok: false, errors: {}, form: 'tooFast' };
  if (token !== 'ok') return { status: 403, ok: false };

  // Solo cuentan los envíos válidos: un error de campo o un reintento no gasta el cupo.
  if (rateLimited(ip)) return { status: 429, ok: false };

  // Honeypot lleno: se responde como si hubiera salido bien, sin enviar nada.
  if (str(input.hp_ref)) return { status: 200, ok: true };

  try {
    const sent = await deliver(parsed.data, str(input.lang) || 'es');
    return sent ? { status: 200, ok: true } : { status: 500, ok: false };
  } catch (error) {
    console.error('[contacto] error al enviar', error instanceof Error ? error.message : error);
    return { status: 500, ok: false };
  }
}

/** Origen de la petición igual al del sitio (backend.md). Se compara contra el host que
 *  recibió la petición (Host / X-Forwarded-Host) y no contra `url`, que puede venir de
 *  SITE_URL y no coincidir en local ni en los deploys de preview. Sin Origin se acepta. */
export function sameOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const hosts = [
    request.headers.get('x-forwarded-host'),
    request.headers.get('host'),
    url.host,
  ].filter(Boolean);
  return hosts.includes(originHost);
}
