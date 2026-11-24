/**
 * Адреса сайта — один список на всё: сборку, разметку, карту сайта и ссылки
 * внутри страниц.
 *
 * До этого сайт был одной страницей, а документы жили на «решётках»
 * (`#/docs/oferta`). Всё после `#` поисковик отбрасывает: для него это та же
 * главная, поэтому в выдаче у сайта был ровно один адрес. Здесь описаны
 * настоящие пути, которые сборка превращает в настоящие файлы.
 *
 * Пути всегда относительные и без ведущего слэша — сайт должен работать и на
 * своём домене, и под подпапкой (`anastasypetrova.github.io/website/`), где
 * абсолютный путь ведёт в никуда.
 */
import type { Lang } from './i18n';
import { foreverYoungPrice, showMastermind } from './content';
import { legalDocs } from './legalDocs.generated';
import { articles, showBlog } from './articles';

export type ServiceSlug =
  | 'samadhi-club'
  | 'consultation'
  | 'mentorship'
  | 'mastermind'
  | 'forever-young';

export type Route =
  | { kind: 'home' }
  | { kind: 'service'; slug: ServiceSlug }
  | { kind: 'doc'; slug: string }
  /** Список статей. */
  | { kind: 'blog' }
  | { kind: 'article'; slug: string };

/** Страница, на которой мы сейчас: адрес плюс язык. */
export interface Here {
  route: Route;
  lang: Lang;
}

export const HOME: Route = { kind: 'home' };

interface Text {
  ru: string;
  en: string;
}

export interface ServiceDef {
  slug: ServiceSlug;
  /** Тот же раздел на главной — ссылка «наверх» и источник текста. */
  anchor: string;
  /** Короткое имя: хлебные крошки и разметка. */
  name: Text;
  /** Заголовок вкладки и строка в выдаче. До 60 знаков, иначе обрежут. */
  title: Text;
  /** Описание под строкой выдачи. 120–160 знаков. */
  description: Text;
}

/**
 * Заголовки и описания — то, что человек читает в выдаче, ещё не зайдя на
 * сайт. Поэтому в каждом стоит, что это и сколько стоит, а не одно название.
 */
const allServices: ServiceDef[] = [
  {
    slug: 'samadhi-club',
    anchor: 'club',
    name: { ru: 'Samadhi Club', en: 'Samadhi Club' },
    title: {
      ru: 'Samadhi Club — клуб по подписке | Анастасия Петрова',
      en: 'Samadhi Club — subscription club | Anastasia Petrova',
    },
    description: {
      ru: 'Закрытый клуб-приложение: 150+ часов контента, живые эфиры, разборы ваших вопросов, 20 авторских практик и живое сообщество. От 23 € в месяц.',
      en: 'A private club app: 150+ hours of content, live sessions, breakdowns of your questions, 20 original practices and a living community. From €23 a month.',
    },
  },
  {
    slug: 'consultation',
    anchor: 'personal-session',
    name: { ru: 'Личная консультация', en: 'Personal consultation' },
    title: {
      ru: 'Личная консультация — Анастасия Петрова',
      en: 'Personal consultation — Anastasia Petrova',
    },
    description: {
      ru: 'Час один на один онлайн: разбираем ваш запрос через работу с вниманием и состоянием. Практики, книги и ссылки после сессии. 300 € / 30000 ₽.',
      en: 'One hour one to one online: we work through your request via attention and state. Practices, books and links after the session. €300 / 30000 RUB.',
    },
  },
  {
    slug: 'mentorship',
    anchor: 'mentorship',
    name: { ru: 'Индивидуальное менторство', en: 'Individual mentorship' },
    title: {
      ru: 'Индивидуальное менторство — Анастасия Петрова',
      en: 'Individual mentorship — Anastasia Petrova',
    },
    description: {
      ru: 'Глубокая работа над вашей ситуацией: 5 или 10 сессий в Zoom, персональные практики и чат с поддержкой между встречами. От 2500 €.',
      en: 'Deep work on your situation: 5 or 10 Zoom sessions, personal practices and a support chat between meetings. From €2500.',
    },
  },
  {
    slug: 'mastermind',
    anchor: 'mastermind',
    name: { ru: 'Мастермайнд-группа', en: 'Mastermind group' },
    title: {
      ru: 'Мастермайнд-группа — Анастасия Петрова',
      en: 'Mastermind group — Anastasia Petrova',
    },
    description: {
      ru: 'Групповой онлайн-формат: работа в кругу единомышленников, брейнсторм и разбор ваших случаев. 1200 €.',
      en: 'A group format online: work in a circle of like-minded people, brainstorming and breakdowns of your cases. €1200.',
    },
  },
  {
    slug: 'forever-young',
    anchor: 'forever-young',
    name: { ru: 'Forever Young', en: 'Forever Young' },
    title: {
      ru: 'Forever Young — клуб о теле и нестарении | Анастасия Петрова',
      en: 'Forever Young — a club about the body | Anastasia Petrova',
    },
    description: {
      ru: `Холистический подход к красоте и здоровью: тренировки, питание, биохакинг, уход за телом и лицом, масла и восстановление. Мой личный опыт. ${foreverYoungPrice.ru}.`,
      en: `A holistic approach to beauty and health: training, nutrition, biohacking, caring for the body and face, oils and recovery. My own experience. ${foreverYoungPrice.en}.`,
    },
  },
];

/** Формат без своего раздела на главной не получает и своей страницы. */
export const services: ServiceDef[] = allServices.filter(
  (s) => s.slug !== 'mastermind' || showMastermind,
);

export function findService(slug: string): ServiceDef | undefined {
  return services.find((s) => s.slug === slug);
}

/**
 * Путь страницы от корня сайта, без ведущего слэша и всегда со слэшем на
 * конце: `''`, `'en/'`, `'samadhi-club/'`, `'docs/oferta/'`.
 *
 * Документы — только по-русски: текст у них юридически русский, и английский
 * адрес с русским текстом был бы пустой страницей в индексе. Язык интерфейса
 * на них по-прежнему переключается кнопкой, без смены адреса.
 */
export function pathOf(route: Route, lang: Lang): string {
  if (route.kind === 'doc') return `docs/${route.slug}/`;
  // Статьи выросли из русских роликов, английских двойников у них нет —
  // как и у документов. Английский адрес с русским текстом был бы пустой
  // страницей в индексе.
  if (route.kind === 'blog') return 'blog/';
  if (route.kind === 'article') return `blog/${route.slug}/`;
  const prefix = lang === 'en' ? 'en/' : '';
  return route.kind === 'home' ? prefix : `${prefix}${route.slug}/`;
}

/** Сколько папок вглубь лежит страница: `/en/samadhi-club/` — две. */
export function depthOf(route: Route, lang: Lang): number {
  return pathOf(route, lang).split('/').filter(Boolean).length;
}

/** Путь к корню сайта с этой страницы: `''`, `'../'`, `'../../'`. */
export function rootPrefix(here: Here): string {
  return '../'.repeat(depthOf(here.route, here.lang));
}

export function samePage(a: Here, b: Here): boolean {
  return pathOf(a.route, a.lang) === pathOf(b.route, b.lang);
}

/** Все страницы, которые собирает сборка и перечисляет карта сайта. */
export function allPages(): Here[] {
  const pages: Here[] = [
    { route: HOME, lang: 'ru' },
    { route: HOME, lang: 'en' },
  ];
  for (const s of services) {
    pages.push({ route: { kind: 'service', slug: s.slug }, lang: 'ru' });
    pages.push({ route: { kind: 'service', slug: s.slug }, lang: 'en' });
  }
  if (showBlog) {
    pages.push({ route: { kind: 'blog' }, lang: 'ru' });
    for (const a of articles) {
      pages.push({ route: { kind: 'article', slug: a.slug }, lang: 'ru' });
    }
  }
  for (const d of legalDocs) {
    pages.push({ route: { kind: 'doc', slug: d.slug }, lang: 'ru' });
  }
  return pages;
}

/** У документов английского адреса нет, поэтому и пары языков у них нет. */
export function hasLangPair(route: Route): boolean {
  return route.kind === 'home' || route.kind === 'service';
}

/**
 * Какая страница открыта, по адресу в браузере.
 *
 * Считается с конца пути, а не с начала: под подпапкой (`/website/en/`) начало
 * занято именем репозитория, и привязка к началу сломала бы все адреса.
 */
export function routeFromPath(pathname: string): Here {
  const parts = pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1] ?? '';
  const prev = parts[parts.length - 2] ?? '';

  if (prev === 'docs' && legalDocs.some((d) => d.slug === last)) {
    return { route: { kind: 'doc', slug: last }, lang: 'ru' };
  }
  if (prev === 'blog' && articles.some((a) => a.slug === last)) {
    return { route: { kind: 'article', slug: last }, lang: 'ru' };
  }
  if (last === 'blog' && showBlog) return { route: { kind: 'blog' }, lang: 'ru' };
  if (findService(last)) {
    return { route: { kind: 'service', slug: last as ServiceSlug }, lang: prev === 'en' ? 'en' : 'ru' };
  }
  return { route: HOME, lang: last === 'en' ? 'en' : 'ru' };
}
