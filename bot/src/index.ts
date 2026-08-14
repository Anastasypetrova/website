/**
 * Telegram bot + form endpoint for anastasia-samadhi.club.
 *
 * The site is static, hosted on GitHub Pages, so it cannot hold the bot token:
 * anything the page can read, a visitor can read. This Worker holds it instead.
 * It does two jobs:
 *
 *   POST /contact    — the "Остались вопросы?" form. Sends the message to
 *                      Anastasia's Telegram, and answers the sender on the spot
 *                      when the question matches the site's FAQ.
 *   POST /subscribe  — the newsletter form. Sends the address to her Telegram.
 *   POST /telegram   — the bot itself: /start, FAQ buttons, free-text questions,
 *                      and relaying her replies back to whoever asked.
 *
 * A Telegram bot cannot write first to someone who has never opened a chat with
 * it, so a web form filled in by a stranger can only be answered by email —
 * hence the mailto link in every notification.
 */
import { Telegram, escapeHtml, type InlineButton } from './telegram';
import { answers, findAnswer } from './faq';

export interface Env {
  BOT_TOKEN: string;
  OWNER_CHAT_ID: string;
  /** Shared with Telegram when the webhook is registered; rejects forged calls. */
  WEBHOOK_SECRET: string;
  /** Comma-separated origins allowed to post the forms. */
  ALLOWED_ORIGINS: string;
}

const MAX_NAME = 100;
const MAX_EMAIL = 200;
const MAX_MESSAGE = 4000;

function corsHeaders(origin: string | null, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  if (!origin || !allowed.includes(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
  };
}

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...cors },
  });
}

const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
  /** Honeypot: a field hidden from people, irresistible to form bots. */
  website?: string;
}

async function handleContact(request: Request, env: Env, cors: Record<string, string>) {
  const body = (await request.json().catch(() => null)) as ContactPayload | null;
  if (!body) return json({ error: 'bad_request' }, 400, cors);
  if (body.website) return json({ ok: true }, 200, cors); // silently drop bots

  const name = (body.name ?? '').trim().slice(0, MAX_NAME);
  const email = (body.email ?? '').trim().slice(0, MAX_EMAIL);
  const message = (body.message ?? '').trim().slice(0, MAX_MESSAGE);

  if (!message) return json({ error: 'message_required' }, 422, cors);
  if (!looksLikeEmail(email)) return json({ error: 'email_invalid' }, 422, cors);

  const tg = new Telegram(env.BOT_TOKEN);
  const suggestion = findAnswer(`${message}`);

  const lines = [
    '📩 <b>Сообщение с сайта</b>',
    '',
    `<b>Имя:</b> ${escapeHtml(name || '—')}`,
    `<b>Email:</b> ${escapeHtml(email)}`,
    '',
    escapeHtml(message),
    '',
    `<a href="mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Ответ на ваш вопрос — Анастасия Петрова')}">Ответить письмом</a>`,
  ];
  if (suggestion) {
    lines.push('', `<i>Отправила автоответ: «${escapeHtml(suggestion.question)}»</i>`);
  }

  await tg.sendMessage(env.OWNER_CHAT_ID, lines.join('\n'));

  // The sender gets the FAQ answer immediately when there is a good match; the
  // site shows it under the form. Otherwise it just confirms receipt.
  return json({ ok: true, answer: suggestion?.answer ?? null }, 200, cors);
}

async function handleSubscribe(request: Request, env: Env, cors: Record<string, string>) {
  const body = (await request.json().catch(() => null)) as { email?: string; website?: string } | null;
  if (!body) return json({ error: 'bad_request' }, 400, cors);
  if (body.website) return json({ ok: true }, 200, cors);

  const email = (body.email ?? '').trim().slice(0, MAX_EMAIL);
  if (!looksLikeEmail(email)) return json({ error: 'email_invalid' }, 422, cors);

  const tg = new Telegram(env.BOT_TOKEN);
  await tg.sendMessage(
    env.OWNER_CHAT_ID,
    `✉️ <b>Новая подписка на рассылку</b>\n\n${escapeHtml(email)}`,
  );
  return json({ ok: true }, 200, cors);
}

const faqButtons = (): InlineButton[][] =>
  answers.map((entry, i) => [{ text: entry.question, callback_data: `faq:${i}` }]);

const GREETING =
  'Здравствуйте! Это бот Анастасии Петровой.\n\n' +
  'Выберите вопрос ниже — отвечу сразу. Или просто напишите свой вопрос своими словами: ' +
  'если не найду ответа, передам его Анастасии, и она ответит здесь же.';

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from?: { id: number; first_name?: string; username?: string };
    text?: string;
    reply_to_message?: { text?: string };
  };
  callback_query?: {
    id: string;
    data?: string;
    message?: { chat: { id: number } };
  };
}

async function handleWebhook(request: Request, env: Env): Promise<Response> {
  if (request.headers.get('x-telegram-bot-api-secret-token') !== env.WEBHOOK_SECRET) {
    return new Response('forbidden', { status: 403 });
  }

  const update = (await request.json().catch(() => null)) as TelegramUpdate | null;
  if (!update) return new Response('ok');

  const tg = new Telegram(env.BOT_TOKEN);

  if (update.callback_query) {
    const { id, data, message } = update.callback_query;
    await tg.answerCallbackQuery(id);
    const index = Number(data?.split(':')[1]);
    const entry = answers[index];
    if (entry && message) {
      await tg.sendMessage(
        message.chat.id,
        `<b>${escapeHtml(entry.question)}</b>\n\n${escapeHtml(entry.answer)}`,
      );
    }
    return new Response('ok');
  }

  const message = update.message;
  if (!message?.text) return new Response('ok');

  const chatId = message.chat.id;
  const text = message.text.trim();
  const fromOwner = String(chatId) === env.OWNER_CHAT_ID;

  // Anastasia replying to a forwarded question: the asker's id travels inside
  // the message she is replying to, so no state has to be kept anywhere.
  if (fromOwner && message.reply_to_message?.text) {
    const target = /#u(\d+)/.exec(message.reply_to_message.text);
    if (target) {
      await tg.sendMessage(
        target[1],
        `<b>Ответ от Анастасии:</b>\n\n${escapeHtml(text)}`,
      );
      await tg.sendMessage(chatId, '✅ Отправила');
      return new Response('ok');
    }
  }

  if (text.startsWith('/start')) {
    await tg.sendMessage(chatId, GREETING, faqButtons());
    return new Response('ok');
  }

  if (text === '/id') {
    await tg.sendMessage(chatId, `Chat ID: <code>${chatId}</code>`);
    return new Response('ok');
  }

  const answer = findAnswer(text);
  if (answer) {
    await tg.sendMessage(
      chatId,
      `<b>${escapeHtml(answer.question)}</b>\n\n${escapeHtml(answer.answer)}\n\n` +
        '<i>Если это не то, о чём вы спрашивали — напишите ещё раз подробнее, и я передам вопрос Анастасии.</i>',
    );
    return new Response('ok');
  }

  // No match: hand it to Anastasia, tagging the asker so her reply can find them.
  const who = message.from;
  const label = who?.username ? `@${who.username}` : (who?.first_name ?? 'без имени');
  await tg.sendMessage(
    env.OWNER_CHAT_ID,
    `❓ <b>Вопрос боту</b> от ${escapeHtml(label)} #u${who?.id ?? chatId}\n\n` +
      `${escapeHtml(text)}\n\n<i>Ответьте на это сообщение — бот перешлёт ответ.</i>`,
  );
  await tg.sendMessage(
    chatId,
    'Передала вопрос Анастасии — она ответит здесь же. ' +
      'А пока можно посмотреть частые вопросы:',
    faqButtons(),
  );
  return new Response('ok');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cors = corsHeaders(request.headers.get('origin'), env);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (url.pathname === '/telegram' && request.method === 'POST') {
      return handleWebhook(request, env);
    }
    if (request.method !== 'POST') return new Response('not found', { status: 404 });

    // Only the site may post the forms; a bare curl gets nothing back.
    if (Object.keys(cors).length === 0) return new Response('forbidden', { status: 403 });

    try {
      if (url.pathname === '/contact') return await handleContact(request, env, cors);
      if (url.pathname === '/subscribe') return await handleSubscribe(request, env, cors);
    } catch (error) {
      console.error(error);
      return json({ error: 'send_failed' }, 502, cors);
    }
    return new Response('not found', { status: 404, headers: cors });
  },
};
