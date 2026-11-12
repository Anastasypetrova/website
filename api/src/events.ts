/**
 * Счётчик кликов по кнопкам форматов.
 *
 * Cloudflare Web Analytics считает визиты, но событий не умеет: нажатие на
 * кнопку он не видит. Этот эндпоинт закрывает ровно эту дыру и ничего больше.
 *
 * Что пишется: что нажали, когда и откуда человек пришёл. Ничего, по чему
 * можно узнать человека: ни имени, ни почты, ни адреса, ни отпечатка браузера.
 * Имена и почты живут в таблице обращений — и только там.
 */
import { appendRow } from './sheet';
import type { Config } from './index';

/**
 * Белый список. Иначе любой желающий сможет накидать в таблицу произвольных
 * строк: эндпоинт открыт наружу, как и всё остальное на сайте.
 */
const TRACKED = [
  'samadhi-club',
  'personal-session',
  'mentorship',
  'mastermind',
  'forever-young',
] as const;

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
  if (!TRACKED.includes(event as (typeof TRACKED)[number])) {
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
