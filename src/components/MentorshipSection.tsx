import { T } from '../i18n';
import { links, pricing } from '../content';
import { Photo } from './Photo';
import { ConsentGate } from './ConsentGate';

const chips: [string, string][] = [
  ['Реализация', 'Fulfilment'],
  ['Проявленность', 'Manifestation'],
  ['Манифестация', 'Manifesting'],
  ['Осознанное творение', 'Conscious creation'],
  ['Изобилие', 'Abundance'],
  ['Отношения с другими людьми', 'Relationships'],
  ['Пробуждение к себе', 'Awakening to self'],
  ['Samadhi', 'Samadhi'],
];

const format: [string, string][] = [
  ['Индивидуальные сессии в ZOOM по 60 минут', 'Individual sessions on Zoom, 60 minutes each'],
  ['Персональные задания и практики', 'Personal assignments and practices'],
  ['Чат в Telegram с поддержкой между сессиями', 'Telegram chat support between sessions'],
];


export function MentorshipSection() {
  return (
    <section className="sec bg1" id="mentorship">
      <div className="wrap">
        <div className="prod-grid">
          <div className="prod-main">
            <span className="taglead"><T ru="Глубокая работа" en="Deep work" /></span>
            <h2 className="dh dh2"><T ru="Индивидуальное менторство" en="Individual mentorship" /></h2>
            <p className="lede">
              <T
                ru="Я с вами своей энергией, полем, знаниями. Конкретно работаем над вашей ситуацией по темам в течение определённого периода времени."
                en="I'm with you through my energy, field and knowledge. We work specifically on your situation, on chosen topics, over a set period of time."
              />
            </p>
            <p className="p">
              <T
                ru="Для тех, кто чувствует, что прежние способы больше не работают. Когда старые смыслы распались, а новые ещё не родились, и ты будто в подвешенном состоянии, ступоре, апатии."
                en="For those who feel that old ways no longer work. When old meanings have fallen apart and new ones haven't been born yet, and you feel suspended, stuck, apathetic."
              />
            </p>
            <p className="p">
              <T
                ru="Конкретно работаем над вашей ситуацией по темам: получить новое восприятие, новое состояние и перейти туда, куда хочется."
                en="We work specifically on your situation and topics: gaining a new perception, a new state, and moving to where you want to be."
              />
            </p>
            <div className="block">
              <span className="klabel"><T ru="Темы работы" en="Topics we work on" /></span>
              <div className="chips">
                {chips.map(([ru, en]) => (
                  <span className="chip" key={ru}><T ru={ru} en={en} /></span>
                ))}
              </div>
            </div>
          </div>
          <div className="prod-right">
            <div className="prod-photo">
              <Photo name="mentorship" alt="Индивидуальное менторство" />
              <div className="pc-cap"><T ru="Создаём и творим вместе" en="Creating and building together" /></div>
            </div>
          </div>
        </div>

        <div className="mm-tier">
          <div className="mm-col">
            <div className="mm-card">
              <span className="klabel"><T ru="Формат" en="Format" /></span>
              <div className="list" style={{ marginTop: 16 }}>
                {format.map(([ru, en]) => (
                  <div className="li" key={ru}>
                    <span className="li-mk"></span>
                    <span><T ru={ru} en={en} /></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mm-col">
            <div className="mm-card">
              <span className="klabel"><T ru="Как это работает" en="How it works" /></span>
              <p className="mm-sub">
                <T
                  ru="Лично сопровождаю не более двух человек единовременно. Вход только после короткого созвона и анкеты."
                  en="I personally take on no more than two people at a time. Entry only after a short call and a form."
                />
              </p>
              <p className="mm-sub">
                <T ru="Приходи, если готов попробовать жить по-другому." en="Come if you're ready to try living differently." />
              </p>
            </div>
          </div>
          <div className="mm-col">
            <div className="mm-card">
              <span className="klabel"><T ru="Стоимость программ" en="Program pricing" /></span>
              <div className="pricetable" style={{ marginTop: 16 }}>
                {pricing.mentorship.map((tier) => (
                  <div className="prow" key={tier.price}>
                    <span className="prow-l"><T ru={tier.sessions.ru} en={tier.sessions.en} /></span>
                    <span className="prow-p">{tier.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mm-cta">
          <ConsentGate href={links.consultBot} product="mentorship" slugs={['oferta', 'disclaimer']}>
            <T ru="Занять место" en="Take a spot" />
          </ConsentGate>
          <a className="btn-outline" href={links.reviewsChannel} target="_blank" rel="noopener"><T ru="Отзывы" en="Reviews" /></a>
        </div>
      </div>
    </section>
  );
}
