// Único endpoint server (backend.md).
//   GET  → { token }: timestamp firmado que el formulario pide al empezar a llenarse.
//   POST → JSON { nombre, mail, empresa, mensaje, website, token, lang }.
//          200 { ok: true } · 400 { ok: false, errors, form? } · 403 · 415 · 429 · 500.
// Los textos visibles salen de i18n en el cliente: acá solo viajan claves.
// Sin JS, el formulario se envía a /<lang>/contacto (misma lógica, responde HTML).
import type { APIRoute } from 'astro';
import { handleContact, issueToken, sameOrigin, type ContactInput } from '../../lib/contact-form';

export const prerender = false;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export const GET: APIRoute = ({ request, url }) => {
  if (!sameOrigin(request, url)) return json(403, { ok: false });
  return json(200, { token: issueToken() });
};

export const POST: APIRoute = async ({ request, url, clientAddress }) => {
  if (!sameOrigin(request, url)) return json(403, { ok: false });
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json(415, { ok: false });
  }
  let input: ContactInput;
  try {
    input = (await request.json()) as ContactInput;
  } catch {
    return json(400, { ok: false, errors: {} });
  }
  const result = await handleContact(input, clientAddress);
  const { status, ...body } = result;
  return json(status, body);
};

export const ALL: APIRoute = () =>
  new Response(null, { status: 405, headers: { Allow: 'GET, POST' } });
