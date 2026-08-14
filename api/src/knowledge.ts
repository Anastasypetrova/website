/**
 * What the model is allowed to know.
 *
 * Everything here comes from src/content.ts — the same file the site renders —
 * so the letters cannot describe a site that no longer exists. Nothing else is
 * given to the model, and the prompt forbids going beyond it.
 */
import { faqItems, links } from '../../src/content';

const FORMATS = `
ФОРМАТЫ РАБОТЫ (четыре, все онлайн, на русском языке):

1. Samadhi Club — закрытый клуб по подписке.
   Ежедневное присутствие Анастасии, более 200 часов подкастов, разборы,
   авторские практики, живые эфиры. Подписка на 1, 3, 6 или 12 месяцев.
   Раздел сайта: ${links.site}/#club

2. Личная консультация — одна сессия, 1 час, один на один в Zoom.
   Разбор конкретного запроса.
   Раздел сайта: ${links.site}/#personal-session

3. Индивидуальное менторство — глубокая длительная работа.
   Программы на 5 сессий (2-3 месяца) и на 10 сессий (4-6 месяцев),
   сессии раз в 10-14 дней, между сессиями — поддержка в чате Telegram.
   Раздел сайта: ${links.site}/#mentorship

4. Мастермайнд-группа — групповой онлайн-формат.
   Работа в кругу участников, брейнсторм, разбор личных кейсов.
   Даты уточняются, есть анкета предзаписи.
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

  return [ABOUT, FORMATS, `ЧАСТЫЕ ВОПРОСЫ С САЙТА:\n\n${faq}`, CONTACTS].join('\n\n---\n\n');
}
