import { useEffect, useRef } from 'react';
import { T } from '../i18n';
import { showMastermind } from '../content';
import { Disclaimer } from './Disclaimer';
import { trackClick } from '../api';

interface Item {
  href: string;
  nameRu: string;
  nameEn: string;
  subRu: string;
  subEn: string;
  /** Ставит метку NEW рядом с названием. */
  isNew?: boolean;
}

const items: Item[] = [
  { href: '#club', nameRu: 'Samadhi Club', nameEn: 'Samadhi Club', subRu: 'Клуб по подписке', subEn: 'Subscription club' },
  { href: '#personal-session', nameRu: 'Личная консультация', nameEn: 'Personal consultation', subRu: 'Одна сессия', subEn: 'One session' },
  { href: '#mentorship', nameRu: 'Индивидуальное менторство', nameEn: 'Individual mentorship', subRu: 'Глубокая работа', subEn: 'Deep work' },
  ...(showMastermind
    ? [{ href: '#mastermind', nameRu: 'Мастермайнд-группа', nameEn: 'Mastermind', subRu: 'Групповой формат', subEn: 'Group format' }]
    : []),
  { href: '#forever-young', nameRu: 'Forever Young', nameEn: 'Forever Young', subRu: 'Клуб по подписке', subEn: 'Subscription club', isNew: true },
];

// Нумерация считается, а не пишется руками: добавится формат — «01 / 04» не
// останется висеть над пятью строчками.
const pad = (n: number) => String(n).padStart(2, '0');

export function FormatList() {
  const seen = useRef<HTMLElement | null>(null);

  /**
   * Самый важный шаг воронки: доходят ли вообще до предложения. Считается
   * один раз за визит и только когда блок действительно показался на экране.
   */
  useEffect(() => {
    const node = seen.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const watcher = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          trackClick('formats-seen', true);
          watcher.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    watcher.observe(node);
    return () => watcher.disconnect();
  }, []);

  return (
    <section className="sec bg2" id="formats" ref={seen}>
      <div className="wrap">
        <span className="eyebrow"><T ru="форматы работы" en="work formats" /></span>
        <h2 className="dh dh2" style={{ marginTop: 14, maxWidth: '22ch' }}>
          <T
            ru={<>Как мы можем <em className="accent" style={{ fontSize: 'calc(clamp(40px,8vw,80px) * var(--hs))' }}>повзаимодействовать</em></>}
            en={<>How we can <em className="accent" style={{ fontSize: 'calc(clamp(40px,8vw,80px) * var(--hs))' }}>work together</em></>}
          />
        </h2>
        <div className="flist">
          {items.map((it, i) => (
            <a className="frow" href={it.href} key={it.href}>
              <span>
                <span className="frow-n">
                  <T ru={it.nameRu} en={it.nameEn} />
                  {it.isNew && <span className="frow-new">NEW</span>}
                </span>
                <span className="frow-sub"><T ru={it.subRu} en={it.subEn} /></span>
              </span>
              <span className="frow-idx">{`${pad(i + 1)} / ${pad(items.length)}`}</span>
            </a>
          ))}
        </div>
        <Disclaimer />
      </div>
    </section>
  );
}
