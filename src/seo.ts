/**
 * Structured data for search engines, built from the same content the page
 * renders so the two cannot drift apart.
 *
 * Imported by vite.config.ts, which inlines the result into index.html at build
 * time — a crawler has to find it in the HTML, and Google's FAQ rich result in
 * particular is only granted to markup that matches visible page content.
 */
import { faqItems, links, pricing, type FaqItem } from './content';

export const SITE_URL = 'https://anastasia-samadhi.club';
export const SITE_NAME = 'Анастасия Петрова';
export const SITE_TAGLINE = 'исследователь сознания и трансформационный ментор';
export const SITE_DESCRIPTION =
  'Помогаю выйти за пределы ограничивающих концепций через внимание и состояние. ' +
  'Samadhi Club, личные консультации, менторство и мастермайнд-группы.';

/** `price` is the number Google reads; `note` is what a person is told. */
const services: { name: string; description: string; url: string; price?: number; currency?: string; note?: string }[] = [
  {
    name: 'Samadhi Club',
    description:
      'Закрытый клуб по подписке: ежедневное присутствие автора, более 200 часов подкастов, ' +
      'разборы, авторские практики и живые эфиры.',
    url: `${SITE_URL}/#club`,
    price: 17,
    currency: 'EUR',
    note: pricing.club.ru,
  },
  {
    name: 'Личная консультация',
    description:
      'Час один на один онлайн: разбираем конкретный запрос через работу с вниманием и состоянием.',
    url: `${SITE_URL}/#personal-session`,
    price: 300,
    currency: 'EUR',
  },
  {
    name: 'Индивидуальное менторство',
    description:
      'Глубокая длительная работа над одной темой, растянутая на несколько сессий.',
    url: `${SITE_URL}/#mentorship`,
    price: 2500,
    currency: 'EUR',
  },
  {
    name: 'Мастермайнд-группа',
    description:
      'Групповой онлайн-формат: работа в кругу единомышленников, брейнсторм и разбор ваших кейсов.',
    url: `${SITE_URL}/#mastermind`,
    price: 1200,
    currency: 'EUR',
  },
];

export function buildStructuredData(): string {
  const person = {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: SITE_NAME,
    alternateName: 'Anastasia Petrova',
    description: `${SITE_NAME} — ${SITE_TAGLINE}.`,
    jobTitle: 'Трансформационный ментор',
    url: SITE_URL,
    image: `${SITE_URL}/og-image.jpg`,
    email: `mailto:${links.email}`,
    knowsLanguage: ['ru', 'en'],
    // sameAs is how a search engine ties the site to the profiles it already
    // knows, which is most of what "brand" means to it
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

  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: 'ru-RU',
    publisher: { '@id': `${SITE_URL}/#person` },
  };

  const page = {
    '@type': 'ProfilePage',
    '@id': `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    inLanguage: 'ru-RU',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#person` },
    primaryImageOfPage: `${SITE_URL}/og-image.jpg`,
  };

  const faq = {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/#faq`,
    inLanguage: 'ru-RU',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: faqItems.map((item: FaqItem) => ({
      '@type': 'Question',
      name: item.q.ru,
      acceptedAnswer: { '@type': 'Answer', text: item.a.ru },
    })),
  };

  const offers = services.map((s) => ({
    '@type': 'Service',
    name: s.name,
    description: s.description,
    url: s.url,
    serviceType: 'Коучинг и менторство',
    provider: { '@id': `${SITE_URL}/#person` },
    areaServed: 'Worldwide',
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: s.url,
      availableLanguage: { '@type': 'Language', name: 'Russian' },
    },
    ...(s.price
      ? {
          offers: {
            '@type': 'Offer',
            url: s.url,
            // the club is a subscription, so its figure is a starting price
            ...(s.name === 'Samadhi Club'
              ? { priceSpecification: { '@type': 'PriceSpecification', minPrice: s.price, priceCurrency: s.currency } }
              : { price: s.price, priceCurrency: s.currency }),
            availability: 'https://schema.org/InStock',
            ...(s.note ? { description: s.note } : {}),
          },
        }
      : {}),
  }));

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [person, website, page, faq, ...offers],
  });
}

export function buildSitemap(lastmod: string): string {
  // Only the one URL: the документы live on hash routes (#/docs/...), and a
  // search engine treats a fragment as part of this same page, never as a page
  // of its own. Listing them would be listing this URL seven more times.
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
}
