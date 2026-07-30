import { T } from '../i18n';
import { links } from '../content';
import { ImagePlaceholder } from './ImagePlaceholder';

const items: [string, string][] = [
  [
    'Помогу понять, где находится ваше внимание сейчас и куда его можно переместить, чтобы достичь цели и создать вашу желаемую реальность',
    "I'll help you see where your attention is right now and where to move it to reach your goal and create the reality you want",
  ],
  [
    'Расскажу и покажу, что такое осознанное творение, и как именно это делать. Из любви, а не из страха.',
    "I'll show you what conscious creation is and how to do it, from love, not from fear.",
  ],
  [
    'Разрушу мифы про пробуждение (и что это вообще такое) и как к этому прийти, если вам хочется',
    "I'll bust the myths about awakening, what it actually is, and how to get there if you want to.",
  ],
  [
    'Дам практики, ссылки и книги для успокоения вашего ума (потому что они нужны только для ума)',
    "I'll give you practices, links and books to calm your mind (since those are only needed for the mind)",
  ],
];

export function PersonalSessionSection() {
  return (
    <section className="sec bg2" id="personal-session">
      <div className="wrap">
        <div className="prod-grid">
          <div className="prod-main">
            <span className="taglead"><T ru="Личная работа - одна сессия" en="Personal work, one session" /></span>
            <h2 className="dh dh2"><T ru="Личная консультация" en="Personal consultation" /></h2>
            <div className="block">
              <span className="klabel"><T ru="Что будет на консультации" en="What happens in the consultation" /></span>
              <div className="numlist">
                {items.map(([ru, en], i) => (
                  <div className="numrow" key={ru}>
                    <span className="numrow-n">{String(i + 1).padStart(2, '0')}</span>
                    <span className="numrow-t"><T ru={ru} en={en} /></span>
                  </div>
                ))}
              </div>
            </div>
            <div className="meta"><T ru="Длительность: 1 час" en="Duration: 1 hour" /></div>
            <div className="pricerow">
              <div className="pricebox">
                <span className="klabel"><T ru="Стоимость" en="Price" /></span>
                <div className="price" style={{ marginTop: 8, fontFamily: 'Helvetica, sans-serif', fontWeight: 100 }}>300€ / 30000 руб.</div>
              </div>
              <div className="btns" style={{ marginTop: 0 }}>
                <a className="btn-onsage" href={links.consultBot} target="_blank" rel="noopener" style={{ width: 'auto', padding: '16px 28px' }}>
                  <T ru="Записаться" en="Book now" />
                </a>
                <a className="btn-outline" href={links.reviewsChannel} target="_blank" rel="noopener">
                  <T ru="Отзывы" en="Reviews" />
                </a>
              </div>
            </div>
          </div>
          <div className="prod-right">
            <div className="prod-photo">
              <ImagePlaceholder label="Личная консультация" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
