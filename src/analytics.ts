/**
 * Счётчики посещаемости и подтверждение прав на сайт.
 *
 * Пока строка пустая — соответствующий скрипт на страницу не попадает вообще.
 * Ни одного лишнего запроса, ни одного байта: счётчик, который не настроен,
 * просто не существует. Вписали ключ — он появился сам.
 *
 * Где брать каждый ключ, написано рядом.
 */
export const analytics = {
  /**
   * Cloudflare Web Analytics — основной счётчик. Бесплатный, не ставит куки,
   * не собирает персональных данных, поэтому не требует баннера про cookie.
   *
   * dash.cloudflare.com → Analytics & Logs → Web Analytics → Add a site.
   * Выдаст кусок кода; нужен из него только token — строка из букв и цифр.
   */
  cloudflareToken: '6468fc5178ba4e2eab22586da98549a6',

  /**
   * Яндекс.Метрика — номер счётчика, восемь-девять цифр.
   * metrika.yandex.ru → Добавить счётчик.
   *
   * Внимание: ставит куки. Включать только вместе с баннером о cookie,
   * иначе сайт будет противоречить собственной Cookie Policy.
   */
  yandexMetrika: '',

  /**
   * Google Analytics 4 — идентификатор потока вида G-XXXXXXXXXX.
   * analytics.google.com → Администратор → Потоки данных.
   *
   * Тоже ставит куки, с той же оговоркой. И заметно тяжелее остальных:
   * если Cloudflare уже стоит, GA почти всегда лишний.
   */
  googleAnalytics: '',

  /**
   * Подтверждение прав в Google Search Console — содержимое мета-тега,
   * который выдаёт сам Search Console при выборе способа «HTML-тег».
   * Не счётчик: показывает, по каким запросам сайт находят в поиске.
   */
  googleSiteVerification: '',

  /** То же самое для Яндекс.Вебмастера: webmaster.yandex.ru → HTML-файл/мета-тег. */
  yandexVerification: '',
} as const;

/** Собирает теги для <head>. Пустые ключи пропускаются. */
export function buildAnalyticsTags(): string {
  const tags: string[] = [];

  if (analytics.googleSiteVerification) {
    tags.push(`<meta name="google-site-verification" content="${analytics.googleSiteVerification}" />`);
  }
  if (analytics.yandexVerification) {
    tags.push(`<meta name="yandex-verification" content="${analytics.yandexVerification}" />`);
  }

  // defer, а не async: счётчик не должен соревноваться с отрисовкой первого
  // экрана за канал. Статистику он отправит на долю секунды позже — на цифры
  // это не влияет, на скорость сайта влияет.
  if (analytics.cloudflareToken) {
    tags.push(
      `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" ` +
        `data-cf-beacon='{"token":"${analytics.cloudflareToken}"}'></script>`,
    );
  }

  if (analytics.yandexMetrika) {
    const id = analytics.yandexMetrika;
    tags.push(
      `<script>(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};` +
        `m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,` +
        `a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");` +
        `ym(${id},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true});</script>` +
        `<noscript><div><img src="https://mc.yandex.ru/watch/${id}" style="position:absolute;left:-9999px" alt="" /></div></noscript>`,
    );
  }

  if (analytics.googleAnalytics) {
    const id = analytics.googleAnalytics;
    tags.push(
      `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>` +
        `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}` +
        `gtag("js",new Date());gtag("config","${id}");</script>`,
    );
  }

  return tags.join('\n    ');
}
