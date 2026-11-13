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

interface Group {
  count?: number;
  sum?: { visits?: number };
  dimensions?: Record<string, string>;
}

interface Breakdowns {
  byDay?: Group[];
  byReferer?: Group[];
  byCountry?: Group[];
  byDevice?: Group[];
}

/** Группы Cloudflare — в простые пары «подпись → число». */
function pairs(groups: Group[] | undefined, key: string): { name: string; visits: number }[] {
  return (groups ?? [])
    .map((g) => ({ name: g.dimensions?.[key] || '—', visits: g.sum?.visits ?? g.count ?? 0 }))
    .filter((row) => row.visits > 0);
}

/**
 * Запрос собирается, а не лежит готовым: от двух вещей зависит его форма.
 *
 * `site` — фильтр по сайту. Без него запрос охватывает все сайты аккаунта,
 * что выглядит разумно, пока аккаунт один; но пустой ответ без ошибки — ровно
 * то, чем это оборачивается, если аналитика ждёт именно siteTag. Поэтому
 * спрашиваем обоими способами и смотрим, какой ответил.
 *
 * `full` — разрезы по источникам, странам и устройствам. Схема аналитики
 * местами расходится с документацией, и одно незнакомое поле роняет запрос
 * целиком, так что короткая форма существует отдельно: лучше голые цифры по
 * дням, чем пустота.
 */
function visitsQuery(site: boolean, full: boolean): string {
  const vars = site
    ? '($account: String!, $site: String!, $since: Time!, $until: Time!)'
    : '($account: String!, $since: Time!, $until: Time!)';
  const where = site
    ? '{ siteTag: $site, datetime_geq: $since, datetime_leq: $until }'
    : '{ datetime_geq: $since, datetime_leq: $until }';

  const cut = (name: string, dimension: string, limit: number) => `
      ${name}: rumPageloadEventsAdaptiveGroups(
        limit: ${limit}
        filter: ${where}
        orderBy: [sum_visits_DESC]
      ) {
        sum { visits }
        dimensions { ${dimension} }
      }`;

  return `
query ${vars} {
  viewer {
    accounts(filter: { accountTag: $account }) {
      byDay: rumPageloadEventsAdaptiveGroups(
        limit: 400
        filter: ${where}
        ${full ? 'orderBy: [date_ASC]' : ''}
      ) {
        count
        sum { visits }
        dimensions { date }
      }${
        full
          ? cut('byReferer', 'refererHost', 12) + cut('byCountry', 'countryName', 12) + cut('byDevice', 'deviceType', 6)
          : ''
      }
    }
  }
}`;
}

/** Сайты, которые видит токен: tag — то, чем аналитика их различает. */
async function rumSites(cfg: Config, account: string): Promise<{ tag: string; hosts: string[] }[]> {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/rum/site_info/list`, {
    headers: { authorization: `Bearer ${cfg.cfToken}` },
  });
  const body = (await res.json().catch(() => ({}))) as {
    result?: { site_tag?: string; rules?: { host?: string }[] }[];
    errors?: { message?: string }[];
  };
  if (!res.ok) throw new Error(body.errors?.[0]?.message ?? `ответ ${res.status}`);
  return (body.result ?? []).map((site) => ({
    tag: site.site_tag ?? '',
    hosts: (site.rules ?? []).map((rule) => rule.host ?? '').filter(Boolean),
  }));
}

interface Shot {
  site: string;
  shape: 'полный' | 'короткий';
  rows: number;
  visits: number;
  error: string | null;
  data: Breakdowns | null;
}

/** Один заход: задать вопрос в заданной форме и записать, что получилось. */
async function shoot(cfg: Config, vars: Record<string, string>, site: string, full: boolean): Promise<Shot> {
  const shape: Shot['shape'] = full ? 'полный' : 'короткий';
  try {
    const body = await graphql(cfg.cfToken, visitsQuery(Boolean(site), full), vars);
    const acc = (body.data?.viewer?.accounts ?? [])[0] as Breakdowns | undefined;
    const rows = acc?.byDay ?? [];
    return {
      site,
      shape,
      rows: rows.length,
      visits: rows.reduce((n, g) => n + (g.sum?.visits ?? 0), 0),
      error: null,
      data: acc ?? null,
    };
  } catch (error) {
    return { site, shape, rows: 0, visits: 0, error: why(error), data: null };
  }
}

/**
 * Порядок проб: сначала самый вероятный ответ, потом всё менее вероятные.
 * Берётся первая проба с непустым ответом; если все пусты — последняя удачная,
 * и тогда в `note` написано, что именно пробовали.
 */
async function probeVisits(cfg: Config, days: number): Promise<{ account: string; shots: Shot[] }> {
  const account = await accountTag(cfg);
  const until = new Date();
  const since = new Date(until.getTime() - (days - 1) * 86400000);
  since.setUTCHours(0, 0, 0, 0);

  const base = { account, since: since.toISOString(), until: until.toISOString() };
  const withSite = { ...base, site: cfg.cfSiteTag };

  const shots: Shot[] = [];
  const plan: [string, boolean][] = cfg.cfSiteTag
    ? [
        [cfg.cfSiteTag, true],
        ['', true],
        [cfg.cfSiteTag, false],
        ['', false],
      ]
    : [
        ['', true],
        ['', false],
      ];

  for (const [site, full] of plan) {
    const shot = await shoot(cfg, site ? withSite : base, site, full);
    shots.push(shot);
    if (shot.rows > 0) break;
  }

  return { account, shots };
}

async function cloudflareVisits(cfg: Config, days: number): Promise<unknown> {
  if (!cfg.cfToken) throw new Error('нет токена Cloudflare');

  const { shots } = await probeVisits(cfg, days);
  const good = shots.find((s) => s.rows > 0) ?? shots.find((s) => !s.error);
  if (!good) throw new Error(shots.map((s) => `${s.shape}: ${s.error}`).join('; '));

  const acc = good.data ?? {};
  const byDay = (acc.byDay ?? []).map((g) => ({
    date: g.dimensions?.date ?? '',
    visits: g.sum?.visits ?? 0,
    views: g.count ?? 0,
  }));

  const notes: string[] = [];
  if (good.shape === 'короткий') notes.push('разрезы по источникам и странам не получились');
  if (byDay.length === 0) {
    notes.push(
      `Cloudflare не вернул ни одной строки. Пробовали: ${shots
        .map((s) => `${s.shape}${s.site ? ' с сайтом' : ' без сайта'} → ${s.error ?? 'пусто'}`)
        .join('; ')}`,
    );
  }

  return {
    visits: byDay.reduce((n, d) => n + d.visits, 0),
    views: byDay.reduce((n, d) => n + d.views, 0),
    byDay,
    referers: pairs(acc.byReferer, 'refererHost'),
    countries: pairs(acc.byCountry, 'countryName'),
    devices: pairs(acc.byDevice, 'deviceType'),
    note: notes.length ? notes.join('. ') : null,
  };
}

/** Режим осмотра: что видит токен. Включается `?probe=1`, за тем же ключом. */
async function probeReport(cfg: Config, days: number): Promise<unknown> {
  if (!cfg.cfToken) return { error: 'нет токена Cloudflare' };

  const account = await attempt(() => accountTag(cfg));
  if (!account.data) return { accountError: account.error };

  const sites = await attempt(() => rumSites(cfg, account.data as string));
  const runs = await attempt(() => probeVisits(cfg, days));

  return {
    account: account.data,
    siteTagВНастройках: cfg.cfSiteTag || '(пусто)',
    сайтыТокена: sites.data,
    сайтыОшибка: sites.error,
    пробы: (runs.data?.shots ?? []).map((s) => ({
      сайт: s.site || '(без фильтра)',
      форма: s.shape,
      строк: s.rows,
      визитов: s.visits,
      ошибка: s.error,
    })),
    пробыОшибка: runs.error,
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

  if (url.searchParams.get('probe')) {
    return reply({ ok: true, probe: await probeReport(cfg, days) });
  }

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
