/**
 * Form endpoint for anastasia-samadhi.club.
 *
 * The site is static on GitHub Pages, so it can hold no keys: anything the page
 * can read, a visitor can read. This Worker holds them and does the work.
 *
 *   POST /contact    — the "Остались вопросы?" form
 *   POST /subscribe  — the newsletter form
 *
 * What happens to a question, in order:
 *
 *   1. validated, and obvious bot submissions dropped
 *   2. written to the contact database on Anastasia's Drive — this happens
 *      first and always, so a message is never lost to a later failure
 *   3. a model decides whether it is about her work at all
 *   4. if it is, a reply is written in her voice and sent from the site's
 *      address, with replies going to the mailbox she reads
 *   5. she is notified either way, and the notification carries the full text
 *      of whatever went out over her name
 *
 * Every step after the database write is wrapped: a failing model or mail
 * service costs the auto-reply, never the record and never the notification.
 */
import { appendRow, type ContactRow } from './sheet';
import { draftReply } from './openai';
import { sendLetter } from './resend';

/**
 * Only these four are secret and only these four have to be set. The rest are
 * plain settings with the defaults below — overriding one is possible but not
 * required, which keeps first-time setup to four values instead of ten.
 */
export interface Env {
  OPENAI_API_KEY: string;
  RESEND_API_KEY: string;
  SHEET_ENDPOINT: string;
  SHEET_SECRET: string;

  /** Verified in Resend, e.g. 'Анастасия Петрова <hello@anastasia-samadhi.club>'. */
  FROM_EMAIL?: string;
  /** Where a person's reply should land. */
  REPLY_TO?: string;
  /** Where Anastasia gets told about new messages. */
  NOTIFY_TO?: string;
  ALLOWED_ORIGINS?: string;
  SITE_URL?: string;
  OPENAI_MODEL?: string;
}

export const VERSION = 2;

const DEFAULTS = {
  ALLOWED_ORIGINS: 'https://anastasia-samadhi.club,https://www.anastasia-samadhi.club',
  SITE_URL: 'https://anastasia-samadhi.club',
  FROM_EMAIL: 'Анастасия Петрова <hello@anastasia-samadhi.club>',
  REPLY_TO: 'hello@metasouls.co',
  NOTIFY_TO: 'hello@metasouls.co',
  OPENAI_MODEL: 'gpt-4o-mini',
} as const;

interface Config {
  allowedOrigins: string[];
  siteUrl: string;
  from: string;
  replyTo: string;
  notifyTo: string;
  model: string;
}

function config(env: Env): Config {
  return {
    allowedOrigins: (env.ALLOWED_ORIGINS || DEFAULTS.ALLOWED_ORIGINS).split(',').map((o) => o.trim()),
    siteUrl: env.SITE_URL || DEFAULTS.SITE_URL,
    from: env.FROM_EMAIL || DEFAULTS.FROM_EMAIL,
    replyTo: env.REPLY_TO || DEFAULTS.REPLY_TO,
    notifyTo: env.NOTIFY_TO || DEFAULTS.NOTIFY_TO,
    model: env.OPENAI_MODEL || DEFAULTS.OPENAI_MODEL,
  };
}

const MAX_NAME = 100;
const MAX_EMAIL = 200;
const MAX_HANDLE = 40;
const MAX_MESSAGE = 4000;

const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
const looksLikeHandle = (value: string) => /^@[A-Za-z][A-Za-z0-9_]{4,31}$/.test(value);

function corsHeaders(origin: string | null, cfg: Config): Record<string, string> {
  if (!origin || !cfg.allowedOrigins.includes(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
  };
}

const json = (body: unknown, status: number, cors: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...cors },
  });

/** Never let a side errand take down the request that matters. */
async function attempt<T>(label: string, task: () => Promise<T>): Promise<T | null> {
  try {
    return await task();
  } catch (error) {
    console.error(`${label} failed:`, error);
    return null;
  }
}

async function record(env: Env, row: ContactRow): Promise<boolean> {
  const done = await attempt('sheet', () => appendRow(env.SHEET_ENDPOINT, env.SHEET_SECRET, row));
  return done !== null;
}

function notify(env: Env, cfg: Config, subject: string, text: string) {
  return attempt('notify', () =>
    sendLetter(env.RESEND_API_KEY, cfg.from, cfg.siteUrl, {
      to: cfg.notifyTo,
      subject,
      text,
    }),
  );
}

interface ContactPayload {
  name?: string;
  email?: string;
  telegram?: string;
  message?: string;
  /** Honeypot: hidden from people, irresistible to form bots. */
  website?: string;
}

async function handleContact(request: Request, env: Env, cfg: Config, cors: Record<string, string>) {
  const body = (await request.json().catch(() => null)) as ContactPayload | null;
  if (!body) return json({ error: 'bad_request' }, 400, cors);
  if (body.website) return json({ ok: true }, 200, cors);

  const name = (body.name ?? '').trim().slice(0, MAX_NAME);
  const email = (body.email ?? '').trim().slice(0, MAX_EMAIL);
  const telegram = (body.telegram ?? '').trim().slice(0, MAX_HANDLE);
  const message = (body.message ?? '').trim().slice(0, MAX_MESSAGE);

  if (!message) return json({ error: 'message_required' }, 422, cors);
  if (!looksLikeEmail(email)) return json({ error: 'email_invalid' }, 422, cors);
  if (!looksLikeHandle(telegram)) return json({ error: 'telegram_invalid' }, 422, cors);

  const draft = await attempt('draft', () =>
    draftReply(env.OPENAI_API_KEY, cfg.model, name, message),
  );

  let outcome: string;
  if (draft === null) {
    outcome = 'не удалось составить — ответьте сами';
  } else if (!draft.relevant) {
    outcome = 'не по теме — письмо не отправлено';
  } else {
    const sent = await attempt('reply', () =>
      sendLetter(env.RESEND_API_KEY, cfg.from, cfg.siteUrl, {
        to: email,
        subject: 'Ответ на ваш вопрос',
        text: draft.reply,
        replyTo: cfg.replyTo,
      }),
    );
    outcome = sent !== null ? 'отправлен' : 'не удалось отправить — ответьте сами';
  }

  const saved = await record(env, { kind: 'contact', name, email, telegram, message, outcome });

  await notify(
    env,
    cfg,
    `Вопрос с сайта: ${name || email}`,
    [
      `ФИО: ${name || '—'}`,
      `Email: ${email}`,
      `Telegram: ${telegram}`,
      '',
      'Вопрос:',
      message,
      '',
      '---',
      `Автоответ: ${outcome}`,
      ...(draft?.relevant ? ['', 'Что ушло от вашего имени:', '', draft.reply] : []),
      ...(saved ? [] : ['', '⚠️ Записать в таблицу не получилось — сохраните контакт вручную.']),
    ].join('\n'),
  );

  // The site only needs to know it was received; the answer arrives by email.
  return json({ ok: true }, 200, cors);
}

async function handleSubscribe(request: Request, env: Env, cfg: Config, cors: Record<string, string>) {
  const body = (await request.json().catch(() => null)) as { email?: string; website?: string } | null;
  if (!body) return json({ error: 'bad_request' }, 400, cors);
  if (body.website) return json({ ok: true }, 200, cors);

  const email = (body.email ?? '').trim().slice(0, MAX_EMAIL);
  if (!looksLikeEmail(email)) return json({ error: 'email_invalid' }, 422, cors);

  const saved = await record(env, { kind: 'subscribe', email, outcome: '—' });
  await notify(
    env,
    cfg,
    'Новая подписка на рассылку',
    saved ? email : `${email}\n\n⚠️ Записать в таблицу не получилось.`,
  );
  return json({ ok: true }, 200, cors);
}

/**
 * Opening the Worker's address in a browser answers the two questions that
 * actually come up during setup: is this the current code, and did the secrets
 * get through. Only whether each secret is present, never its value.
 */
function health(cfg: Config, env: Env): Response {
  return new Response(
    JSON.stringify(
      {
        ok: true,
        service: 'samadhi-forms',
        version: VERSION,
        settings: { from: cfg.from, replyTo: cfg.replyTo, notifyTo: cfg.notifyTo, model: cfg.model },
        secrets: {
          OPENAI_API_KEY: Boolean(env.OPENAI_API_KEY),
          RESEND_API_KEY: Boolean(env.RESEND_API_KEY),
          SHEET_ENDPOINT: Boolean(env.SHEET_ENDPOINT),
          SHEET_SECRET: Boolean(env.SHEET_SECRET),
        },
      },
      null,
      2,
    ),
    { headers: { 'content-type': 'application/json; charset=utf-8' } },
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cfg = config(env);
    const cors = corsHeaders(request.headers.get('origin'), cfg);

    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
      return health(cfg, env);
    }
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return new Response('not found', { status: 404 });

    // Only the site may post the forms.
    if (Object.keys(cors).length === 0) return new Response('forbidden', { status: 403 });

    try {
      if (url.pathname === '/contact') return await handleContact(request, env, cfg, cors);
      if (url.pathname === '/subscribe') return await handleSubscribe(request, env, cfg, cors);
    } catch (error) {
      console.error(error);
      return json({ error: 'server_error' }, 500, cors);
    }
    return new Response('not found', { status: 404, headers: cors });
  },
};
