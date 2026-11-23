import { useEffect } from 'react';
import { trackClick } from '../api';

/**
 * Что человек делает на странице — без единой куки.
 *
 * Google Analytics за те же ответы берёт куки, баннер про них и сотню
 * килобайт на первый экран. Здесь считается ровно то, что нужно, чтобы
 * увидеть, где теряются люди: докуда дочитали, какие разделы увидели, дошли
 * ли до цены. Ничего не сохраняется на устройстве: каждое событие уходит
 * само по себе, и связать два визита одного человека по ним нельзя.
 *
 * Считается положением блока, а не IntersectionObserver: тот сверяет
 * пересечения по кадрам, и блок, через который пролетели одним махом, он
 * молча пропускает. На быстрой прокрутке так терялась цена — то есть ровно
 * та ступень воронки, ради которой всё и затевалось.
 *
 * Каждое событие считается один раз за загрузку страницы (`once` в trackClick).
 */

/** Отметки прокрутки: четверть, половина, три четверти, до конца. */
const MARKS = [25, 50, 75, 100];

/**
 * `formats` уже считается событием `formats-seen` с 12 ноября — не дублируем.
 * `top` — это первый экран: он виден у всех и означал бы просто «зашёл».
 */
const SKIP_SECTIONS = new Set(['formats', 'top']);

/** Блок считается увиденным, когда его верх поднялся выше этой доли экрана. */
const SEEN_LINE = 0.85;

export function PageTracking() {
  useEffect(() => {
    const targets: { node: Element; event: string }[] = [];

    for (const node of document.querySelectorAll('section[id]')) {
      if (SKIP_SECTIONS.has(node.id) || !/^[a-z-]{3,20}$/.test(node.id)) continue;
      targets.push({ node, event: `seen:${node.id}` });
    }
    for (const node of document.querySelectorAll('[data-price]')) {
      const product = (node as HTMLElement).dataset.price;
      if (product) targets.push({ node, event: `price:${product}` });
    }

    let pending = false;
    const depthDone = new Set<number>();

    const measure = () => {
      pending = false;
      const line = window.innerHeight * SEEN_LINE;

      for (let i = targets.length - 1; i >= 0; i -= 1) {
        // верх блока выше линии — значит он на экране или уже позади
        if (targets[i].node.getBoundingClientRect().top < line) {
          trackClick(targets[i].event, true);
          targets.splice(i, 1);
        }
      }

      // Только documentElement: на body стоит zoom, и его scrollHeight живёт в
      // другой системе координат, чем scrollY с innerHeight. Если взять
      // больший из двух, «до конца» упирается в 90 % и не срабатывает никогда.
      const height = document.documentElement.scrollHeight;
      if (height > window.innerHeight) {
        const reached = ((window.scrollY + window.innerHeight) / height) * 100;
        for (const mark of MARKS) {
          // у «до конца» допуск: последние пиксели съедают панели браузера
          const hit = mark === 100 ? reached >= 98 : reached >= mark;
          if (hit && !depthDone.has(mark)) {
            depthDone.add(mark);
            trackClick(`depth:${mark}`, true);
          }
        }
      }
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    // Картинки догружаются и двигают всё вниз: то, что было «увидено» на
    // пустой странице, на самом деле ещё не показывалось.
    window.addEventListener('load', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('load', onScroll);
    };
  }, []);

  return null;
}
