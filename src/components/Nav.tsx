import { useEffect, useState } from 'react';
import { T, useLang } from '../i18n';
import { useHere, useHomeAnchor, useHref } from '../router';
import { HOME } from '../routes';
import { trackClick } from '../api';
import { BurgerIcon, CloseIcon } from './Icons';

const navLinks: { id: string; ru: string; en: string }[] = [
  { id: 'videos', ru: 'Видео', en: 'Videos' },
  { id: 'reviews', ru: 'Отзывы', en: 'Reviews' },
  { id: 'formats', ru: 'Форматы работы', en: 'Work formats' },
  { id: 'about', ru: 'Обо мне', en: 'About me' },
];

/**
 * Переключатель языка — ссылки, а не кнопки.
 *
 * У русской и английской версии теперь разные адреса, и переключение языка —
 * это переход на другой адрес. Заодно поисковик видит английскую версию: по
 * кнопке, меняющей состояние в браузере, он никуда не переходит, и половина
 * написанного текста для него просто не существовала.
 */
export function LangSwitch({ className = 'langsw' }: { className?: string }) {
  const lang = useLang();
  const here = useHere();
  const href = useHref();

  return (
    <div className={className}>
      {(['ru', 'en'] as const).map((l) =>
        l === lang ? (
          <span className="lang-btn active" key={l} aria-current="page">
            {l.toUpperCase()}
          </span>
        ) : (
          <a
            className="lang-btn"
            key={l}
            href={href(here.route, l)}
            hrefLang={l}
            onClick={() => trackClick(`lang-${l}`)}
          >
            {l.toUpperCase()}
          </a>
        ),
      )}
    </div>
  );
}

/**
 * `solid` — страница без фотографии во весь экран. Прозрачная шапка там
 * рисует белые буквы по кремовому фону, то есть ничего не рисует.
 */
export function Nav({ solid = false }: { solid?: boolean } = {}) {
  const href = useHref();
  const anchor = useHomeAnchor();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav className={`nav ${solid || scrolled ? 'nav-scrolled' : 'nav-top'}`} id="nav">
        <div className="nav-in">
          <a className="logo" href={href(HOME)}>Анастасия Петрова</a>
          <div className="nlinks">
            {navLinks.map((l) => (
              <a className="nlink" href={anchor(l.id)} key={l.id}>
                <T ru={l.ru} en={l.en} />
              </a>
            ))}
            <a className="npill" href={anchor('contacts')}><T ru="Контакты" en="Contacts" /></a>
            <LangSwitch />
          </div>
          <button className="burger" onClick={() => setMenuOpen(true)} aria-label="Меню">
            <BurgerIcon />
          </button>
        </div>
      </nav>
      <div className={`msheet ${menuOpen ? 'on' : ''}`}>
        <div className="msheet-top">
          <span className="logo" style={{ color: 'var(--ink)' }}>Анастасия Петрова</span>
          <button className="burger" style={{ borderColor: 'var(--border-strong)' }} onClick={() => setMenuOpen(false)} aria-label="Закрыть">
            <CloseIcon />
          </button>
        </div>
        {navLinks.map((l) => (
          <a className="mlink" href={anchor(l.id)} key={l.id} onClick={() => setMenuOpen(false)}>
            <T ru={l.ru} en={l.en} />
          </a>
        ))}
        <a className="mlink" href={anchor('contacts')} onClick={() => setMenuOpen(false)}><T ru="Контакты" en="Contacts" /></a>
        <LangSwitch className="mlang" />
      </div>
    </>
  );
}
