/**
 * Сводка для дашборда: `GET /stats?key=…&days=N`.
 *
 * Две цифры живут в разных местах. Визиты считает Cloudflare Web Analytics —
 * их отдаёт его GraphQL. Нажатия лежат в таблице на Диске — их считает сам
 * Apps Script и присылает уже итогами, а не строками. Этот эндпоинт склеивает
 * оба ответа в один, чтобы страница делала один запрос и не знала ни одного
 * пароля.
 *
 * Отдаётся только обезличенное: количества по дням, названиям событий,
 * источникам и странам. Ни имени, ни почты, ни чьего-либо адреса — те живут в
 * таблице обращений и наружу не выходят.
 */
import type { Config } from './index';

const HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  // Дашборд открывается не с её домена (приватная страница, телефон), а данные
  // здесь обезличены и закрыты ключом, так что origin не ограничиваем.
  'access-control-allow-origin': '*',
  'cache-control': 'no-store',
};

const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: HEADERS });

/** Что ушло не так — текстом, а не молчанием: дашборд это показывает. */
interface Part<T> {
  data: T | null;
  error: string | null;
}

async function attempt<T>(work: () => Promise<T>): Promise<Part<T>> {
  try {
    return { data: await work(), error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

/* ---- нажатия: из таблицы ------------------------------------------------- */

async function sheetStats(cfg: Config, days: number): Promise<unknown> {
  if (!cfg.sheetEndpoint || !cfg.sheetSecret) throw new Error('таблица не настроена');

  const url = `${cfg.sheetEndpoint}?action=stats&days=${days}&secret=${encodeURIComponent(cfg.sheetSecret)}`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`таблица ответила ${res.status}`);

  const text = await res.text();
  let body: { ok?: boolean; error?: string };
  try {
    body = JSON.parse(text) as typeof body;
  } catch {
    // Самый частый случай: развёрнута старая версия скрипта, которая на GET
    // отдаёт HTML-страницу ошибки вместо JSON.
    throw new Error('таблица ответила не JSON — обнови скрипт таблицы');
  }
  if (!body.ok) throw new Error(body.error || 'таблица отказала');
  return body;
}

/* ---- визиты: из Cloudflare ----------------------------------------------- */

const GRAPHQL = 'https://api.cloudflare.com/client/v4/graphql';

interface GqlAnswer {
  data?: { viewer?: { accounts?: Record<string, unknown>[] } } | null;
  errors?: { message?: string }[] | null;
}

async function graphql(token: string, query: string, variables: Record<string, unknown>): Promise<GqlAnswer> {
  const res = await fetch(GRAPHQL, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const body = (await res.json().catch(() => ({}))) as GqlAnswer;
  if (!res.ok) {
    const first = body.errors?.[0]?.message;
    throw new Error(first ? `Cloudflare: ${first}` : `Cloudflare ответил ${res.status}`);
  }
  if (body.errors?.length) throw new Error(`Cloudflare: ${body.errors[0]?.message ?? 'ошибка запроса'}`);
  return body;
}

const why = (error: unknown) => (error instanceof Error ? error.message : String(error));

/**
 * Номер аккаунта можно не вписывать руками: токен сам знает, к чему он выдан.
 *
 * Два пути, потому что схема Cloudflare местами расходится с документацией, а
 * проверять её можно только через её же ответы: если GraphQL отказал, тот же
 * вопрос задаётся обычным REST. Неудача каждого пути сохраняется и попадает в
 * сообщение целиком — чтобы один заход в настройки отвечал на вопрос «почему»,
 * а не рождал следующий.
 */
async function accountTag(cfg: Config): Promise<string> {
  if (cfg.cfAccount) return cfg.cfAccount;

  const tried: string[] = [];

  try {
    const body = await graphql(cfg.cfToken, '{ viewer { accounts { accountTag } } }', {});
    const list = body.data?.viewer?.accounts ?? [];
    if (list.length > 1) throw new Error('у токена несколько аккаунтов — впиши номер в CF_ACCOUNT_ID');
    const tag = (list[0] as { accountTag?: string } | undefined)?.accountTag;
    if (tag) return tag;
    tried.push('GraphQL вернул пустой список аккаунтов');
  } catch (error) {
    tried.push(`GraphQL: ${why(error)}`);
  }

  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/accounts?per_page=5', {
      headers: { authorization: `Bearer ${cfg.cfToken}` },
    });
    const body = (await res.json().catch(() => ({}))) as {
      result?: { id?: string }[];
      errors?: { message?: string }[];
    };
    const list = body.result ?? [];
    if (list.length > 1) throw new Error('у токена несколько аккаунтов — впиши номер в CF_ACCOUNT_ID');
    if (list[0]?.id) return list[0].id as string;
    tried.push(`REST: ${body.errors?.[0]?.message ?? `ответ ${res.status}`}`);
  } catch (error) {
    tried.push(`REST: ${why(error)}`);
  }

  throw new Error(`не удалось определить номер аккаунта (${tried.join('; ')}) — впиши его в CF_ACCOUNT_ID`);
}

/**
 * Один запрос, четыре разреза. Фильтр по сайту не ставим: в аккаунте один
 * сайт, а лишняя настройка — лишний повод для опечатки.
 */
const VISITS_QUERY = `
query ($account: String!, $since: Time!, $until: Time!) {
  viewer {
    accounts(filter: { accountTag: $account }) {
      byDay: rumPageloadEventsAdaptiveGroups(
        limit: 400
        filter: { datetime_geq: $since, datetime_leq: $until }
        orderBy: [date_ASC]
      ) {
        count
        sum { visits }
        dimensions { date }
      }
      byReferer: rumPageloadEventsAdaptiveGroups(
        limit: 12
        filter: { datetime_geq: $since, datetime_leq: $until }
        orderBy: [sum_visits_DESC]
      ) {
        sum { visits }
        dimensions { refererHost }
      }
      byCountry: rumPageloadEventsAdaptiveGroups(
        limit: 12
        filter: { datetime_geq: $since, datetime_leq: $until }
        orderBy: [sum_visits_DESC]
      ) {
        sum { visits }
        dimensions { countryName }
      }
      byDevice: rumPageloadEventsAdaptiveGroups(
        limit: 6
        filter: { datetime_geq: $since, datetime_leq: $until }
        orderBy: [sum_visits_DESC]
      ) {
        sum { visits }
        dimensions { deviceType }
      }
    }
  }
}`;

interface Group {
  count?: number;
  sum?: { visits?: number };
  dimensions?: Record<string, string>;
}

/** Группы Cloudflare — в простые пары «подпись → число». */
function pairs(groups: Group[] | undefined, key: string): { name: string; visits: number }[] {
  return (groups ?? [])
    .map((g) => ({ name: g.dimensions?.[key] || '—', visits: g.sum?.visits ?? g.count ?? 0 }))
    .filter((row) => row.visits > 0);
}

/**
 * Запасной запрос: только дни, без разрезов и без сортировки.
 *
 * Схема аналитики Cloudflare местами отличается от написанного в документации,
 * и одно незнакомое поле роняет весь запрос целиком. Пусть лучше дашборд
 * покажет голые цифры по дням и скажет, чего не хватило, чем промолчит обо всём.
 */
const VISITS_MINIMAL = `
query ($account: String!, $since: Time!, $until: Time!) {
  viewer {
    accounts(filter: { accountTag: $account }) {
      byDay: rumPageloadEventsAdaptiveGroups(
        limit: 400
        filter: { datetime_geq: $since, datetime_leq: $until }
      ) {
        count
        sum { visits }
        dimensions { date }
      }
    }
  }
}`;

interface Breakdowns {
  byDay?: Group[];
  byReferer?: Group[];
  byCountry?: Group[];
  byDevice?: Group[];
}

async function cloudflareVisits(cfg: Config, days: number): Promise<unknown> {
  if (!cfg.cfToken) throw new Error('нет токена Cloudflare');

  const account = await accountTag(cfg);
  const until = new Date();
  const since = new Date(until.getTime() - (days - 1) * 86400000);
  since.setUTCHours(0, 0, 0, 0);

  const vars = { account, since: since.toISOString(), until: until.toISOString() };

  let note: string | null = null;
  let body: GqlAnswer;
  try {
    body = await graphql(cfg.cfToken, VISITS_QUERY, vars);
  } catch (error) {
    body = await graphql(cfg.cfToken, VISITS_MINIMAL, vars);
    note = `разрезы не получились (${why(error)}) — показаны только визиты по дням`;
  }

  const acc = (body.data?.viewer?.accounts ?? [])[0] as Breakdowns | undefined;
  if (!acc) throw new Error('Cloudflare не вернул данных по аккаунту');

  const byDay = (acc.byDay ?? []).map((g) => ({
    date: g.dimensions?.date ?? '',
    visits: g.sum?.visits ?? 0,
    views: g.count ?? 0,
  }));

  return {
    visits: byDay.reduce((n, d) => n + d.visits, 0),
    views: byDay.reduce((n, d) => n + d.views, 0),
    byDay,
    referers: pairs(acc.byReferer, 'refererHost'),
    countries: pairs(acc.byCountry, 'countryName'),
    devices: pairs(acc.byDevice, 'deviceType'),
    note,
  };
}

/* ---- сам эндпоинт -------------------------------------------------------- */

export async function handleStats(url: URL, cfg: Config): Promise<Response> {
  // Пока ключ не задан, эндпоинта как будто нет: включается он одной
  // переменной, а не правкой кода.
  if (!cfg.statsKey) return reply({ ok: false, error: 'дашборд не включён: нет STATS_KEY' }, 503);
  if (url.searchParams.get('key') !== cfg.statsKey) return reply({ ok: false, error: 'forbidden' }, 403);

  const asked = Number(url.searchParams.get('days') ?? '30');
  const days = Math.min(Math.max(Number.isFinite(asked) ? Math.trunc(asked) : 30, 1), 3650);

  // Два источника независимы: упавшая Cloudflare не должна прятать нажатия.
  const [clicks, visits] = await Promise.all([
    attempt(() => sheetStats(cfg, days)),
    attempt(() => cloudflareVisits(cfg, days)),
  ]);

  return reply({
    ok: true,
    days,
    at: new Date().toISOString(),
    clicks: clicks.data,
    clicksError: clicks.error,
    visits: visits.data,
    visitsError: visits.error,
  });
}
