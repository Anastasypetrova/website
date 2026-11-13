import { useCallback, useEffect, useRef, useState } from 'react';
import { T, useLang } from '../i18n';
import { Photo } from './Photo';
import { trackClick } from '../api';
import { ExpandIcon } from './Icons';
import type { PhotoKey } from '../photos';

/**
 * Приложение клуба — за иконкой, а не рядом с ней.
 *
 * Четыре скриншота подряд говорили одно и то же «это приложение» четыре раза
 * и перекрикивали всё вокруг. Иконка говорит то же самое один раз и тише:
 * её узнаёшь мгновенно, по ней хочется нажать, и она весит 5 КБ вместо 370.
 *
 * Экраны грузятся только когда их открыли: тот, кто пролистал блок мимо, не
 * скачивает ни одного.
 */
const shots: [PhotoKey, string, string][] = [
  ['app2', 'Главный экран клуба', 'The club home screen'],
  ['app3', 'Практики, медитации, марафоны', 'Practices, meditations, marathons'],
  ['app4', 'Книжный клуб, кино, музыка', 'Book club, films, music'],
  ['app1', 'И всё это — на рабочем столе', 'And all of it on your home screen'],
];

export function AppDemo() {
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);
  const [seen, setSeen] = useState(false);
  const touchX = useRef<number | null>(null);

  // Подсказка срабатывает, когда до иконки действительно долистали: анимация,
  // отыгравшая выше экрана, — это не подсказка, а потраченный зря кадр.
  useEffect(() => {
    const el = iconRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const watch = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          watch.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    watch.observe(el);
    return () => watch.disconnect();
  }, []);

  const go = useCallback((step: number) => {
    setI((n) => (n + step + shots.length) % shots.length);
  }, []);

  // Клавиатура: Esc закрывает, стрелки листают. Открытое окно поверх страницы,
  // из которого нельзя выйти с клавиатуры, — это ловушка, а не окно.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    // Страница под окном не должна уезжать, пока листаешь экраны
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, go]);

  const show = () => {
    setI(0);
    setOpen(true);
    trackClick('club-app');
  };

  const current = shots[i];
  const caption = lang === 'en' ? current[2] : current[1];

  return (
    <>
      <button type="button" className={`appicon${seen ? ' appicon-seen' : ''}`} onClick={show} ref={iconRef}>
        <span className="appicon-img">
          <Photo name="appicon" alt="Samadhi Club" />
          {/* Значок в углу, как на обложке видео: без него картинка читается
              как иллюстрация, с ним — как то, что можно открыть. */}
          <span className="appicon-badge" aria-hidden="true">
            <ExpandIcon />
          </span>
        </span>
        <span className="appicon-link">
          <T ru="Посмотреть экраны" en="See the screens" />
        </span>
      </button>

      {open && (
        <div
          className="appmodal"
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'en' ? 'Club app screens' : 'Экраны приложения клуба'}
          onClick={() => setOpen(false)}
        >
          {/* Нажатие по самому окну не должно его закрывать — только по фону */}
          <div className="appmodal-box" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="appmodal-x"
              onClick={() => setOpen(false)}
              aria-label={lang === 'en' ? 'Close' : 'Закрыть'}
              ref={closeRef}
            >
              ×
            </button>

            <div className="appmodal-row">
              <button
                type="button"
                className="appmodal-arw"
                onClick={() => go(-1)}
                aria-label={lang === 'en' ? 'Previous screen' : 'Предыдущий экран'}
              >
                ‹
              </button>

              <div
                className="appmodal-phone"
                onTouchStart={(e) => {
                  touchX.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  const from = touchX.current;
                  if (from === null) return;
                  const moved = e.changedTouches[0].clientX - from;
                  if (Math.abs(moved) > 40) go(moved < 0 ? 1 : -1);
                  touchX.current = null;
                }}
              >
                <Photo key={current[0]} name={current[0]} alt={caption} objectPosition="top" />
              </div>

              <button
                type="button"
                className="appmodal-arw"
                onClick={() => go(1)}
                aria-label={lang === 'en' ? 'Next screen' : 'Следующий экран'}
              >
                ›
              </button>
            </div>

            <div className="appmodal-cap">{caption}</div>

            <div className="appmodal-dots">
              {shots.map(([name], n) => (
                <button
                  key={name}
                  type="button"
                  className={`appmodal-dot${n === i ? ' on' : ''}`}
                  onClick={() => setI(n)}
                  aria-label={`${lang === 'en' ? 'Screen' : 'Экран'} ${n + 1}`}
                  aria-current={n === i}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
