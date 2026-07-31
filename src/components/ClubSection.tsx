import { T } from '../i18n';
import { links } from '../content';
import { Photo } from './Photo';
import { ArrowUpRightIcon } from './Icons';

const chips: [string, string][] = [
  ['Реализация', 'Fulfillment'],
  ['Деньги', 'Money'],
  ['Отношения', 'Relationships'],
  ['Контроль и тревога', 'Control and anxiety'],
  ['Пробуждение', 'Awakening'],
  ['Поиск себя', 'Finding yourself'],
  ['Самоценность', 'Self-worth'],
];

export function ClubSection() {
  return (
    <section className="sec bg1" id="club">
      <div className="wrap">
        <div className="prod-grid">
          <div className="prod-main">
            <span className="taglead"><T ru="Клуб по подписке" en="Subscription club" /></span>
            <h2 className="dh dh2">Samadhi Club</h2>
            <p className="lede">
              <T
                ru="Это место моего ежедневного присутствия, закрытый канал-приложение, в котором я постоянно отвечаю на ваши вопросы, записываю подкасты по темам, делаю разборы, веду живые эфиры и создаю авторские практики."
                en="This is where I show up every day, a private channel-app where I constantly answer your questions, record podcasts on various topics, do breakdowns, host live streams and create original practices."
              />
            </p>
            <div className="statrow">
              <div className="ministat">
                <b>100<span className="mstat-sup">+</span></b>
                <span className="mstat-cap"><T ru="часов подкастов" en="hours of podcasts" /></span>
              </div>
              <div className="ministat">
                <b>24<span className="mstat-slash">/</span>7</b>
                <span className="mstat-cap"><T ru="живое сообщество" en="live community" /></span>
              </div>
              <div className="ministat">
                <b>50<span className="mstat-sup">+</span></b>
                <span className="mstat-cap"><T ru="эфиров и практик" en="livestreams and practices" /></span>
              </div>
            </div>
            <p className="p">
              <T
                ru="Здесь живое сообщество, которое общается и развивается вместе со мной. Мы проходим челленджи вместе, смотрим фильмы и даже создаём музыку. Здесь инсайты, энергия и состояние в моменте. Подписаться можно на месяц, 3 месяца, полгода и год."
                en="Here's a living community that talks and grows together with me. We go through challenges together, watch films and even make music. Here are insights, energy, and being present in the moment. You can subscribe for a month, 3 months, six months or a year."
              />
            </p>
            <a className="audio" href={links.clubAudio} target="_blank" rel="noopener">
              <span className="audio-play">▶</span>
              <span className="audio-body">
                <span className="audio-t"><T ru="Рассказываю, что такое Samadhi Club" en="I explain what Samadhi Club is" /></span>
                <span className="audio-m"><T ru="Аудио · Telegram" en="Audio · Telegram" /></span>
              </span>
              <span className="audio-ar"><ArrowUpRightIcon /></span>
            </a>
            <div className="btns">
              <a className="btn-onsage" href={links.clubJoin} target="_blank" rel="noopener" style={{ width: 'auto', padding: '16px 28px' }}>
                <T ru="Присоединиться" en="Join" />
              </a>
              <a className="btn-outline" href={links.reviewsChannel} target="_blank" rel="noopener">
                <T ru="Отзывы" en="Reviews" />
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
          <span className="klabel"><T ru="В клубе более 1000 часов информации на темы" en="The club holds 1000+ hours of content on topics" /></span>
          <div className="chips">
            {chips.map(([ru, en]) => (
              <span className="chip" key={ru}><T ru={ru} en={en} /></span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
