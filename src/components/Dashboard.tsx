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

interface Clicks {
  total: number;
  byDay: Record<string, number>;
  byEvent: Record<string, number>;
  bySource: Record<string, number>;
  contacts: number;
  firstDay: string;
  totalAllTime: number;
  tz: string;
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

function sorted(map: Record<string, number> | undefined): Named[] {
  return Object.entries(map ?? {})
    .map(([name, visits]) => ({ name, visits }))
    .sort((a, b) => b.visits - a.visits);
}

/* ---- части страницы ------------------------------------------------------ */

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
