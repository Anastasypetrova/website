import { T } from '../i18n';

export function AwakeningQuote() {
  return (
    <section className="sec bg2">
      <div className="wrap-n pull">
        <div className="q">
          <T
            ru={<>Пробуждение - это перемещение <em className="accent" style={{ fontSize: 'calc(clamp(32px,6vw,60px) * var(--hs))' }}>внимания</em></>}
            en={<>Awakening is the movement of <em className="accent" style={{ fontSize: 'calc(clamp(32px,6vw,60px) * var(--hs))' }}>attention</em></>}
          />
        </div>
        <div className="qa">Анастасия Петрова</div>
      </div>
    </section>
  );
}
