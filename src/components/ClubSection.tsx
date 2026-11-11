import { T, useLang } from '../i18n';
import { clubPerMonth, clubPlans, links } from '../content';
import { Photo } from './Photo';
import type { PhotoKey } from '../photos';
import { ConsentGate } from './ConsentGate';
import { ArrowUpRightIcon, TelegramIcon } from './Icons';

/**
 * То, за что человек платит, строчками. Раньше это лежало внутри абзаца —
 * абзац читают по диагонали, список читают целиком.
 */
const includes: [string, string][] = [
  ['20+ эфиров в записи — на темы, с которыми приходят на личные консультации', '20+ recorded live sessions, on the themes people bring to private consultations'],
  ['Вопросы и разборы: вы задаёте вопрос — я его разбираю', 'Questions and breakdowns: you ask, I work through it'],
  ['20 авторских практик, медитаций и техник', '20 original practices, meditations and techniques'],
  ['10+ марафонов и челленджей вместе с единомышленниками', '10+ marathons and challenges alongside like-minded people'],
  ['Живое сообщество — чат, где вас понимают', 'A living community — a chat where you are understood'],
  ['Подкасты, комната медитаций, книжный клуб, киноклуб, плейлисты', 'Podcasts, a meditation room, a book club, a film club, playlists'],
];

const chips: [string, string][] = [
  ['Реализация', 'Fulfillment'],
  ['Деньги', 'Money'],
  ['Отношения', 'Relationships'],
  ['Любовь к себе', 'Self-love'],
  ['Тень и триггеры', 'The shadow and triggers'],
  ['Убеждения', 'Beliefs'],
  ['Желания', 'Desires'],
  ['Исцеление и нестарение', 'Healing and staying young'],
  ['Контроль и тревога', 'Control and anxiety'],
  ['Пробуждение', 'Awakening'],
  ['Поиск себя', 'Finding yourself'],
  ['Самоценность', 'Self-worth'],
];

/**
 * Экраны приложения — сначала то, что внутри, и только потом рабочий стол:
 * иконка на экране телефона читается как итог, а не как вступление.
 */
const appShots: [PhotoKey, string, string][] = [
  ['app2', 'Главный экран клуба', 'The club home screen'],
  ['app3', 'Практики, медитации, марафоны', 'Practices, meditations, marathons'],
  ['app4', 'Книжный клуб, кино, музыка', 'Book club, films, music'],
  ['app1', 'И всё это — на рабочем столе', 'And all of it on your home screen'],
];

export function ClubSection() {
  const lang = useLang();

  return (
    <section className="sec bg1" id="club">
      <div className="wrap">
        <div className="prod-grid">
          <div className="prod-main">
            <span className="taglead"><T ru="Клуб по подписке" en="Subscription club" /></span>
            <h2 className="dh dh2">Samadhi Club</h2>
            <p className="lede">
              <T
                ru="Мой закрытый канал разборов с живыми эфирами, авторскими практиками и возможностью задать вопрос и получить ответ. Это место моего ежедневного присутствия."
                en="My private channel of breakdowns, with live sessions, original practices and the chance to ask a question and get an answer. This is where I show up every day."
              />
            </p>
            <div className="statrow">
              <div className="ministat">
                <b>150<span className="mstat-sup">+</span></b>
                <span className="mstat-cap"><T ru="часов контента" en="hours of content" /></span>
              </div>
              <div className="ministat">
                <b>24<span className="mstat-slash">/</span>7</b>
                <span className="mstat-cap"><T ru="живое сообщество" en="live community" /></span>
              </div>
              <div className="ministat">
                <b>20<span className="mstat-sup">+</span></b>
                <span className="mstat-cap"><T ru="эфиров в записи" en="recorded sessions" /></span>
              </div>
            </div>
            {/* Клуб давно не просто канал, и об этом стоит сказать отдельно:
                «приложение» — это и есть ответ на вопрос «а как я этим пользуюсь». */}
            <div className="callout">
              <p>
                <T
                  ru="Теперь это не только канал, а приложение. Поставили на рабочий стол, открыли и слушаете — ничего не теряется в чатах."
                  en="It is no longer just a channel — it is an app. Put it on your home screen, open it and listen; nothing gets lost in chats."
                />
              </p>
            </div>
            {/* Две плашки в ряд: мой голос и голоса участников. Отзывы раньше
                висели кнопкой под ценой, где их никто не искал. */}
            <div className="audio-row">
              <a className="audio" href={links.clubAudio} target="_blank" rel="noopener">
                <span className="audio-play">▶</span>
                <span className="audio-body">
                  <span className="audio-t"><T ru="Что такое Samadhi Club" en="What Samadhi Club is" /></span>
                  <span className="audio-m"><T ru="Аудио · Telegram" en="Audio · Telegram" /></span>
                </span>
                <span className="audio-ar"><ArrowUpRightIcon /></span>
              </a>
              <a className="audio audio-alt" href={links.reviewsChannel} target="_blank" rel="noopener">
                <span className="audio-play audio-play-icon"><TelegramIcon /></span>
                <span className="audio-body">
                  <span className="audio-t"><T ru="Отзывы ребят из клуба" en="Reviews from club members" /></span>
                  <span className="audio-m"><T ru="Канал · Telegram" en="Channel · Telegram" /></span>
                </span>
                <span className="audio-ar"><ArrowUpRightIcon /></span>
              </a>
            </div>
          </div>
          <div className="prod-right">
            <div className="prod-photo">
              <Photo name="club" alt="Samadhi Club" />
              <div className="pc-cap"><T ru="Перестать беспокоиться и начать творить" en="Stop worrying and start creating" /></div>
            </div>
          </div>
        </div>
        <div className="tagfull">
          <span className="klabel"><T ru="Темы разборов и эфиров" en="Topics of breakdowns and sessions" /></span>
          <div className="chips">
            {chips.map(([ru, en]) => (
              <span className="chip" key={ru}><T ru={ru} en={en} /></span>
            ))}
          </div>
        </div>

        {/* Один столбец сверху вниз: что входит → как это выглядит → сколько
            стоит → кнопка. Все три блока одной ширины, чтобы читалось как
            одно движение, а не как три отдельные карточки. */}
        <div className="club-stack">
          <div className="mm-card">
            <span className="klabel"><T ru="Что входит в подписку" en="What the subscription includes" /></span>
            {/* Перед списком, а не внутри него: это свойство всего клуба, а не
                ещё один его пункт. Заодно отвечает на «а это не архив?». */}
            <p className="card-note">
              <T
                ru="Контент добавляется и обновляется каждый день."
                en="Content is added and updated every day."
              />
            </p>
            <div className="list list-2col" style={{ marginTop: 16 }}>
              {includes.map(([ru, en]) => (
                <div className="li" key={ru}>
                  <span className="li-mk"></span>
                  <span><T ru={ru} en={en} /></span>
                </div>
              ))}
            </div>
          </div>

          {/* Прочитал, что входит, — увидел, как это выглядит в руках. */}
          <div className="appshots">
            {appShots.map(([name, ru, en]) => (
              <div className="appshot" key={name}>
                <div className="appshot-screen">
                  {/* Подписи убраны, но описание остаётся — его читает вслух
                      программа для незрячих и показывает поиск по картинкам. */}
                  <Photo name={name} alt={lang === 'en' ? en : ru} objectPosition="top" />
                </div>
              </div>
            ))}
          </div>

          <div className="mm-card">
              <span className="klabel"><T ru="Стоимость подписки" en="Subscription pricing" /></span>
              <div className="pricetable" style={{ marginTop: 16 }}>
                {clubPlans.map((plan) => (
                  <div className={`prow${plan.months === 12 ? ' prow-best' : ''}`} key={plan.months}>
                    <span className="prow-l">
                      <T ru={plan.label.ru} en={plan.label.en} />
                      {plan.months > 1 && (
                        <span className="prow-sub">
                          <T
                            ru={<>· ≈{clubPerMonth(plan, 'ru')} в месяц</>}
                            en={<>· ≈{clubPerMonth(plan, 'en')} a month</>}
                          />
                        </span>
                      )}
                    </span>
                    <span className="prow-p">
                      {lang === 'en' ? `€${plan.price}` : `${plan.price} €`}
                    </span>
                  </div>
                ))}
              </div>
              <div className="finep">
                <p>
                  <T
                    ru="Оплата и продление — через Tribute, из любой страны, картами любых стран (России в том числе). Подписка продлевается автоматически; отменить продление можно в любой момент в Tribute, доступ сохранится до конца оплаченного периода."
                    en="Payment and renewal go through Tribute, from any country and with cards issued anywhere, Russia included. The subscription renews automatically; you can cancel renewal in Tribute at any time, and access stays until the end of the paid period."
                  />
                </p>
            </div>
          </div>

          {/* Внутри той же колонки, что карточки, и по её левому краю —
              галочка и кнопка продолжают цену, а не висят отдельно по центру. */}
          <div className="mm-cta cta-left">
            <ConsentGate
              href={links.clubJoin}
              product="samadhi-club"
              slugs={['oferta', 'club-terms', 'disclaimer']}
              buttonStyle={{ width: 'auto', padding: '16px 28px' }}
            >
              <T ru="Присоединиться" en="Join" />
            </ConsentGate>
          </div>
        </div>
      </div>
    </section>
  );
}
