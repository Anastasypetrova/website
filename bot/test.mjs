/**
 * Exercises the Worker against a stubbed Telegram API — no token, no network.
 *
 *   node bot/test.mjs
 */
import { build } from 'vite';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const DIR = 'node_modules/.tmp/bot-test';
await build({ logLevel: 'error', build: { ssr: 'bot/src/index.ts', outDir: DIR, emptyOutDir: true } });
const worker = (await import(pathToFileURL(resolve(DIR, 'index.js')).href)).default;

const env = {
  BOT_TOKEN: 'test-token',
  OWNER_CHAT_ID: '111',
  WEBHOOK_SECRET: 'shhh',
  ALLOWED_ORIGINS: 'https://anastasia-samadhi.club',
};

let sent = [];
globalThis.fetch = async (url, init) => {
  const body = JSON.parse(init.body);
  sent.push({ method: String(url).split('/').pop(), ...body });
  return new Response(JSON.stringify({ ok: true, result: {} }), {
    headers: { 'content-type': 'application/json' },
  });
};

let failures = 0;
function check(label, condition, detail = '') {
  if (!condition) failures++;
  console.log(`${condition ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
}

const post = (path, body, origin = 'https://anastasia-samadhi.club', headers = {}) =>
  worker.fetch(
    new Request(`https://bot.example${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin, ...headers },
      body: JSON.stringify(body),
    }),
    env,
  );

console.log('\n— форма обратной связи —');
sent = [];
let res = await post('/contact', { name: 'Мария Иванова', email: 'maria@example.com', telegram: '@mariaiv', message: 'Как оплатить и в какой валюте?' });
let data = await res.json();
check('принята', res.status === 200 && data.ok);
check('ушло сообщение Анастасии', sent.length === 1 && String(sent[0].chat_id) === '111');
check('в сообщении есть ФИО, адрес, telegram и текст',
  sent[0]?.text.includes('Мария Иванова') && sent[0]?.text.includes('maria@example.com') && sent[0]?.text.includes('@mariaiv') && sent[0]?.text.includes('оплатить'));
check('есть ссылка «Ответить письмом»', sent[0]?.text.includes('mailto:'));
check('отправителю вернулся автоответ из FAQ', typeof data.answer === 'string' && data.answer.length > 40);

sent = [];
res = await post('/contact', { email: 'нет-собаки', telegram: '@someone', message: 'привет' });
check('кривой адрес отклонён', res.status === 422 && (await res.json()).error === 'email_invalid');
check('в Telegram ничего не ушло', sent.length === 0);

sent = [];
res = await post('/contact', { email: 'a@b.co', telegram: '@someone', message: '' });
check('пустое сообщение отклонено', res.status === 422);

sent = [];
res = await post('/contact', { email: 'bot@spam.io', telegram: '@spammer', message: 'buy links', website: 'http://spam' });
check('ловушка для спам-ботов: ответ 200, но ничего не отправлено',
  res.status === 200 && sent.length === 0);

sent = [];
res = await post('/contact', { email: 'a@b.co', telegram: '@someone', message: 'привет' }, 'https://evil.example');
check('чужой сайт получает 403', res.status === 403);
check('и ничего не отправляется', sent.length === 0);

sent = [];
res = await post('/contact', { email: 'a@b.co', telegram: 'не-ник!', message: 'привет' });
check('кривой ник Telegram отклонён', res.status === 422 && (await res.json()).error === 'telegram_invalid');
check('и ничего не отправлено', sent.length === 0);

sent = [];
res = await post('/contact', { email: 'a@b.co', message: 'привет' });
check('без Telegram форма не принимается', res.status === 422);

console.log('\n— подписка на рассылку —');
sent = [];
res = await post('/subscribe', { email: 'reader@example.com' });
check('принята', res.status === 200);
check('адрес ушёл Анастасии', sent[0]?.text.includes('reader@example.com'));

console.log('\n— бот в Telegram —');
const update = (body, secret = 'shhh') =>
  worker.fetch(
    new Request('https://bot.example/telegram', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': secret },
      body: JSON.stringify(body),
    }),
    env,
  );

sent = [];
await update({ message: { chat: { id: 777 }, from: { id: 777, first_name: 'Пётр' }, text: '/start' } });
check('/start отвечает приветствием', sent[0]?.text.includes('бот Анастасии'));
check('и показывает кнопки с вопросами', sent[0]?.reply_markup?.inline_keyboard?.length === 6);

sent = [];
await update({ message: { chat: { id: 777 }, from: { id: 777 }, text: 'а сессии онлайн или очно?' } });
check('узнаёт вопрос из FAQ и отвечает сам', sent.length === 1 && sent[0].text.includes('онлайн'));
check('Анастасию не беспокоит', !sent.some((m) => String(m.chat_id) === '111'));

sent = [];
await update({ message: { chat: { id: 777 }, from: { id: 777, username: 'petr' }, text: 'а вы работаете с подростками?' } });
check('незнакомый вопрос уходит Анастасии', sent.some((m) => String(m.chat_id) === '111'));
check('с меткой отправителя для ответа', sent.find((m) => String(m.chat_id) === '111')?.text.includes('#u777'));
check('человеку сказали, что вопрос передан', sent.some((m) => String(m.chat_id) === '777' && m.text.includes('Передала')));

sent = [];
await update({
  message: {
    chat: { id: 111 },
    from: { id: 111 },
    text: 'Да, работаю. Напишите мне подробнее.',
    reply_to_message: { text: '❓ Вопрос боту от @petr #u777\n\nа вы работаете с подростками?' },
  },
});
check('ответ Анастасии доходит до автора вопроса',
  sent.some((m) => String(m.chat_id) === '777' && m.text.includes('Ответ от Анастасии')));
check('и ей подтверждают отправку', sent.some((m) => String(m.chat_id) === '111' && m.text.includes('Отправила')));

sent = [];
await update({ callback_query: { id: 'cb1', data: 'faq:2', message: { chat: { id: 777 } } } });
check('кнопка с вопросом присылает ответ', sent.some((m) => m.text?.includes('Как оплатить')));

sent = [];
res = await update({ message: { chat: { id: 777 }, text: '/start' } }, 'wrong-secret');
check('подделанный вебхук отклонён', res.status === 403);
check('и ничего не отправлено', sent.length === 0);

console.log(`\n${failures === 0 ? 'Все проверки пройдены.' : `ПРОВАЛЕНО: ${failures}`}`);
process.exit(failures === 0 ? 0 : 1);
