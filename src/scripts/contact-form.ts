// Formulario de contacto con JS.
// M35 filete de foco (CSS) · M36 error al salir del campo, sin sacudida · M37 enviando ·
// M38 envío exitoso con marcas de corte · M39 error de envío sin perder lo escrito.
// Mismas reglas que el servidor (src/lib/contact-form.ts); el servidor es el que decide.
import { trackEvent } from './analytics';
import { tokenMs } from './motion';

type Messages = Record<string, string>;
type FieldName = 'nombre' | 'mail' | 'empresa' | 'mensaje';

const HTML = /<[^>]*>/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(name: FieldName, raw: string): string | null {
  const value = raw.trim();
  if (value && HTML.test(value)) return 'noHtml';
  switch (name) {
    case 'nombre':
      if (!value) return 'required';
      return value.length > 100 ? 'nameTooLong' : null;
    case 'mail':
      if (!value) return 'required';
      return value.length > 254 || !EMAIL.test(value) ? 'emailInvalid' : null;
    case 'empresa':
      return value.length > 100 ? 'nameTooLong' : null;
    case 'mensaje':
      if (!value) return 'required';
      if (value.length < 10) return 'messageTooShort';
      return value.length > 3000 ? 'messageTooLong' : null;
  }
}

/** Muestra u oculta el error de un campo y lo asocia con aria-describedby. */
function setFieldError(input: HTMLInputElement | HTMLTextAreaElement, message: string | null) {
  const field = input.closest<HTMLElement>('[data-field]');
  const error = field?.querySelector<HTMLElement>('[data-field-error]');
  const text = field?.querySelector<HTMLElement>('[data-field-error-text]');
  if (!field || !error || !text) return;
  const ids = new Set((input.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean));
  if (message) {
    text.textContent = message;
    error.hidden = false;
    field.dataset.invalid = '';
    input.setAttribute('aria-invalid', 'true');
    ids.add(error.id);
  } else {
    text.textContent = '';
    error.hidden = true;
    delete field.dataset.invalid;
    input.removeAttribute('aria-invalid');
    ids.delete(error.id);
  }
  if (ids.size) input.setAttribute('aria-describedby', [...ids].join(' '));
  else input.removeAttribute('aria-describedby');
}

function setLoading(button: HTMLButtonElement | null, loading: boolean) {
  if (!button) return;
  button.toggleAttribute('data-loading', loading);
  button.disabled = loading;
  if (loading) button.setAttribute('aria-busy', 'true');
  else button.removeAttribute('aria-busy');
  const labels = button.querySelectorAll<HTMLElement>('.button__label');
  labels[0]?.setAttribute('aria-hidden', String(loading));
  labels[1]?.setAttribute('aria-hidden', String(!loading));
}

let controller: AbortController | null = null;

export function initContactForms(): void {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach((form) => {
    const messages = JSON.parse(form.dataset.messages ?? '{}') as Messages;
    const tokenInput = form.querySelector<HTMLInputElement>('[data-form-token]');
    const body = form.querySelector<HTMLElement>('[data-form-body]');
    const submit = form.querySelector<HTMLButtonElement>('[data-form-submit]');
    const failure = form.querySelector<HTMLElement>('[data-form-error]');
    const success = form.querySelector<HTMLElement>('[data-form-success]');
    const fields = [
      ...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        'input[name="nombre"], input[name="mail"], input[name="empresa"], textarea[name="mensaje"]',
      ),
    ];
    let tokenRequest: Promise<void> | null = null;

    const fetchToken = (force = false) => {
      if (tokenRequest && !force) return tokenRequest;
      tokenRequest = fetch('/api/contacto', { headers: { Accept: 'application/json' } })
        .then((r) => r.json() as Promise<{ token?: string }>)
        .then((data) => {
          if (tokenInput && data.token) tokenInput.value = data.token;
        })
        .catch(() => {
          // Sin token, el servidor pide confirmar el envío: el formulario sigue funcionando.
        });
      return tokenRequest;
    };

    // El token se pide al empezar a llenar (así mide el tiempo de llenado real).
    form.addEventListener('focusin', () => void fetchToken(), { once: true, signal });

    const check = (input: HTMLInputElement | HTMLTextAreaElement) => {
      const key = validate(input.name as FieldName, input.value);
      setFieldError(input, key ? (messages[key] ?? key) : null);
      return key === null;
    };

    fields.forEach((input) => {
      // M36: se valida al salir del campo; si ya tenía error, se revalida al escribir.
      input.addEventListener('blur', () => input.value && check(input), { signal });
      input.addEventListener(
        'input',
        () => input.closest('[data-field]')?.hasAttribute('data-invalid') && check(input),
        { signal },
      );
    });

    const showFailure = (show: boolean) => {
      if (failure) failure.hidden = !show;
    };

    const showSuccess = () => {
      if (!body || !success) return;
      // M38: el formulario se desvanece y aparece la confirmación con las marcas de corte.
      const fade = body.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: tokenMs('--duration-fast'),
        fill: 'forwards',
      });
      fade.finished
        .then(() => {
          body.hidden = true;
          fade.cancel();
          success.hidden = false;
          success.dataset.visible = '';
          const marks = success.querySelector<HTMLElement>('.crop-marks');
          requestAnimationFrame(() => {
            if (marks) marks.dataset.crop = 'on';
          });
          success.focus({ preventScroll: true });
          form.reset();
        })
        .catch(() => undefined);
    };

    const send = async (retried = false): Promise<void> => {
      showFailure(false);
      setLoading(submit, true);
      await fetchToken();
      const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
      let response: Response;
      try {
        response = await fetch('/api/contacto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
      } catch {
        setLoading(submit, false);
        showFailure(true);
        return;
      }
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        errors?: Partial<Record<FieldName, string>>;
        form?: string;
      };
      setLoading(submit, false);

      if (response.ok && result.ok) {
        trackEvent('contact_submit', { idioma: document.documentElement.lang });
        return showSuccess();
      }

      if (response.status === 400) {
        const errors = result.errors ?? {};
        fields.forEach((input) => {
          const key = errors[input.name as FieldName];
          setFieldError(input, key ? (messages[key] ?? key) : null);
        });
        if (result.form === 'confirm' && !retried) {
          // No había token (falló la primera petición): se pide de nuevo y se reintenta una vez.
          await fetchToken(true);
          return send(true);
        }
        if (result.form) {
          const notice = messages[result.form];
          if (notice) showFormNotice(form, notice);
        }
        fields.find((input) => input.getAttribute('aria-invalid') === 'true')?.focus();
        return;
      }
      if (response.status === 403 && !retried) {
        // Token vencido o inválido: uno nuevo y un reintento.
        await fetchToken(true);
        return send(true);
      }
      showFailure(true); // 429, 500 u otro: M39, sin perder lo escrito
    };

    form.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();
        const valid = fields.map(check).every(Boolean);
        if (!valid) {
          fields.find((input) => input.getAttribute('aria-invalid') === 'true')?.focus();
          return;
        }
        void send();
      },
      { signal },
    );

    form
      .querySelector('[data-form-retry]')
      ?.addEventListener('click', () => form.requestSubmit(), { signal });
  });

  document.addEventListener('astro:before-swap', () => controller?.abort(), { once: true, signal });
}

/** Aviso del formulario (p. ej. "Esperá un segundo y enviá de nuevo"), en el lugar. */
function showFormNotice(form: HTMLFormElement, text: string) {
  let notice = form.querySelector<HTMLElement>('[data-form-notice]');
  if (!notice) {
    notice = document.createElement('p');
    notice.className = 'notice';
    notice.dataset.formNotice = '';
    notice.setAttribute('role', 'status');
    form.querySelector('[data-form-submit]')?.closest('div')?.before(notice);
  }
  notice.textContent = text;
}
