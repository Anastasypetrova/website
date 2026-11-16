/**
 * Печёт каждую страницу сайта в свой готовый HTML-файл.
 *
 * Без этого файл, который скачивает поисковый робот, — пустой
 * `<div id="root"></div>`: весь текст появляется только после того, как
 * выполнится JavaScript. Google его выполняет, но ставит такие страницы в
 * очередь и возвращается к ним позже, а Яндекс — который для русскоязычной
 * аудитории и важен — справляется с этим куда хуже. Запечённая разметка
 * означает, что текст просто есть, для любого робота, с первого запроса.
 *
 * Страниц теперь много: главная, её английская версия, по странице на каждый
 * формат (и тоже на двух языках) и по странице на каждый документ. Раньше
 * адрес был один, и в выдаче у сайта было ровно одно место, за которое он мог
 * бороться.
 *
 * React на загрузке перерисовывает то же дерево, так что ничего не
 * «замораживается»: переключатель языка, аккордеон и галочки согласия
 * работают как раньше. Разметка — стартовая картинка, а не цель гидратации.
 *
 * Запускается из `npm run build` после `vite build`.
 */
import { build } from 'vite';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const TEMPLATE = 'dist/index.html';
const SSR_DIR = 'node_modules/.tmp/ssr';

await build({
  logLevel: 'warn',
  build: {
    ssr: 'src/entry-server.tsx',
    outDir: SSR_DIR,
    emptyOutDir: true,
    // the CSS is already in dist from the client build
    cssCodeSplit: false,
  },
});

const { render, allPages, pathOf, buildHead } = await import(
  pathToFileURL(resolve(SSR_DIR, 'entry-server.js')).href
);

const template = readFileSync(TEMPLATE, 'utf8');

if (!template.includes('<div id="root"></div>')) {
  throw new Error(`${TEMPLATE} no longer has an empty root div to fill`);
}
if (!/<!--seo:start-->[\s\S]*?<!--seo:end-->/.test(template)) {
  throw new Error(`${TEMPLATE} no longer has the <!--seo--> block to replace`);
}

/**
 * React выдаёт `<link rel="preload">` на каждую картинку, которую рисует. Для
 * первого экрана это ровно то, что нужно; для тринадцати обложек YouTube ниже
 * сгиба — тринадцать запросов к чужому домену наперегонки со шрифтами, которых
 * ждёт первый экран. Их убираем.
 */
function cleanMarkup(markup) {
  return markup.replace(/<link rel="preload" as="image" href="https:\/\/img\.youtube\.com[^>]*>/g, '');
}

/**
 * Делает пути к файлам сайта относительными к странице, которая на них
 * ссылается: `assets/x.js` с главной и `../assets/x.js` со страницы формата.
 *
 * Трогает только то, что написала сборка (ассеты, иконки): ссылки из самих
 * компонентов уже посчитаны от своей страницы и начинаются с `../`.
 */
function rebase(html, prefix) {
  if (!prefix) return html.replace(/(["'])\/assets\//g, `$1assets/`);
  return html
    .replace(/(["'])\.?\/?assets\//g, `$1${prefix}assets/`)
    .replace(/(["'])(favicon\.svg|apple-touch-icon\.png)(["'])/g, `$1${prefix}$2$3`);
}

let total = 0;
const written = [];

for (const here of allPages()) {
  const path = pathOf(here.route, here.lang);
  const depth = path.split('/').filter(Boolean).length;
  const markup = cleanMarkup(render(here));

  // самый короткий документ — согласие на обработку данных, около 4 КБ
  if (markup.length < 2_500) {
    throw new Error(`разметка /${path} подозрительно короткая (${markup.length} байт)`);
  }

  const html = rebase(
    template
      .replace(
        /<!--seo:start-->[\s\S]*?<!--seo:end-->/,
        `<!--seo:start-->\n${buildHead(here)}\n    <!--seo:end-->`,
      )
      .replace(
        '<html lang="ru" data-lang="ru">',
        `<html lang="${here.lang}" data-lang="${here.lang}">`,
      )
      .replace('<div id="root"></div>', `<div id="root">${markup}</div>`),
    '../'.repeat(depth),
  );

  const file = `dist/${path}index.html`;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  total += markup.length;
  written.push(`/${path}`);
}

rmSync(SSR_DIR, { recursive: true, force: true });

console.log(`страниц собрано: ${written.length} (${(total / 1024).toFixed(0)} КБ разметки)`);
console.log(written.join('  '));
