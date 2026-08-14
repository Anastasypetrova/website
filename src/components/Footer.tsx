import { useState, type FormEvent } from 'react';
import { T, useLang } from '../i18n';
import { docs, docHref, links } from '../content';
import { apiConfigured, submitNewsletter } from '../api';
import { InstagramIcon, TelegramIcon, YoutubeIcon } from './Icons';

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
  const lang = useLang();
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') ?? '');
    const website = String(data.get('website') ?? '');

    // Not wired up yet — do not pretend the address was saved.
    if (!apiConfigured) {
      window.location.href = `mailto:${links.email}?subject=${encodeURIComponent('Подписка на рассылку')}&body=${encodeURIComponent(email)}`;
      return;
    }

    setState('sending');
    const result = await submitNewsletter(email, website);
    setState(result.status === 'ok' ? 'sent' : 'failed');
    if (result.status === 'ok') form.reset();
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
          {state === 'sent' ? (
            <p className="subs-done">
              <T ru="Готово — вы подписаны. Спасибо!" en="Done — you're subscribed. Thank you!" />
            </p>
          ) : (
            <form className="subs" onSubmit={onSubmit}>
              <input type="email" name="email" required autoComplete="email"
                placeholder={lang === 'en' ? 'Your email' : 'Ваш email'} aria-label="Email" />
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" />
              <button className="btn-onsage" type="submit" disabled={state === 'sending'} style={{ width: 'auto', padding: '15px 28px' }}>
                {state === 'sending' ? <T ru="Отправляю…" en="Sending…" /> : <T ru="Подписаться" en="Subscribe" />}
              </button>
            </form>
          )}
          {state === 'failed' && (
            <p className="subs-error">
              <T
                ru={<>Не получилось. Напишите на <a href={`mailto:${links.email}`}>{links.email}</a>.</>}
                en={<>Could not subscribe. Please write to <a href={`mailto:${links.email}`}>{links.email}</a>.</>}
              />
            </p>
          )}
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
