/**
 * Дашборд: `#/stats` — что происходит на сайте, одной страницей.
 *
 * Эта страница не для посетителей. Она лежит на сайте только потому, что
 * браузеру проще всего спрашивать обработчик с того же домена, и грузится
 * отдельным куском: кто открыл обычную страницу, этот код не скачивает.
 *
 * Ключ хранится в браузере, а не в коде: страница публичная, и зашитый в неё
 * пароль был бы паролем, написанным на входной двери. Без ключа обработчик
 * отвечает «forbidden», и показывать тут нечего.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../api';
import './dashboard.css';

const KEY_STORE = 'ap_stats_key';

interface Periods {
  label: string;
  days: number;
}

const PERIODS: Periods[] = [
  { label: 'Сегодня', days: 1 },
  { label: '7 дней', days: 7 },
  { label: '30 дней', days: 30 },
  { label: 'Всё время', days: 3650 },
];

interface Step {
  all: number;
  mobile: number;
}

interface Clicks {
  total: number;
  byDay: Record<string, number>;
  byEvent: Record<string, number>;
  bySource: Record<string, number>;
  contacts: number;
  firstDay: string;
  totalAllTime: number;
  tz: string;
  /** Появилось с версией 10 обработчика — у старых данных этих полей нет. */
  byDevice?: Record<string, number>;
  byPage?: Record<string, number>;
  sections?: Record<string, number>;
  depth?: Record<string, number>;
  funnel?: { formats: Step; price: Step; consent: Step; pay: Step };
}

interface Named {
  name: string;
  visits: number;
}

interface Visits {
  visits: number;
  views: number;
  byDay: { date: string; visits: number; views: number }[];
  referers: Named[];
  countries: Named[];
  devices: Named[];
  /** Чего Cloudflare не отдал: не ошибка, но и не тишина. */
  note?: string | null;
}

interface Stats {
  ok: boolean;
  days: number;
  at: string;
  clicks: Clicks | null;
  clicksError: string | null;
  visits: Visits | null;
  visitsError: string | null;
}

/* ---- мелкие помощники ---------------------------------------------------- */

const nf = new Intl.NumberFormat('ru-RU');

/** Дни периода слева направо, включая сегодняшний: ось одна для всех графиков. */
function axis(days: number, firstDay: string): string[] {
  const today = new Date();
  const start = new Date(today.getTime() - (days - 1) * 86400000);
  // «Всё время» — от первого события, иначе ось уходит на десять лет назад
  const from = firstDay && days > 400 ? new Date(`${firstDay}T00:00:00`) : start;
  const out: string[] = [];
  for (let d = new Date(from); d <= today && out.length < 400; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out.length ? out : [today.toISOString().slice(0, 10)];
}

const dayLabel = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

/**
 * Пустой источник — это не «неизвестно», а «пришли напрямую»: браузер не
 * сообщает источник, когда адрес набрали руками, открыли из закладок или
 * перешли из приложения вроде Telegram. Прочерк в этой строке только пугает.
 */
function named(rows: Named[] | undefined): Named[] {
  return (rows ?? []).map((r) => (r.name === '—' ? { ...r, name: 'напрямую' } : r));
}

/** Коды разделов и страниц — в то, как они называются на сайте. */
const SECTION_NAMES: Record<string, string> = {
  club: 'Samadhi Club',
  'personal-session': 'Личная консультация',
  mentorship: 'Менторство',
  mastermind: 'Мастермайнд',
  'forever-young': 'Forever Young',
  reviews: 'Отзывы',
  videos: 'Видео',
  about: 'Обо мне',
  faq: 'Вопросы',
  contacts: 'Контакты',
};

const DEPTH_NAMES: Record<string, string> = {
  '25': 'Четверть страницы',
  '50': 'Половина',
  '75': 'Три четверти',
  '100': 'До конца',
};

function renamed(map: Record<string, number> | undefined, names: Record<string, string>): Named[] {
  return sorted(map).map((r) => ({ ...r, name: names[r.name] ?? r.name }));
}

function pages(map: Record<string, number> | undefined): Named[] {
  return sorted(map).map((r) => ({ ...r, name: r.name === '/' ? 'главная' : r.name }));
}

function sorted(map: Record<string, number> | undefined): Named[] {
  return Object.entries(map ?? {})
    .map(([name, visits]) => ({ name, visits }))
    .sort((a, b) => b.visits - a.visits);
}

/* ---- части страницы ------------------------------------------------------ */

/**
 * Воронка: не «сколько нажали», а где именно теряются люди.
 *
 * Первая ступень приходит из Cloudflare, остальные — из таблицы: это разные
 * системы, и сравнивать их в лоб можно только по порядку величины. Зато
 * ступени между собой считаются одинаково, и переход от одной к другой —
 * честное число.
 */
function Funnel({ visits, funnel }: { visits: number | null; funnel?: Clicks['funnel'] }) {
  if (!funnel) {
    return (
      <div className="dash-card">
        <div className="dash-card-head"><h2>Воронка</h2></div>
        <p className="dash-empty">
          Эти данные начинает собирать десятая версия обработчика. Если она уже стоит —
          числа появятся, как только кто-нибудь зайдёт на сайт.
        </p>
      </div>
    );
  }

  const steps: { name: string; all: number | null; mobile: number | null }[] = [
    { name: 'Зашли на сайт', all: visits, mobile: null },
    { name: 'Долистали до форматов', all: funnel.formats.all, mobile: funnel.formats.mobile },
    { name: 'Увидели цену', all: funnel.price.all, mobile: funnel.price.mobile },
    { name: 'Поставили галочку', all: funnel.consent.all, mobile: funnel.consent.mobile },
    { name: 'Нажали оплату', all: funnel.pay.all, mobile: funnel.pay.mobile },
  ];

  const top = Math.max(1, ...steps.map((s) => s.all ?? 0));
  const lost = funnel.consent.all - funnel.pay.all;

  return (
    <div className="dash-card">
      <div className="dash-card-head">
        <h2>Воронка</h2>
        <span className="dash-card-sum">{nf.format(funnel.pay.all)} до оплаты</span>
      </div>
      <table className="dash-rows dash-funnel">
        <thead>
          <tr>
            <th>Шаг</th>
            <th className="dash-rows-n">Всего</th>
            <th className="dash-rows-n">Телефон</th>
            <th className="dash-rows-n">Дошли</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step, i) => {
            const prev = i > 0 ? steps[i - 1].all : null;
            const share = prev && step.all !== null && prev > 0 ? Math.round((step.all / prev) * 100) : null;
            return (
              <tr key={step.name}>
                <td>
                  <span className="dash-fn-name">{step.name}</span>
                  <span className="dash-fn-bar" aria-hidden="true">
                    <span style={{ width: `${((step.all ?? 0) / top) * 100}%` }} />
                  </span>
                </td>
                <td className="dash-rows-n">{step.all === null ? '—' : nf.format(step.all)}</td>
                <td className="dash-rows-n">{step.mobile === null ? '—' : nf.format(step.mobile)}</td>
                <td className="dash-rows-n">{share === null ? '—' : `${share}%`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="dash-note" style={{ marginTop: 14 }}>
        {lost > 0
          ? `Поставили галочку и не нажали кнопку: ${nf.format(lost)}. Это люди, которые всё прочитали и согласились — и передумали на последнем шаге.`
          : 'Все, кто поставил галочку, нажали кнопку.'}
        {' '}Первая ступень — из Cloudflare, остальные — из таблицы: системы разные,
        поэтому сравнивать их стоит по порядку величины, а не до единицы.
      </p>
    </div>
  );
}

function Tile({ value, label, note }: { value: number | null; label: string; note?: string }) {
  return (
    <div className="dash-tile">
      <div className="dash-tile-v">{value === null ? '—' : nf.format(value)}</div>
      <div className="dash-tile-l">{label}</div>
      {note ? <div className="dash-tile-n">{note}</div> : null}
    </div>
  );
}

/**
 * Столбики по дням. Одна величина на график: визиты и нажатия — числа разного
 * порядка, и в одной рамке меньшее из них превратилось бы в плинтус.
 */
function Bars({
  title,
  days,
  values,
  unit,
  error,
  note,
}: {
  title: string;
  days: string[];
  values: Record<string, number>;
  unit: string;
  error?: string | null;
  note?: string | null;
}) {
  const max = Math.max(1, ...days.map((d) => values[d] ?? 0));
  const peak = days.find((d) => (values[d] ?? 0) === max);
  const total = days.reduce((n, d) => n + (values[d] ?? 0), 0);

  return (
    <section className="dash-card">
      <div className="dash-card-head">
        <h2>{title}</h2>
        <span className="dash-card-sum">{nf.format(total)}</span>
      </div>

      {error ? (
        <p className="dash-err">{error}</p>
      ) : (
        <>
          <div className="dash-bars" role="img" aria-label={`${title}: всего ${total} ${unit}`}>
            {days.map((d) => {
              const v = values[d] ?? 0;
              return (
                <div
                  key={d}
                  className="dash-bar-slot"
                  title={`${dayLabel(d)} — ${nf.format(v)} ${unit}`}
                >
                  {d === peak && max > 0 ? <span className="dash-bar-peak">{nf.format(max)}</span> : null}
                  <span
                    className="dash-bar"
                    style={{ height: `${v === 0 ? 0 : Math.max(2, (v / max) * 100)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="dash-axis">
            <span>{dayLabel(days[0])}</span>
            <span>{dayLabel(days[days.length - 1])}</span>
          </div>
          {note ? <p className="dash-err" style={{ marginTop: 10 }}>{note}</p> : null}
        </>
      )}
    </section>
  );
}

function Rows({
  title,
  rows,
  unit,
  empty,
  error,
}: {
  title: string;
  rows: Named[];
  unit: string;
  empty: string;
  error?: string | null;
}) {
  const max = Math.max(1, ...rows.map((r) => r.visits));

  return (
    <section className="dash-card">
      <div className="dash-card-head">
        <h2>{title}</h2>
      </div>
      {error ? (
        <p className="dash-err">{error}</p>
      ) : rows.length === 0 ? (
        <p className="dash-empty">{empty}</p>
      ) : (
        <table className="dash-rows">
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <th scope="row">{r.name}</th>
                <td className="dash-rows-n">{nf.format(r.visits)}</td>
                <td className="dash-rows-b">
                  <span style={{ width: `${(r.visits / max) * 100}%` }} aria-hidden="true" />
                  <span className="dash-sr">{unit}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

/* ---- страница ------------------------------------------------------------ */

export default function Dashboard() {
  const [key, setKey] = useState<string>(() => {
    try {
      return localStorage.getItem(KEY_STORE) ?? '';
    } catch {
      return '';
    }
  });
  const [typed, setTyped] = useState('');
  const [days, setDays] = useState(7);
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!key) return;
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/stats?key=${encodeURIComponent(key)}&days=${days}`);
      if (res.status === 403) {
        setError('Ключ не подошёл.');
        setData(null);
        try {
          localStorage.removeItem(KEY_STORE);
        } catch {
          // приватный режим — просто не запомнится
        }
        setKey('');
        return;
      }
      const body = (await res.json()) as Stats & { error?: string };
      if (!body.ok) {
        setError(body.error || 'Обработчик отказал.');
        setData(null);
        return;
      }
      setError(null);
      setData(body);
    } catch {
      setError('Не удалось связаться с обработчиком.');
    } finally {
      setBusy(false);
    }
  }, [key, days]);

  useEffect(() => {
    void load();
    // Сама подтягивается, пока страница открыта: дашборд держат открытым, а не
    // перезагружают.
    const timer = setInterval(() => void load(), 60000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    document.title = 'Статистика — anastasia-samadhi.club';
  }, []);

  const saveKey = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    try {
      localStorage.setItem(KEY_STORE, clean);
    } catch {
      // ignore
    }
    setKey(clean);
    setError(null);
  };

  const columns = useMemo(() => {
    if (!data) return null;
    const dayList = axis(data.days, data.clicks?.firstDay ?? '');
    const visitsByDay: Record<string, number> = {};
    const viewsTotal = data.visits?.views ?? null;
    for (const row of data.visits?.byDay ?? []) {
      visitsByDay[row.date.slice(0, 10)] = (visitsByDay[row.date.slice(0, 10)] ?? 0) + row.visits;
    }
    return { dayList, visitsByDay, viewsTotal };
  }, [data]);

  if (!key) {
    return (
      <main className="dash dash-gate">
        <h1>Статистика</h1>
        <p>Страница закрыта ключом. Он спросится один раз и запомнится в этом браузере.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveKey(typed);
          }}
        >
          <input
            type="password"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Ключ"
            aria-label="Ключ дашборда"
            autoFocus
          />
          <button type="submit">Открыть</button>
        </form>
        {error ? <p className="dash-err">{error}</p> : null}
      </main>
    );
  }

  return (
    <main className="dash">
      <header className="dash-head">
        <div>
          <div className="dash-eyebrow">anastasia-samadhi.club</div>
          <h1>Статистика</h1>
        </div>
        <div className="dash-when">
          {data ? `обновлено в ${new Date(data.at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}` : ''}
          <button type="button" onClick={() => void load()} disabled={busy}>
            {busy ? 'обновляю…' : 'обновить'}
          </button>
        </div>
      </header>

      <div className="dash-periods">
        {PERIODS.map((p) => (
          <button
            key={p.days}
            type="button"
            className={p.days === days ? 'on' : ''}
            onClick={() => setDays(p.days)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {error ? <p className="dash-err dash-err-top">{error}</p> : null}

      <div className="dash-tiles">
        <Tile value={data?.visits?.visits ?? null} label="Визитов" note={data?.visitsError ? 'нет данных' : undefined} />
        <Tile value={columns?.viewsTotal ?? null} label="Просмотров страницы" />
        <Tile value={data?.clicks?.total ?? null} label="Нажатий и событий" />
        <Tile value={data?.clicks?.contacts ?? null} label="Обращений с формы" />
      </div>

      {columns ? (
        <>
          <Bars
            title="Визиты по дням"
            days={columns.dayList}
            values={columns.visitsByDay}
            unit="визитов"
            error={data?.visitsError}
            note={data?.visits?.note}
          />
          <Bars
            title="Нажатия по дням"
            days={columns.dayList}
            values={data?.clicks?.byDay ?? {}}
            unit="нажатий"
            error={data?.clicksError}
          />

          <Funnel visits={data?.visits?.visits ?? null} funnel={data?.clicks?.funnel} />

          <div className="dash-two">
            <Rows
              title="Докуда дочитали"
              rows={renamed(data?.clicks?.depth, DEPTH_NAMES)}
              unit="визитов"
              empty="Нет данных — нужна десятая версия обработчика."
              error={data?.clicksError}
            />
            <Rows
              title="Какие разделы увидели"
              rows={renamed(data?.clicks?.sections, SECTION_NAMES)}
              unit="визитов"
              empty="Нет данных — нужна десятая версия обработчика."
              error={data?.clicksError}
            />
          </div>

          <div className="dash-two">
            <Rows
              title="На каких страницах"
              rows={pages(data?.clicks?.byPage)}
              unit="событий"
              empty="Нет данных — нужна десятая версия обработчика."
              error={data?.clicksError}
            />
            <Rows
              title="С чего заходили"
              rows={sorted(data?.clicks?.byDevice)}
              unit="событий"
              empty="Нет данных — нужна десятая версия обработчика."
              error={data?.clicksError}
            />
          </div>

          <div className="dash-two">
            <Rows
              title="Что нажимали"
              rows={sorted(data?.clicks?.byEvent)}
              unit="нажатий"
              empty="За этот период нажатий не было."
              error={data?.clicksError}
            />
            <Rows
              title="Откуда пришли"
              rows={named(data?.visits?.referers)}
              unit="визитов"
              empty="Переходов по ссылкам не было — все пришли напрямую."
              error={data?.visitsError}
            />
            <Rows
              title="Метки источников"
              rows={sorted(data?.clicks?.bySource)}
              unit="нажатий"
              empty="Пока без меток."
              error={data?.clicksError}
            />
            <Rows
              title="Страны"
              rows={data?.visits?.countries ?? []}
              unit="визитов"
              empty="Нет данных."
              error={data?.visitsError}
            />
            <Rows
              title="Устройства"
              rows={data?.visits?.devices ?? []}
              unit="визитов"
              empty="Нет данных."
              error={data?.visitsError}
            />
          </div>

          <p className="dash-note">
            Визиты считает Cloudflare, нажатия — твоя таблица. Нажатие считается один раз
            за визит: человек, который трижды нажал «Вступить», в статистике один.
            {data?.clicks?.totalAllTime
              ? ` Всего событий за всё время: ${nf.format(data.clicks.totalAllTime)}.`
              : ''}
          </p>
        </>
      ) : (
        !error && <p className="dash-empty">Загружаю…</p>
      )}
    </main>
  );
}
