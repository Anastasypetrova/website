import { createContext, useContext } from 'react';
import type { Lang } from './i18n';
import { HOME, pathOf, rootPrefix, samePage, type Here, type Route } from './routes';

/**
 * Где мы сейчас — чтобы ссылки знали, откуда считать путь.
 *
 * Все ссылки внутри сайта относительные: `docs/oferta/` с главной и
 * `../docs/oferta/` со страницы формата. Так сайт одинаково работает и на
 * своём домене, и под подпапкой, где абсолютный `/docs/...` ведёт в никуда.
 */
export const HereContext = createContext<Here>({ route: HOME, lang: 'ru' });

export function useHere(): Here {
  return useContext(HereContext);
}

/**
 * Превью — весь сайт, упакованный в один файл (scripts/preview-artifact.mjs):
 * смотреть черновик до публикации. Папок там нет, поэтому страницы внутри него
 * живут на «решётках»: `#/samadhi-club/`. На самом сайте этого не бывает —
 * флаг ставит сам упаковщик.
 */
export const previewMode =
  typeof window !== 'undefined' && Boolean((window as { __PREVIEW__?: unknown }).__PREVIEW__);

export function hrefFrom(here: Here, to: Route, lang: Lang, anchor?: string): string {
  const hash = anchor ? `#${anchor}` : '';
  // Ссылка на ту же страницу — это якорь, а не переход: иначе нажатие на
  // «Видео» на главной перезагружало бы главную.
  if (samePage(here, { route: to, lang })) return hash || '#top';
  if (previewMode) return `#/${pathOf(to, lang)}`;
  return rootPrefix(here) + pathOf(to, lang) + hash;
}

/** `href(route, lang?, anchor?)` — ссылка на страницу сайта с текущей страницы. */
export function useHref() {
  const here = useHere();
  return (to: Route, lang?: Lang, anchor?: string) => hrefFrom(here, to, lang ?? here.lang, anchor);
}

/** Ссылка на якорь главной: `#videos` с главной, `../#videos` со страницы формата. */
export function useHomeAnchor() {
  const href = useHref();
  return (anchor: string) => href(HOME, undefined, anchor);
}

/** Ссылка на страницу документа: `docs/oferta/` с главной, `../docs/oferta/` — с формата. */
export function useDocHref() {
  const href = useHref();
  return (slug: string) => href({ kind: 'doc', slug });
}

/** Путь к файлу в корне сайта (PDF, картинка) с текущей страницы. */
export function useAsset() {
  const here = useHere();
  return (path: string) => rootPrefix(here) + path;
}
