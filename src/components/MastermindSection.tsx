import { T, useLang } from '../i18n';
import { links } from '../content';
import { Photo } from './Photo';
import { ConsentGate } from './ConsentGate';

const chips: [string, string][] = [
  ['Манифестация и материализация сценариев', 'Manifesting and materialising scenarios'],
  ['Деньги и изобилие', 'Money and abundance'],
  ['Проявленность и реализация', 'Manifestation and fulfilment'],
  ['Любовь к себе', 'Self-love'],
];

const format: [string, string][] = [
  ['7 недель для трансформации', '7 weeks of transformation'],
  ['Созвоны каждую неделю, 2 часа', 'Weekly calls, 2 hours'],
  ['Чат постоянной активности и доступ ко мне для вопросов', 'An active chat and access to me for questions'],
  ['Практики конкретно для членов группы по запросу', 'Practices tailored to the group by request'],
];

export function MastermindSection() {
  const lang = useLang();

  return (
    <section className="sec bg2" id="mastermind">
      <div className="wrap">
        <div className="prod-grid">
          <div className="prod-main">
            <span className="taglead"><T ru="Групповой формат" en="Group format" /></span>
            <h2 className="dh dh2">Mastermind</h2>
            <p className="lede">
              <T
                ru="Групповой онлайн-формат для тех, кто готов выйти за рамки привычного мышления и перейти в новое восприятие, решения и действия."
                en="A group online format for those ready to step outside habitual thinking and shift into new perception, decisions and actions."
              />
            </p>
            <p className="p" style={{ textAlign: 'left' }}>
              {lang === 'ru' ? (
                <b style={{ fontWeight: 400, color: 'var(--danger)' }}>
                  ЦЕЛЬ МАСТЕРМАЙНДА: СОЗДАТЬ НОВУЮ РЕАЛЬНОСТЬ ПРИ ПОМОЩИ ПЕРЕМЕЩЕНИЯ ВНИМАНИЯ И ИЗМЕНЕНИЯ МЫШЛЕНИЯ.
                </b>
              ) : (
                'The goal of the mastermind: to create a new reality through attention and a shift in thinking'
              )}
            </p>
            <p className="p">
              <T
                ru="Вы получите универсальное знание и скиллы, которые закроют все ваши вопросы, неважно, о чём они. Новое восприятие меняет все аспекты жизни сразу."
                en="I'll give you universal knowledge and skills that close all your questions, no matter what they're about. New perception shifts every aspect of life at once."
              />
            </p>
            <p className="p">
              <T
                ru="Этот формат не терапевтический, а поддерживающий и развивающий. Это возможность через глаза и воприятие единомышленников посмотреть на ситуацию с разных углов и увидеть скрытые возможности, о которых вы не могли и подумать. Обсуждаем конкретно ваши кейсы в формате брейнсторма и вопросов и ответов."
                en="This is not a course and not coaching. It's about a fishing rod, not a fish: a tool you'll keep applying on your own. We discuss your specific cases, each mastermind a new topic."
              />
            </p>
            <div className="block">
              <span className="klabel"><T ru="Темы мастермайндов" en="Mastermind topics" /></span>
              <div className="chips">
                {chips.map(([ru, en]) => (
                  <span className="chip" key={ru}><T ru={ru} en={en} /></span>
                ))}
              </div>
            </div>
          </div>
          <div className="prod-right">
            <div className="prod-photo">
              <Photo name="mastermind" alt="Mastermind" />
              <div className="pc-cap"><T ru="Пространство синергии, где 5 + 1 = 10" en="A space of synergy, where 5 + 1 = 10" /></div>
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
                  ru="В каждой группе 5 человек, которые делятся инсайтами. Мастермайнд это всегда пространство синергии, поэтому 5 + 1 = 10. Взаимодействие в группе раскрывает потенциал каждого в разы."
                  en="Each group has 5 people who share insights. A mastermind is always a space of synergy, so 5 + 1 = 10. Interaction in the group multiplies everyone's potential."
                />
              </p>
              <div className="mm-divide"></div>
              <p className="mm-sub" style={{ fontWeight: 600 }}>
                <T ru="Вход только после анкеты и личного созвона." en="Entry only after a form and a personal call." />
              </p>
            </div>
          </div>
          <div className="mm-col">
            <div className="mm-card" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div>
                <span className="klabel"><T ru="Стоимость" en="Price" /></span>
                <div className="mm-price" style={{ marginTop: 8, fontSize: 17 }}>
                  <T
                    ru={<>1200 евро<br /><br />Даты следующих мастермайндов уточняются, а пока вы можете заполнить анкету предзаписи</>}
                    en={<>1200 euros<br /><br />Dates for upcoming masterminds are being finalised — for now you can fill out the pre-registration form</>}
                  />
                </div>
              </div>
              <ConsentGate
                href={links.mastermindForm}
                product="mastermind"
                slugs={['oferta', 'disclaimer']}
                style={{ marginTop: 'auto' }}
              >
                <T ru="Заполнить анкету" en="Fill out the form" />
              </ConsentGate>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
