import { T } from '../i18n';
import { Photo } from './Photo';
import { InstagramIcon, TelegramIcon, YoutubeIcon } from './Icons';
import { links } from '../content';

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-bg">
        <Photo name="hero" alt="" objectPosition="center 34%" priority />
      </div>
      <div className="hero-scrim"></div>
      <div className="hero-in">
        <h1 className="hero-h">
          <T
            ru={<>Привет, родная душа. Здесь поменяется твоё <em style={{ fontSize: 'clamp(46px,9vw,90px)' }}>восприятие</em> мира, а затем и твоя реальность</>}
            en={<>Hi, kindred soul. Here your <em style={{ fontSize: 'clamp(46px,9vw,90px)' }}>perception</em> of the world will shift, and then your reality</>}
          />
        </h1>
        <p className="hero-sub">
          <T
            ru="Помогаю людям выйти из любых ограничивающих концепций через внимание и состояние, и наконец начать жить их лучшую жизнь"
            en="I help people move beyond limiting concepts through attention and state, and finally start living their best life"
          />
        </p>
        <div className="hero-social">
          <a className="soc soc-l" href={links.instagram} target="_blank" rel="noopener" aria-label="Instagram"><InstagramIcon /></a>
          <a className="soc soc-l" href={links.telegramChannel} target="_blank" rel="noopener" aria-label="Telegram"><TelegramIcon /></a>
          <a className="soc soc-l" href={links.youtube} target="_blank" rel="noopener" aria-label="YouTube"><YoutubeIcon /></a>
        </div>
      </div>
    </section>
  );
}
