/**
 * What the model is allowed to know.
 *
 * Everything here comes from src/content.ts — the same file the site renders —
 * so the letters cannot describe a site that no longer exists. Nothing else is
 * given to the model, and the prompt forbids going beyond it.
 */
import { faqItems, links, pricing, reviews } from '../../src/content';

const FORMATS = () => `
ФОРМАТЫ РАБОТЫ (четыре, все онлайн, на русском языке):

1. Samadhi Club — закрытый клуб по подписке.
   Ежедневное присутствие Анастасии, более 200 часов подкастов, разборы,
   авторские практики, живые эфиры. Подписка на 1, 3, 6 или 12 месяцев.
   СТОИМОСТЬ: ${pricing.club.ru}
   Раздел сайта: ${links.site}/#club

2. Личная консультация — одна сессия, 1 час, один на один в Zoom.
   Разбор конкретного запроса.
   СТОИМОСТЬ: ${pricing.consultation.ru}
   Раздел сайта: ${links.site}/#personal-session

3. Индивидуальное менторство — глубокая длительная работа.
   Сессии раз в 10-14 дней, между сессиями — поддержка в чате Telegram.
   СТОИМОСТЬ:
${pricing.mentorship.map((t) => `     — ${t.sessions.ru}: ${t.price}`).join('\n')}
   Вход только после короткого созвона и анкеты, одновременно не более двух человек.
   Раздел сайта: ${links.site}/#mentorship

4. Мастермайнд-группа — групповой онлайн-формат.
   7 недель, созвоны раз в неделю по 2 часа, группа из 5 человек,
   постоянный чат. Брейнсторм и разбор личных кейсов.
   СТОИМОСТЬ: ${pricing.mastermind.ru}
   Даты следующих групп уточняются, есть анкета предзаписи.
   Вход только после анкеты и личного созвона.
   Раздел сайта: ${links.site}/#mastermind
`.trim();

const ABOUT = `
ОБ АНАСТАСИИ:
Исследователь сознания и трансформационный ментор. Более 15 лет в духовных
практиках: випассаны, медитации, дыхательные практики, тибетское учение Дзогчен,
гипнотерапия, осознанные сны. Ведёт YouTube с миллионами просмотров.
Помогает выйти за пределы ограничивающих концепций через работу с вниманием и
состоянием.

Услуги носят образовательный и консультационный характер. Это НЕ медицинская,
НЕ психиатрическая и НЕ психотерапевтическая помощь.
`.trim();

const CONTACTS = `
КОНТАКТЫ И ССЫЛКИ:
Сайт: ${links.site}
Telegram-канал: ${links.telegramChannel}
YouTube: ${links.youtube}
Отзывы: ${links.reviewsChannel}
Почта: ${links.email}
`.trim();

/** The full grounding text handed to the model with every question. */
export function knowledgeBase(): string {
  const faq = faqItems
    .map((item, i) => `${i + 1}. ВОПРОС: ${String(item.q.ru)}\n   ОТВЕТ: ${String(item.a.ru)}`)
    .join('\n\n');

  // A couple of real reviews give the model something concrete to point at
  // when someone asks what people actually get out of this.
  const voices = reviews
    .slice(0, 3)
    .map((r) => `«${String(r.quote.ru)}» — ${r.name}: ${String(r.body.ru)}`)
    .join('\n\n');

  return [
    ABOUT,
    FORMATS(),
    `ЧАСТЫЕ ВОПРОСЫ С САЙТА:\n\n${faq}`,
    `ОТЗЫВЫ УЧАСТНИКОВ (все — на ${links.reviewsChannel}):\n\n${voices}`,
    CONTACTS,
  ].join('\n\n---\n\n');
}
