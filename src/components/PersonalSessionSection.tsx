import { T } from '../i18n';
import { links, pricing } from '../content';
import { Photo } from './Photo';
import { ConsentGate } from './ConsentGate';

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

/**
 * `lead` — раздел открывает собственную страницу, а не идёт внутри главной:
 * тогда его название становится заголовком первого уровня. Заголовок первого
 * уровня на странице может быть только один, и это должно быть то, о чём
 * страница, — иначе поисковику про неё нечего сказать.
 */
export function PersonalSessionSection({ lead = false }: { lead?: boolean } = {}) {
  const H = lead ? 'h1' : 'h2';
  return (
    <section className="sec bg2" id="personal-session">
      <div className="wrap">
        <div className="prod-grid">
          <div className="prod-main">
            <span className="taglead"><T ru="Личная работа - одна сессия" en="Personal work, one session" /></span>
            <H className="dh dh2"><T ru="Личная консультация" en="Personal consultation" /></H>
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
                <div className="price" style={{ marginTop: 8, fontFamily: 'var(--font-grotesk)', fontWeight: 100 }}>
                  <T ru={pricing.consultation.ru} en={pricing.consultation.en} />
                </div>
              </div>
            </div>
          </div>
          <div className="prod-right">
            <div className="prod-photo">
              <Photo name="consultation" alt={{ ru: 'Личная консультация: Анастасия Петрова и клиентка разговаривают в креслах у окна', en: 'A personal consultation: Anastasia Petrova and a client talking in armchairs by a window' }} />
            </div>
          </div>
        </div>

        {/* Согласие и кнопки стоят внизу раздела, как в остальных блоках: в
            колонке с ценой они оказывались зажаты между текстом и фотографией. */}
        <div className="mm-cta">
          <ConsentGate
            href={links.consultBot}
            product="personal-session"
            slugs={['oferta', 'disclaimer']}
            secondary={
              <a className="btn-outline" href={links.reviewsChannel} target="_blank" rel="noopener">
                <T ru="Отзывы" en="Reviews" />
              </a>
            }
          >
            <T ru="Записаться" en="Book now" />
          </ConsentGate>
        </div>
      </div>
    </section>
  );
}
