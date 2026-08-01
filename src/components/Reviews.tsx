import { T } from '../i18n';
import { reviews, links } from '../content';
import { ArrowRightIcon } from './Icons';

export function Reviews() {
  return (
    <section className="sec bg1" id="reviews">
      <div className="wrap">
        <span className="eyebrow"><T ru="отзывы" en="reviews" /></span>
        <h2 className="dh dh2" style={{ marginTop: 14, maxWidth: '24ch' }}>
          <T
            ru={<>Отзывы людей, которым я <em className="accent" style={{ fontSize: 'calc(clamp(40px,8vw,80px) * var(--hs))' }}>помогла</em></>}
            en={<>Reviews from people I have <em className="accent" style={{ fontSize: 'calc(clamp(40px,8vw,80px) * var(--hs))' }}>helped</em></>}
          />
        </h2>
        <div className="mas">
          {reviews.map((r) => (
            <div className="mcell" key={r.url}>
              <div className="mtext">
                <div className="mstars">★★★★★</div>
                <div className="mq"><T ru={r.quote.ru} en={r.quote.en} /></div>
                <div className="mbody"><T ru={r.body.ru} en={r.body.en} /></div>
                <div className="msign">
                  <span>{r.name}</span>
                  <a className="mmore" href={r.url} target="_blank" rel="noopener">
                    <T ru="Читать полный отзыв" en="Read full review" />
                    <ArrowRightIcon />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 44, display: 'flex', justifyContent: 'center' }}>
          <a className="btn-onsage" href={links.reviewsChannel} target="_blank" rel="noopener" style={{ width: 'auto', padding: '16px 34px' }}>
            <T ru="Больше отзывов" en="More reviews" />
          </a>
        </div>
      </div>
    </section>
  );
}
