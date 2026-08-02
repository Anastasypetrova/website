import { T } from '../i18n';

const items: { href: string; nameRu: string; nameEn: string; subRu: string; subEn: string; idx: string }[] = [
  { href: '#club', nameRu: 'Samadhi Club', nameEn: 'Samadhi Club', subRu: 'Клуб по подписке', subEn: 'Subscription club', idx: '01 / 04' },
  { href: '#personal-session', nameRu: 'Личная консультация', nameEn: 'Personal consultation', subRu: 'Одна сессия', subEn: 'One session', idx: '02 / 04' },
  { href: '#mentorship', nameRu: 'Индивидуальное менторство', nameEn: 'Individual mentorship', subRu: 'Глубокая работа', subEn: 'Deep work', idx: '03 / 04' },
  { href: '#mastermind', nameRu: 'Мастермайнд-группа', nameEn: 'Mastermind', subRu: 'Групповой формат', subEn: 'Group format', idx: '04 / 04' },
];

export function FormatList() {
  return (
    <section className="sec bg2" id="formats">
      <div className="wrap">
        <span className="eyebrow"><T ru="форматы работы" en="work formats" /></span>
        <h2 className="dh dh2" style={{ marginTop: 14, maxWidth: '22ch' }}>
          <T
            ru={<>Как мы можем <em className="accent" style={{ fontSize: 'calc(clamp(40px,8vw,80px) * var(--hs))' }}>повзаимодействовать</em></>}
            en={<>How we can <em className="accent" style={{ fontSize: 'calc(clamp(40px,8vw,80px) * var(--hs))' }}>work together</em></>}
          />
        </h2>
        <div className="flist">
          {items.map((it) => (
            <a className="frow" href={it.href} key={it.href}>
              <span>
                <span className="frow-n"><T ru={it.nameRu} en={it.nameEn} /></span>
                <span className="frow-sub"><T ru={it.subRu} en={it.subEn} /></span>
              </span>
              <span className="frow-idx">{it.idx}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
