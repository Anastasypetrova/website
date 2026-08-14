/**
 * Talking to the bot Worker (see bot/).
 *
 * The site is static, so it holds no token and no secret — it only knows the
 * Worker's address. Until that address is set the forms fall back to opening
 * the visitor's mail app, so the site is never a dead end.
 */
import { links } from './content';

/** Set to the deployed Worker URL, e.g. 'https://samadhi-bot.<subdomain>.workers.dev'. */
export const API_BASE = '';

export const apiConfigured = API_BASE !== '';

export type SubmitResult =
  | { status: 'ok'; answer?: string | null }
  | { status: 'error'; reason: 'email_invalid' | 'message_required' | 'network' };

async function post(path: string, body: unknown): Promise<SubmitResult> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; answer?: string | null };
    if (res.ok) return { status: 'ok', answer: data.answer ?? null };
    if (data.error === 'email_invalid' || data.error === 'message_required') {
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
  message: string;
  website: string;
}

export function submitContact(fields: ContactFields): Promise<SubmitResult> {
  return post('/contact', fields);
}

export function submitNewsletter(email: string, website: string): Promise<SubmitResult> {
  return post('/subscribe', { email, website });
}

/** Fallback while the Worker is not deployed: hand the message to the mail app. */
export function mailtoFallback(fields: Partial<ContactFields>): string {
  const subject = 'Вопрос с сайта';
  const body = [
    fields.name ? `Имя: ${fields.name}` : '',
    fields.email ? `Email: ${fields.email}` : '',
    '',
    fields.message ?? '',
  ]
    .filter(Boolean)
    .join('\n');
  return `mailto:${links.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
