import { T } from '../i18n';
import { links } from '../content';
import { Photo } from './Photo';
import { ArrowRightIcon, TelegramIcon } from './Icons';

export function TelegramBand() {
  return (
    <section className="sec pullphoto" id="tg-subscribe">
      <div className="pullphoto-bg">
        <Photo name="telegram" alt="Анастасия Петрова" objectPosition="center 15%" />
      </div>
      <div className="pullphoto-sc"></div>
      <div className="wrap-n pull">
        <span className="tgband-eyebrow" style={{ justifyContent: 'center', color: 'rgba(255,255,255,.85)' }}>
          <TelegramIcon />
          <T ru="Открытый канал" en="Open channel" />
        </span>
        <div className="q" style={{ marginTop: 22 }}>
          <T
            ru={<>Подпишитесь на мой телеграм-канал <em className="accent" style={{ fontSize: 'calc(clamp(34px,6.5vw,65px) * var(--hs))' }}>Энергия и состояние</em></>}
            en={<>Subscribe to my Telegram channel <em className="accent" style={{ fontSize: 'calc(clamp(34px,6.5vw,65px) * var(--hs))' }}>Energy and State</em></>}
          />
        </div>
        <p className="tgband-sub" style={{ color: 'rgba(255,255,255,.85)' }}>
          <T ru="Мысли, практики и состояние в моменте для каждого" en="Thoughts, practices and presence for everyone" />
        </p>
        <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
          <a className="tgband-cta" href={links.telegramChannel} target="_blank" rel="noopener">
            <T ru="Подписаться" en="Subscribe" />
            <ArrowRightIcon />
          </a>
        </div>
      </div>
    </section>
  );
}
