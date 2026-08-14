/**
 * Talking to the form Worker (see api/).
 *
 * The site is static, so it holds no token and no secret — it only knows the
 * Worker's address. Until that address is set the forms fall back to opening
 * the visitor's mail app, so the site is never a dead end.
 */
import { links } from './content';

/** The deployed Worker (see api/). Empty disables the forms and falls back to mail. */
export const API_BASE: string = 'https://samadhi-forms.rapid-glade-d94d.workers.dev';

export const apiConfigured = API_BASE !== '';

export type SubmitResult =
  | { status: 'ok'; answer?: string | null }
  | { status: 'error'; reason: 'email_invalid' | 'telegram_invalid' | 'message_required' | 'network' };

async function post(path: string, body: unknown): Promise<SubmitResult> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; answer?: string | null };
    if (res.ok) return { status: 'ok', answer: data.answer ?? null };
    if (data.error === 'email_invalid' || data.error === 'telegram_invalid' || data.error === 'message_required') {
      return { status: 'error', reason: data.error };
    }
    return { status: 'error', reason: 'network' };
  } catch {
    return { status: 'error', reason: 'network' };
  }
}

export interface ContactFields {
  name: string;
  email: string;
  telegram: string;
  message: string;
  website: string;
}

/** Accepts @name, name, or a t.me link; stores one shape in the database. */
export function normaliseTelegram(value: string): string {
  const handle = value
    .trim()
    .replace(/^(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me)\//i, '')
    .replace(/^@/, '')
    .replace(/\/+$/, '');
  return handle ? `@${handle}` : '';
}

/** Telegram's own rule: 5–32 of letters, digits and underscore. */
export function telegramLooksValid(value: string): boolean {
  return /^@[A-Za-z][A-Za-z0-9_]{4,31}$/.test(normaliseTelegram(value));
}

export function submitContact(fields: ContactFields): Promise<SubmitResult> {
  return post('/contact', { ...fields, telegram: normaliseTelegram(fields.telegram) });
}

export function submitNewsletter(email: string, website: string): Promise<SubmitResult> {
  return post('/subscribe', { email, website });
}

/** Fallback while the Worker is not deployed: hand the message to the mail app. */
export function mailtoFallback(fields: Partial<ContactFields>): string {
  const subject = 'Вопрос с сайта';
  const body = [
    fields.name ? `ФИО: ${fields.name}` : '',
    fields.email ? `Email: ${fields.email}` : '',
    fields.telegram ? `Telegram: ${normaliseTelegram(fields.telegram)}` : '',
    '',
    fields.message ?? '',
  ]
    .filter(Boolean)
    .join('\n');
  return `mailto:${links.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
