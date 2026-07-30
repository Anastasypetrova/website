import { useEffect, useState } from 'react';
import { T, useLang, type Lang } from '../i18n';
import { BurgerIcon, CloseIcon } from './Icons';

const navLinks: { href: string; ru: string; en: string }[] = [
  { href: '#videos', ru: 'Видео', en: 'Videos' },
  { href: '#reviews', ru: 'Отзывы', en: 'Reviews' },
  { href: '#formats', ru: 'Форматы работы', en: 'Work formats' },
  { href: '#about', ru: 'Обо мне', en: 'About me' },
];

interface Props {
  onSetLang: (lang: Lang) => void;
}

export function Nav({ onSetLang }: Props) {
  const lang = useLang();
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
      <nav className={`nav ${scrolled ? 'nav-scrolled' : 'nav-top'}`} id="nav">
        <div className="nav-in">
          <a className="logo" href="#top">Анастасия Петрова</a>
          <div className="nlinks">
            {navLinks.map((l) => (
              <a className="nlink" href={l.href} key={l.href}>
                <T ru={l.ru} en={l.en} />
              </a>
            ))}
            <a className="npill" href="#contacts"><T ru="Контакты" en="Contacts" /></a>
            <div className="langsw">
              <button className={`lang-btn ${lang === 'ru' ? 'active' : ''}`} onClick={() => onSetLang('ru')}>RU</button>
              <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => onSetLang('en')}>EN</button>
            </div>
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
          <a className="mlink" href={l.href} key={l.href} onClick={() => setMenuOpen(false)}>
            <T ru={l.ru} en={l.en} />
          </a>
        ))}
        <a className="mlink" href="#contacts" onClick={() => setMenuOpen(false)}><T ru="Контакты" en="Contacts" /></a>
        <div className="mlang">
          <button className={`lang-btn ${lang === 'ru' ? 'active' : ''}`} onClick={() => onSetLang('ru')}>RU</button>
          <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => onSetLang('en')}>EN</button>
        </div>
      </div>
    </>
  );
}
