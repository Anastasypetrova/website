# Анастасия Петрова — сайт

Одностраничный сайт-визитка на React + TypeScript + Vite. Билингвальный (RU/EN, переключение в шапке, сохраняется в `localStorage`).

## Разработка

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

## Структура

- `src/content.ts` — все двуязычные тексты, списки видео/подкастов, отзывы, FAQ, ссылки, документы.
- `src/i18n.tsx` — контекст языка и компонент `<T ru="" en="" />`.
- `src/components/` — секции страницы (Nav, Hero, Reviews, форматы работы, About, FAQ, Contact, Footer и т.д.).
- `src/photos/` — фотографии сайта, см. `src/photos/README.md`.
- `src/styles.css` — дизайн-токены и стили.
- `public/docs/` — юридические документы (оферта, политика конфиденциальности и т.д.), на которые ссылается футер.

## Фотографии

Положите файлы в `src/photos/`, назвав их по слотам: `hero`, `about`, `club`,
`consultation`, `mentorship`, `mastermind`, `quote`, `telegram`, `contacts`.
Расширение любое (`.jpg`, `.png`, `.webp`, `.avif`) — Vite подхватит их сам.
Подробности и рекомендации по кадрам — в `src/photos/README.md`.

Слот без файла показывает нейтральную заглушку, поэтому сайт остаётся рабочим,
пока фотографии ещё подбираются.

## Заметки

- Формы подписки и обратной связи сейчас — заглушки (`preventDefault` + точка расширения `submitContactForm`/`submitNewsletter`), готовые для подключения к будущему боту в Telegram.
- Домен: `anastasia-samadhi.club` (хостинг ещё не настроен).
