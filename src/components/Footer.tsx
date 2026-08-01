import { type FormEvent } from 'react';
import { T } from '../i18n';
import { docs, docHref, links } from '../content';
import { InstagramIcon, TelegramIcon, YoutubeIcon } from './Icons';

async function submitNewsletter(data: FormData) {
  // Hook point: POST `data` to the Telegram-bot automated-response flow once it exists.
  void data;
}

const sectionLinks: { href: string; ru: string; en: string }[] = [
  { href: '#videos', ru: 'Видео', en: 'Videos' },
  { href: '#reviews', ru: 'Отзывы', en: 'Reviews' },
  { href: '#formats', ru: 'Форматы работы', en: 'Work formats' },
  { href: '#about', ru: 'Обо мне', en: 'About me' },
  { href: '#contacts', ru: 'Контакты', en: 'Contacts' },
];

const formatLinks: { href: string; ru: string; en: string }[] = [
  { href: '#club', ru: 'Samadhi Club', en: 'Samadhi Club' },
  { href: '#personal-session', ru: 'Личная консультация', en: 'Personal consultation' },
  { href: '#mentorship', ru: 'Менторство', en: 'Mentorship' },
  { href: '#mastermind', ru: 'Мастермайнд-группа', en: 'Mastermind' },
];

export function Footer() {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submitNewsletter(new FormData(e.currentTarget));
  };

  return (
    <footer className="footer">
      <div className="footer-in">
        <div className="foot-news">
          <h2 className="foot-h">
            <T
              ru={<>Подпишитесь на <em className="accent" style={{ fontSize: 'calc(clamp(38px,7vw,70px) * var(--hs))' }}>рассылку</em></>}
              en={<>Subscribe to the <em className="accent" style={{ fontSize: 'calc(clamp(38px,7vw,70px) * var(--hs))' }}>newsletter</em></>}
            />
          </h2>
          <form className="subs" onSubmit={onSubmit}>
            <input type="email" name="email" placeholder="Ваш email" aria-label="Email" />
            <button className="btn-onsage" type="submit" style={{ width: 'auto', padding: '15px 28px' }}>
              <T ru="Подписаться" en="Subscribe" />
            </button>
          </form>
        </div>
        <div className="foot-grid">
          <div className="foot-brand">
            <div className="foot-name">Анастасия Петрова</div>
            <div className="foot-tag">
              <T
                ru="Исследователь сознания и трансформационный ментор. Помогаю выйти за пределы концепций и изменить восприятие."
                en="Consciousness researcher and transformational mentor. I help you move beyond limiting concepts and shift your perception."
              />
            </div>
            <div className="c-social">
              <a className="soc soc-l" href={links.instagram} target="_blank" rel="noopener" aria-label="Instagram"><InstagramIcon /></a>
              <a className="soc soc-l" href={links.telegramChannel} target="_blank" rel="noopener" aria-label="Telegram"><TelegramIcon /></a>
              <a className="soc soc-l" href={links.youtube} target="_blank" rel="noopener" aria-label="YouTube"><YoutubeIcon /></a>
            </div>
          </div>
          <div className="foot-col">
            <span className="foot-col-h"><T ru="Разделы" en="Sections" /></span>
            {sectionLinks.map((l) => (
              <a className="flink" href={l.href} key={l.href}><T ru={l.ru} en={l.en} /></a>
            ))}
          </div>
          <div className="foot-col">
            <span className="foot-col-h"><T ru="Форматы" en="Formats" /></span>
            {formatLinks.map((l) => (
              <a className="flink" href={l.href} key={l.href}><T ru={l.ru} en={l.en} /></a>
            ))}
          </div>
          <div className="foot-col">
            <span className="foot-col-h"><T ru="Документы" en="Documents" /></span>
            {docs.map((d) => (
              <a className="flink" href={docHref(d.slug)} key={d.slug}>
                <T ru={d.label.ru} en={d.label.en} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="foot-bottom">
        <span><T ru="© 2026 Анастасия Петрова. Все права защищены." en="© 2026 Anastasia Petrova. All rights reserved." /></span>
        <span><T ru="Сотрудничество: hello@metasouls.co" en="Collaboration: hello@metasouls.co" /></span>
      </div>
    </footer>
  );
}
