import { T } from '../i18n';

export function IntroQuote() {
  return (
    <section className="sec bg1">
      <div className="wrap-n intro">
        <div className="rule"></div>
        <h2 className="dh dh2">
          <T
            ru={<>Реальность меняется в один момент через намерение и перемещение <em className="accent" style={{ fontSize: 'clamp(40px,8vw,80px)' }}>внимания</em></>}
            en={<>Reality shifts in a single moment through intention and the movement of <em className="accent" style={{ fontSize: 'clamp(40px,8vw,80px)' }}>attention</em></>}
          />
        </h2>
        <div className="attr">Анастасия Петрова</div>
      </div>
    </section>
  );
}
