/**
 * Exercises the Worker against stubbed OpenAI, Resend and Google Sheets.
 * No keys, no network, nothing sent anywhere.
 *
 *   node api/test.mjs
 */
import { build } from 'vite';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const DIR = 'node_modules/.tmp/api-test';
await build({ logLevel: 'error', build: { ssr: 'api/src/index.ts', outDir: DIR, emptyOutDir: true } });
const worker = (await import(pathToFileURL(resolve(DIR, 'index.js')).href)).default;

const env = {
  OPENAI_API_KEY: 'sk-test',
  RESEND_API_KEY: 're_test',
  SHEET_ENDPOINT: 'https://script.google.com/test',
  SHEET_SECRET: 'sheet-secret',
  FROM_EMAIL: 'Анастасия Петрова <hello@anastasia-samadhi.club>',
  REPLY_TO: 'hello@metasouls.co',
  NOTIFY_TO: 'hello@metasouls.co',
  ALLOWED_ORIGINS: 'https://anastasia-samadhi.club',
  SITE_URL: 'https://anastasia-samadhi.club',
  OPENAI_MODEL: 'gpt-4o-mini',
};

// --- stubs -----------------------------------------------------------------
let rows = [];
let letters = [];
let prompts = [];
let stub = {};

globalThis.fetch = async (url, init) => {
  const target = String(url);
  const body = init?.body ? JSON.parse(init.body) : {};

  if (target.includes('openai.com')) {
    prompts.push(body);
    if (stub.openaiFails) return new Response('boom', { status: 500 });
    return new Response(
      JSON.stringify({ choices: [{ message: { content: JSON.stringify(stub.draft) } }] }),
      { headers: { 'content-type': 'application/json' } },
    );
  }
  if (target.includes('resend.com')) {
    if (stub.resendFails) return new Response('nope', { status: 422 });
    letters.push(body);
    return new Response(JSON.stringify({ id: 'x' }), { headers: { 'content-type': 'application/json' } });
  }
  if (target.includes('script.google.com')) {
    if (stub.sheetFails) return new Response('down', { status: 500 });
    rows.push(body);
    return new Response('{"ok":true}', { headers: { 'content-type': 'application/json' } });
  }
  throw new Error(`unexpected call to ${target}`);
};

let failures = 0;
const check = (label, ok) => {
  if (!ok) failures++;
  console.log(`${ok ? '✓' : '✗'} ${label}`);
};

const reset = (draft = { relevant: true, reply: 'Здравствуйте!\n\nСпасибо за письмо. Посмотрите раздел про клуб на сайте.\n\nАнастасия' }) => {
  rows = []; letters = []; prompts = [];
  stub = { draft };
};

const post = (path, body, origin = 'https://anastasia-samadhi.club') =>
  worker.fetch(
    new Request(`https://api.example${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin },
      body: JSON.stringify(body),
    }),
    env,
  );

const FULL = { name: 'Тестовый Пользователь', email: 'qa-fixture@example.com', telegram: '@qa_fixture_account', message: 'Расскажите про клуб' };
const to = (addr) => letters.find((l) => l.to?.[0] === addr);

// --- вопрос по теме --------------------------------------------------------
console.log('\n— вопрос по теме —');
reset();
let res = await post('/contact', FULL);
check('форма принята', res.status === 200 && (await res.json()).ok);
check('строка записана в таблицу', rows.length === 1);
check('в строке ФИО, email, telegram и текст',
  rows[0].name === 'Тестовый Пользователь' && rows[0].email === 'qa-fixture@example.com' &&
  rows[0].telegram === '@qa_fixture_account' && rows[0].message === 'Расскажите про клуб');
check('таблица защищена паролем', rows[0].secret === 'sheet-secret');
check('в таблице отмечено, что автоответ ушёл', rows[0].outcome === 'отправлен');
check('человеку ушло письмо', Boolean(to('qa-fixture@example.com')));
check('письмо с адреса сайта', to('qa-fixture@example.com')?.from.includes('hello@anastasia-samadhi.club'));
check('ответ придёт на почту, которую читает Анастасия', to('qa-fixture@example.com')?.reply_to === 'hello@metasouls.co');
check('в письме есть и текст, и вёрстка', Boolean(to('qa-fixture@example.com')?.text && to('qa-fixture@example.com')?.html));
check('Анастасии ушло уведомление', Boolean(to('hello@metasouls.co')));
check('в уведомлении есть копия того, что ушло от её имени',
  to('hello@metasouls.co')?.text.includes('Что ушло от вашего имени'));
check('модели передали справку о сайте',
  prompts[0]?.messages?.[1]?.content.includes('Samadhi Club') &&
  prompts[0]?.messages?.[1]?.content.includes('Мастермайнд'));
check('модели запрещено называть цены', prompts[0]?.messages?.[0]?.content.includes('НИКОГДА не называй цены'));
check('ответ просят строго в JSON', prompts[0]?.response_format?.type === 'json_object');

// --- вопрос не по теме -----------------------------------------------------
console.log('\n— вопрос не по теме —');
reset({ relevant: false, reply: '' });
res = await post('/contact', { ...FULL, message: 'Куплю ссылки, размещу рекламу, ответьте' });
check('форма всё равно принята', res.status === 200);
check('человеку ничего не отправлено', !to('qa-fixture@example.com'));
check('но запись в таблице есть', rows.length === 1 && rows[0].outcome.includes('не по теме'));
check('и Анастасия всё равно уведомлена', Boolean(to('hello@metasouls.co')));

// --- пустой ответ модели считается «не отвечать» ----------------------------
console.log('\n— модель вернула пустой ответ —');
reset({ relevant: true, reply: '   ' });
await post('/contact', FULL);
check('пустое письмо не уходит', !to('qa-fixture@example.com'));
check('в таблице отмечено как не по теме', rows[0].outcome.includes('не по теме'));

// --- отказы внешних сервисов ------------------------------------------------
console.log('\n— когда внешний сервис недоступен —');
reset();
stub.openaiFails = true;
res = await post('/contact', FULL);
check('модель упала: форма всё равно принята', res.status === 200);
check('обращение не потеряно — записано в таблицу', rows.length === 1);
check('в таблице просьба ответить самой', rows[0].outcome.includes('ответьте сами'));
check('Анастасия уведомлена', Boolean(to('hello@metasouls.co')));

reset();
stub.sheetFails = true;
res = await post('/contact', FULL);
check('таблица упала: форма всё равно принята', res.status === 200);
check('письмо человеку всё равно ушло', Boolean(to('qa-fixture@example.com')));
check('в уведомлении предупреждение записать вручную',
  to('hello@metasouls.co')?.text.includes('вручную'));

reset();
stub.resendFails = true;
res = await post('/contact', FULL);
check('почта упала: форма всё равно принята', res.status === 200);
check('обращение записано в таблицу', rows.length === 1 && rows[0].outcome.includes('не удалось отправить'));

// --- проверки ввода ---------------------------------------------------------
console.log('\n— проверки ввода —');
reset();
res = await post('/contact', { ...FULL, email: 'без-собаки' });
check('кривой email отклонён', res.status === 422 && (await res.json()).error === 'email_invalid');
check('ничего никуда не ушло', rows.length === 0 && letters.length === 0);

reset();
res = await post('/contact', { ...FULL, telegram: 'ой!' });
check('кривой Telegram отклонён', res.status === 422 && (await res.json()).error === 'telegram_invalid');

reset();
res = await post('/contact', { ...FULL, message: '' });
check('пустой вопрос отклонён', res.status === 422);

reset();
res = await post('/contact', { ...FULL, website: 'http://spam' });
check('спам-бот получает 200 и тишину', res.status === 200 && rows.length === 0 && letters.length === 0);

reset();
res = await post('/contact', FULL, 'https://evil.example');
check('чужой сайт получает 403', res.status === 403);
check('и ничего не происходит', rows.length === 0 && letters.length === 0);

// --- подписка ---------------------------------------------------------------
console.log('\n— подписка на рассылку —');
reset();
res = await post('/subscribe', { email: 'reader@example.com' });
check('принята', res.status === 200);
check('адрес записан в таблицу как подписка',
  rows.length === 1 && rows[0].kind === 'subscribe' && rows[0].email === 'reader@example.com');
check('модель не вызывалась', prompts.length === 0);
check('Анастасия уведомлена', Boolean(to('hello@metasouls.co')));

reset();
res = await post('/subscribe', { email: 'нет' });
check('кривой адрес отклонён', res.status === 422);

// --- только четыре секрета, остальное по умолчанию -------------------------
console.log('\n— настроены только четыре секрета —');
const bare = {
  OPENAI_API_KEY: 'sk-test',
  RESEND_API_KEY: 're_test',
  SHEET_ENDPOINT: 'https://script.google.com/test',
  SHEET_SECRET: 'sheet-secret',
};
reset();
res = await worker.fetch(
  new Request('https://api.example/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://anastasia-samadhi.club' },
    body: JSON.stringify(FULL),
  }),
  bare,
);
check('форма работает без остальных переменных', res.status === 200);
check('отправитель подставлен по умолчанию',
  to('qa-fixture@example.com')?.from === 'Анастасия Петрова <hello@anastasia-samadhi.club>');
check('ответы пойдут на hello@metasouls.co', to('qa-fixture@example.com')?.reply_to === 'hello@metasouls.co');
check('уведомление ушло на hello@metasouls.co', Boolean(to('hello@metasouls.co')));
check('модель по умолчанию gpt-4o-mini', prompts[0]?.model === 'gpt-4o-mini');
check('строка записана в таблицу', rows.length === 1);

reset();
res = await worker.fetch(
  new Request('https://api.example/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://evil.example' },
    body: JSON.stringify(FULL),
  }),
  bare,
);
check('и чужой сайт по-прежнему получает 403', res.status === 403);

console.log(`\n${failures === 0 ? 'Все проверки пройдены.' : `ПРОВАЛЕНО: ${failures}`}`);
process.exit(failures === 0 ? 0 : 1);
