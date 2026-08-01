import { useRef } from 'react';
import { T } from '../i18n';
import { videos, podcasts, links } from '../content';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

function RailArrows({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <div className="sh-arrows">
      <button className="arw" onClick={onPrev} aria-label="Назад"><ChevronLeftIcon /></button>
      <button className="arw" onClick={onNext} aria-label="Вперёд"><ChevronRightIcon /></button>
    </div>
  );
}

export function VideosSection() {
  const vrail = useRef<HTMLDivElement>(null);
  const prail = useRef<HTMLDivElement>(null);

  const scrollRail = (ref: React.RefObject<HTMLDivElement | null>, dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 560), behavior: 'smooth' });
  };

  return (
    <section className="sec bg1" id="videos">
      <div className="wrap">
        <div className="sh">
          <div>
            <span className="eyebrow">youtube</span>
            <h2 className="dh dh2" style={{ marginTop: 14, maxWidth: '20ch' }}>
              <T
                ru={<>Посмотрите мои видео, чтобы <em className="accent" style={{ fontSize: 'calc(clamp(38px,7.5vw,75px) * var(--hs))' }}>познакомиться</em> со мной</>}
                en={<>Watch my videos to <em className="accent" style={{ fontSize: 'calc(clamp(38px,7.5vw,75px) * var(--hs))' }}>get to know</em> me</>}
              />
            </h2>
          </div>
          <RailArrows onPrev={() => scrollRail(vrail, -1)} onNext={() => scrollRail(vrail, 1)} />
        </div>
        <div className="rail" id="vrail" ref={vrail}>
          {videos.map((v) => (
            <a className="vcard" href={v.url} target="_blank" rel="noopener" key={v.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="vthumb">
                <img src={v.thumb} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="play"><span>▶</span></div>
              </div>
            </a>
          ))}
        </div>

        <div className="sh" style={{ marginTop: 64 }}>
          <div>
            <span className="eyebrow">youtube</span>
            <h2 className="dh dh3" style={{ marginTop: 14 }}><T ru="Подкасты" en="Podcasts" /></h2>
          </div>
          <RailArrows onPrev={() => scrollRail(prail, -1)} onNext={() => scrollRail(prail, 1)} />
        </div>
        <div className="rail" id="prail" ref={prail}>
          {podcasts.map((v) => (
            <a className="vcard" href={v.url} target="_blank" rel="noopener" key={v.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="vthumb">
                <img src={v.thumb} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="play"><span>▶</span></div>
              </div>
            </a>
          ))}
        </div>

        <div style={{ marginTop: 44 }}>
          <a className="btn-onsage" href={links.youtube} target="_blank" rel="noopener" style={{ width: 'auto', padding: '16px 34px' }}>
            <T ru="Смотреть на YouTube" en="Watch on YouTube" />
          </a>
        </div>
      </div>
    </section>
  );
}
