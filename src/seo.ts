/**
 * Всё, что страница говорит поисковику: заголовок, описание, канонический
 * адрес, языковые пары, карточка для мессенджеров и разметка schema.org.
 *
 * Собирается из того же `content.ts`, что и видимый текст, — иначе разметка и
 * страница однажды разойдутся, а именно за это Google и снимает сниппет.
 *
 * Эти же функции вызывает `vite.config.ts` (для главной) и
 * `scripts/prerender.mjs` (для всех остальных страниц), так что голова у всех
 * страниц строится одним кодом.
 */
import {
  clubPlans,
  faqItems,
  foreverYoungPrice,
  links,
  pricing,
  type FaqItem,
} from './content';
import { legalDocs } from './legalDocs.generated';
import type { Lang } from './i18n';
import {
  allPages,
  findService,
  hasLangPair,
  pathOf,
  services,
  type Here,
  type Route,
  type ServiceSlug,
} from './routes';

export const SITE_URL = 'https://anastasia-samadhi.club';
export const SITE_NAME = 'Анастасия Петрова';
export const SITE_TAGLINE = 'исследователь сознания и трансформационный ментор';
export const SITE_DESCRIPTION =
  'Помогаю выйти за пределы ограничивающих концепций через внимание и состояние. ' +
  'Два клуба по подписке, личные консультации и индивидуальное менторство.';

const site = {
  ru: {
    name: SITE_NAME,
    title: 'Анастасия Петрова — трансформационный ментор',
    description:
      'Анастасия Петрова — исследователь сознания и трансформационный ментор. ' +
      'Два клуба по подписке, личные консультации и индивидуальное менторство.',
    ogTitle: `${SITE_NAME} — ${SITE_TAGLINE}`,
    ogDescription: SITE_DESCRIPTION,
    locale: 'ru_RU',
    inLanguage: 'ru-RU',
    home: 'Главная',
    docs: 'Документы',
  },
  en: {
    name: 'Anastasia Petrova',
    title: 'Anastasia Petrova — transformational mentor',
    description:
      'Anastasia Petrova — consciousness researcher and transformational mentor. ' +
      'Two subscription clubs, personal consultations and individual mentorship.',
    ogTitle: 'Anastasia Petrova — consciousness researcher and transformational mentor',
    ogDescription:
      'I help you move beyond limiting concepts through attention and state. ' +
      'Two subscription clubs, personal consultations and individual mentorship.',
    locale: 'en_US',
    inLanguage: 'en-US',
    home: 'Home',
    docs: 'Documents',
  },
} as const;

/** Полный адрес страницы — тот, что стоит в canonical и в карте сайта. */
export function urlOf(route: Route, lang: Lang): string {
  return `${SITE_URL}/${pathOf(route, lang)}`;
}

/** `price` — число, которое читает Google; `note` — то, что читает человек. */
interface ServiceData {
  description: { ru: string; en: string };
  price?: number;
  currency?: string;
  note?: { ru: string; en: string };
}

const serviceData: Record<ServiceSlug, ServiceData> = {
  'samadhi-club': {
    description: {
      ru:
        'Закрытый клуб-приложение по подписке: более 150 часов контента, 20+ эфиров в записи, ' +
        'разборы вопросов, авторские практики, марафоны и живое сообщество.',
      en:
        'A private subscription club app: over 150 hours of content, 20+ recorded live sessions, ' +
        'breakdowns of questions, original practices, marathons and a living community.',
    },
    price: clubPlans[0].price,
    currency: 'EUR',
    note: { ru: pricing.club.ru, en: pricing.club.en },
  },
  consultation: {
    description: {
      ru: 'Час один на один онлайн: разбираем конкретный запрос через работу с вниманием и состоянием.',
      en: 'One hour one to one online: we work through a specific request via attention and state.',
    },
    price: 300,
    currency: 'EUR',
  },
  mentorship: {
    description: {
      ru: 'Глубокая длительная работа над одной темой, растянутая на несколько сессий.',
      en: 'Deep, sustained work on one theme, spread across several sessions.',
    },
    price: 2500,
    currency: 'EUR',
  },
  mastermind: {
    description: {
      ru: 'Групповой онлайн-формат: работа в кругу единомышленников, брейнсторм и разбор ваших кейсов.',
      en: 'A group format online: work in a circle of like-minded people, brainstorming and case breakdowns.',
    },
    price: 1200,
    currency: 'EUR',
  },
  'forever-young': {
    description: {
      ru:
        'Клуб по подписке о теле и о том, как оставаться молодым: тренировки, питание, ' +
        'биохакинг, красота и уход за телом и лицом.',
      en:
        'A subscription club about the body and staying young: training, nutrition, ' +
        'biohacking, beauty and caring for the body and face.',
    },
    price: foreverYoungPrice.eur,
    currency: 'EUR',
    note: { ru: foreverYoungPrice.ru, en: foreverYoungPrice.en },
  },
};

const docOf = (slug: string) => legalDocs.find((d) => d.slug === slug);

/** Первый абзац документа — честное описание для выдачи, не выдуманное. */
function docDescription(slug: string): string {
  const doc = docOf(slug);
  const first = doc?.blocks.find((b) => b.kind === 'p')?.text ?? '';
  const text = first.length > 158 ? `${first.slice(0, 155).trimEnd()}…` : first;
  return text || `${doc?.title ?? 'Документ'} — ${SITE_NAME}.`;
}

interface PageMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
}

function metaFor({ route, lang }: Here): PageMeta {
  const s = site[lang];
  if (route.kind === 'home') {
    return { title: s.title, description: s.description, ogTitle: s.ogTitle, ogDescription: s.ogDescription };
  }
  if (route.kind === 'service') {
    const def = findService(route.slug);
    const title = def?.title[lang] ?? s.title;
    const description = def?.description[lang] ?? s.description;
    return { title, description, ogTitle: title, ogDescription: description };
  }
  const doc = docOf(route.slug);
  const title = `${doc?.title ?? 'Документ'} — ${SITE_NAME}`;
  const description = docDescription(route.slug);
  return { title, description, ogTitle: title, ogDescription: description };
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ------------------------------------------------------------------ разметка */

function personNode(lang: Lang) {
  return {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: SITE_NAME,
    alternateName: 'Anastasia Petrova',
    description: lang === 'en' ? 'Anastasia Petrova — consciousness researcher and transformational mentor.' : `${SITE_NAME} — ${SITE_TAGLINE}.`,
    jobTitle: lang === 'en' ? 'Transformational mentor' : 'Трансформационный ментор',
    url: SITE_URL,
    image: `${SITE_URL}/og-image.jpg`,
    email: `mailto:${links.email}`,
    knowsLanguage: ['ru', 'en'],
    // sameAs — то, чем поисковик связывает сайт с профилями, которые уже знает,
    // и это почти всё, что для него значит слово «бренд»
    sameAs: [links.youtube, links.instagram, links.telegramChannel],
    knowsAbout: [
      'осознанность',
      'медитация',
      'работа с вниманием',
      'трансформационное менторство',
      'исследование сознания',
      'дыхательные практики',
    ],
  };
}

function websiteNode(lang: Lang) {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: site[lang].name,
    description: site[lang].ogDescription,
    inLanguage: site[lang].inLanguage,
    publisher: { '@id': `${SITE_URL}/#person` },
  };
}

function serviceNode(slug: ServiceSlug, lang: Lang, url: string) {
  const data = serviceData[slug];
  const name = findService(slug)?.name[lang] ?? slug;
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name,
    description: data.description[lang],
    url,
    serviceType: lang === 'en' ? 'Coaching and mentorship' : 'Коучинг и менторство',
    provider: { '@id': `${SITE_URL}/#person` },
    areaServed: 'Worldwide',
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: url,
      availableLanguage: [
        { '@type': 'Language', name: 'Russian' },
        { '@type': 'Language', name: 'English' },
      ],
    },
    ...(data.price
      ? {
          offers: {
            '@type': 'Offer',
            url,
            // у клуба подписка, поэтому его цифра — цена «от», а не цена
            ...(slug === 'samadhi-club'
              ? {
                  priceSpecification: {
                    '@type': 'PriceSpecification',
                    minPrice: data.price,
                    priceCurrency: data.currency,
                  },
                }
              : { price: data.price, priceCurrency: data.currency }),
            availability: 'https://schema.org/InStock',
            ...(data.note ? { description: data.note[lang] } : {}),
          },
        }
      : {}),
  };
}

function breadcrumbs(here: Here, name: string) {
  const { lang } = here;
  const items = [
    { name: site[lang].home, item: urlOf({ kind: 'home' }, lang) },
    ...(here.route.kind === 'doc' ? [{ name: site[lang].docs, item: `${SITE_URL}/#documents` }] : []),
    { name, item: urlOf(here.route, lang) },
  ];
  return {
    '@type': 'BreadcrumbList',
    '@id': `${urlOf(here.route, lang)}#breadcrumbs`,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
}

function buildJsonLd(here: Here): string {
  const { route, lang } = here;
  const url = urlOf(route, lang);
  const meta = metaFor(here);
  const nodes: object[] = [personNode(lang), websiteNode(lang)];

  if (route.kind === 'home') {
    nodes.push(
      {
        '@type': 'ProfilePage',
        '@id': `${url}#webpage`,
        url,
        name: meta.ogTitle,
        description: meta.ogDescription,
        inLanguage: site[lang].inLanguage,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        // mainEntity, а не только about: карточку профиля в выдаче Google даёт
        // именно за него — «страница про этого человека», а не «упоминает его».
        mainEntity: { '@id': `${SITE_URL}/#person` },
        about: { '@id': `${SITE_URL}/#person` },
        primaryImageOfPage: `${SITE_URL}/og-image.jpg`,
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        inLanguage: site[lang].inLanguage,
        isPartOf: { '@id': `${url}#webpage` },
        mainEntity: faqItems.map((item: FaqItem) => ({
          '@type': 'Question',
          name: lang === 'en' ? item.q.en : item.q.ru,
          acceptedAnswer: { '@type': 'Answer', text: lang === 'en' ? item.a.en : item.a.ru },
        })),
      },
      // Услуги перечислены и на главной: это она отвечает на «что у неё есть».
      ...services.map((s) => serviceNode(s.slug, lang, urlOf({ kind: 'service', slug: s.slug }, lang))),
    );
  } else if (route.kind === 'service') {
    nodes.push(
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: meta.title,
        description: meta.description,
        inLanguage: site[lang].inLanguage,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${url}#service` },
        primaryImageOfPage: `${SITE_URL}/og-image.jpg`,
      },
      serviceNode(route.slug, lang, url),
      breadcrumbs(here, findService(route.slug)?.name[lang] ?? route.slug),
    );
  } else {
    const doc = docOf(route.slug);
    nodes.push(
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: doc?.title ?? meta.title,
        description: meta.description,
        inLanguage: 'ru-RU',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#person` },
        ...(doc?.revision ? { version: doc.revision } : {}),
      },
      breadcrumbs(here, doc?.title ?? route.slug),
    );
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
}

/* ----------------------------------------------------------------- голова */

/**
 * Весь SEO-блок страницы одной строкой. Вставляется между метками
 * `<!--seo:start-->` и `<!--seo:end-->` в index.html.
 *
 * Все адреса здесь абсолютные: мессенджер забирает страницу, не выполняя её
 * JavaScript, и относительный адрес он молча выбрасывает.
 */
export function buildHead(here: Here): string {
  const { route, lang } = here;
  const s = site[lang];
  const meta = metaFor(here);
  const url = urlOf(route, lang);
  const image = `${SITE_URL}/og-image.jpg`;

  const alternates = hasLangPair(route)
    ? [
        `<link rel="alternate" hreflang="ru" href="${urlOf(route, 'ru')}" />`,
        `<link rel="alternate" hreflang="en" href="${urlOf(route, 'en')}" />`,
        `<link rel="alternate" hreflang="x-default" href="${urlOf(route, 'ru')}" />`,
      ]
    : [];

  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    ...alternates,
    `<meta property="og:type" content="${route.kind === 'doc' ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="${esc(s.name)}" />`,
    `<meta property="og:locale" content="${s.locale}" />`,
    `<meta property="og:locale:alternate" content="${lang === 'en' ? 'ru_RU' : 'en_US'}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(meta.ogTitle)}" />`,
    `<meta property="og:description" content="${esc(meta.ogDescription)}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:secure_url" content="${image}" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(s.name)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.ogTitle)}" />`,
    `<meta name="twitter:description" content="${esc(meta.ogDescription)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<meta name="twitter:image:alt" content="${esc(s.name)}" />`,
    `<script type="application/ld+json">${buildJsonLd(here)}</script>`,
  ];

  return tags.map((t) => `    ${t}`).join('\n');
}

/* ------------------------------------------------------------- карта сайта */

/**
 * Карта сайта со всеми страницами и языковыми парами.
 *
 * Пары перечислены прямо здесь (`xhtml:link`), а не только в головах страниц:
 * так Google видит связь русской и английской версии сразу, не дожидаясь, пока
 * обойдёт обе.
 */
export function buildSitemap(lastmod: string): string {
  const weight = (here: Here) => {
    if (here.route.kind === 'home') return { priority: here.lang === 'ru' ? '1.0' : '0.8', changefreq: 'weekly' };
    if (here.route.kind === 'service') return { priority: here.lang === 'ru' ? '0.9' : '0.7', changefreq: 'monthly' };
    return { priority: '0.3', changefreq: 'yearly' };
  };

  const body = allPages()
    .map((here) => {
      const { priority, changefreq } = weight(here);
      const pairs = hasLangPair(here.route)
        ? (['ru', 'en'] as const)
            .map(
              (l) =>
                `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlOf(here.route, l)}" />`,
            )
            .join('\n') +
          `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${urlOf(here.route, 'ru')}" />`
        : '';
      return [
        '  <url>',
        `    <loc>${urlOf(here.route, here.lang)}</loc>`,
        pairs,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
}
