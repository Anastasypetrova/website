/**
 * Счётчик событий на сайте.
 *
 * Cloudflare Web Analytics считает визиты, но событий не умеет: ни нажатия,
 * ни прокрутку он не видит. Этот эндпоинт закрывает ровно эту дыру.
 *
 * Что пишется: что человек сделал, когда и откуда пришёл. Ничего, по чему
 * можно узнать человека: ни имени, ни почты, ни адреса, ни отпечатка браузера.
 * Имена и почты живут в таблице обращений — и только там.
 */
import { appendRow } from './sheet';
import type { Config } from './index';

/**
 * Эндпоинт открыт в интернет, поэтому принимаются только известные события:
 * иначе любой желающий накидает в таблицу произвольных строк.
 *
 * Простые события целиком перечислены здесь. Составные — вида «что:какое
 * именно», где «что» из второго списка, а «какое именно» обязано совпасть с
 * образцом: так добавление нового вопроса в FAQ или видео не требует правки
 * обработчика, а подставить туда произвольный текст всё равно нельзя.
 */
const SIMPLE = new Set([
  // кнопки форматов
  'samadhi-club',
  'personal-session',
  'mentorship',
  'mastermind',
  'forever-young',
  // блок клуба
  'club-audio',
  'club-reviews',
  'club-app',
  // остальное
  'formats-seen',
  'lang-en',
  'lang-ru',
  'telegram-subscribe',
  'youtube-all',
]);

const PREFIXED: Record<string, RegExp> = {
  faq: /^\d{1,2}$/,
  video: /^[a-z]{3,8}\d{1,2}$/,
  doc: /^[a-z-]{3,20}$/,
  social: /^(instagram|telegram|youtube)$/,
};

export function isTracked(event: string): boolean {
  if (SIMPLE.has(event)) return true;
  const [kind, detail, ...rest] = event.split(':');
  if (rest.length || !detail) return false;
  const shape = PREFIXED[kind];
  return Boolean(shape && shape.test(detail));
}

/** Откуда пришёл человек: метка ?from= со ссылки или домен-источник. */
function cleanSource(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  // не домен и не метка — значит мусор; длинное режем, чтобы в ячейку влезло
  return /^[\w.:/-]{0,80}$/.test(raw) ? raw : '';
}

export async function handleEvent(
  request: Request,
  cfg: Config,
  cors: Record<string, string>,
): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'bad json' }), { status: 400, headers: cors });
  }

  const event = String(body.event ?? '');
  if (!isTracked(event)) {
    return new Response(JSON.stringify({ ok: false, error: 'unknown event' }), { status: 400, headers: cors });
  }

  // Счётчик никогда не должен ломать страницу: даже если таблица недоступна,
  // ответ остаётся успешным — потерять один клик не страшно.
  try {
    await appendRow(cfg.sheetEndpoint, cfg.sheetSecret, {
      kind: 'event',
      email: '',
      outcome: event,
      message: cleanSource(body.source),
    });
  } catch {
    // проглочено намеренно
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cors });
}
