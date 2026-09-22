/**
 * Packs the whole site into one self-contained HTML file, so a change can be
 * looked at — clicked through, on a phone — before it is published.
 *
 * The live site is deployed by pushing, and a push is public: there is no step
 * between "done" and "everyone can see it". This file is that step. Every font,
 * photo, stylesheet and script is embedded as a data: URI, so the result needs
 * no server and no assets folder — it can be published as a private page and
 * opened from a link.
 *
 * Two things cannot survive the packing, and the page says so in a banner:
 * video covers (they live on YouTube's servers, which an embedded page may not
 * reach) and the question form (it posts to the Cloudflare worker, likewise
 * out of reach). Everything else — layout, text, fonts, photos, language
 * toggle, accordion, consent checkboxes, document pages — behaves as on the
 * real site.
 *
 * Run: npm run preview:artifact  →  dist-preview/preview.html
 */
import { build } from 'vite';
import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const OUT_DIR = 'node_modules/.tmp/preview';
const OUT_FILE = process.argv[2] ?? 'dist-preview/preview.html';

const MIME = {
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

/** A stand-in for the YouTube covers, which an embedded page cannot fetch. */
const VIDEO_PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360">' +
      '<rect width="480" height="360" fill="#3F443B"/>' +
      '<circle cx="240" cy="180" r="44" fill="#fff" fill-opacity=".16"/>' +
      '<path d="M227 157l43 23-43 23z" fill="#fff" fill-opacity=".85"/>' +
      '<text x="240" y="272" text-anchor="middle" fill="#fff" fill-opacity=".5"' +
      ' font-family="sans-serif" font-size="17">обложка видео</text></svg>',
  );

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function dataUri(path) {
  const type = MIME[extname(path).toLowerCase()];
  if (!type) return null;
  return `data:${type};base64,${readFileSync(path).toString('base64')}`;
}

// A build of its own, without the prerender step: the baked-in markup exists
// for crawlers, and keeping it here would embed every photo a second time.
await build({ logLevel: 'warn', build: { outDir: OUT_DIR, emptyOutDir: true } });

const files = walk(OUT_DIR);
const html = readFileSync(join(OUT_DIR, 'index.html'), 'utf8');

const cssPath = files.find((f) => f.endsWith('.css'));
const jsPath = files.find((f) => f.endsWith('.js'));
if (!cssPath || !jsPath) throw new Error('в сборке нет css или js — менялась конфигурация?');

// The stylesheet's font references are relative to the stylesheet itself
// (url(./name.woff2)); everything else is referenced as assets/name.
let css = readFileSync(cssPath, 'utf8');
for (const file of files.filter((f) => f.endsWith('.woff2') || f.endsWith('.woff'))) {
  const name = file.split('/').pop();
  if (!css.includes(name)) continue;
  css = css.split(`./${name}`).join(dataUri(file));
}

let js = readFileSync(jsPath, 'utf8').replace(
  /https:\/\/img\.youtube\.com\/vi\/[\w-]+\/[\w]+\.jpg/g,
  VIDEO_PLACEHOLDER,
);

let page = html
  // The artifact host supplies the document shell, charset and viewport.
  .replace(/^[\s\S]*?<head>/, '')
  .replace(/<\/head>\s*<body>/, '')
  .replace(/<\/body>\s*<\/html>\s*$/, '')
  // Preloads, icons and the link-preview block are all about the published
  // URL, and point at files this single page does not carry.
  .replace(/^.*<link rel="preload"[^>]*>.*$/gm, '')
  .replace(/^.*<link rel="(icon|apple-touch-icon|canonical)"[^>]*>.*$/gm, '')
  .replace(/^.*<meta (property="og:|name="twitter:)[^>]*>.*$/gm, '')
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
  .replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/g, '')
  // Named for what it is, so it is never mistaken for the published site.
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Превью сайта</title>')
  // Replacer functions, not strings: the bundle contains `$&` sequences of its
  // own (React's own String.replace calls), which a string replacement would
  // expand into the matched script tag, quietly corrupting the code.
  .replace(/<link rel="stylesheet"[^>]*>/, () => `<style>${css}</style>`)
  .replace(
    /<script type="module"[^>]*><\/script>/,
    () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`,
  );

// Photos. Vite resolves them as `new URL("name.webp", import.meta.url)`, so the
// script names them by file name alone; the hash in the name makes it unique.
let embedded = 0;
for (const file of files) {
  const name = file.split('/').pop();
  const rel = relative(OUT_DIR, file);
  const uri = dataUri(file);
  if (!uri || !page.includes(name)) continue;
  const before = page.length;
  page = page.split(`./${rel}`).join(uri).split(rel).join(uri).split(name).join(uri);
  if (page.length !== before) embedded += 1;
}

// Says what this page is, then gets out of the way: after a few seconds it
// shrinks to a pill, and a click removes it. It sits over the footer's social
// icons otherwise.
const banner = `
<style>
  #preview-note{position:fixed;right:12px;bottom:12px;z-index:9999;max-width:21em;
    padding:10px 12px;border-radius:10px;background:rgba(31,35,29,.92);color:#fff;
    font:400 12px/1.45 -apple-system,'Segoe UI',Helvetica,Arial,sans-serif;
    box-shadow:0 6px 24px rgba(0,0,0,.28);cursor:pointer;transition:opacity .4s}
  #preview-note b{display:block;font-weight:600;margin-bottom:2px}
  #preview-note i{font-style:normal;opacity:.65}
  #preview-note.small{max-width:none;padding:6px 10px;opacity:.55}
  #preview-note.small b{display:inline;margin:0}
  #preview-note.small u,#preview-note.small i{display:none}
</style>
<div id="preview-note" title="нажмите, чтобы скрыть">
  <b>Превью, а не сайт</b>
  <u style="text-decoration:none">Черновик для просмотра. Обложки видео и форма вопросов
  здесь не работают — на самом сайте работают.</u>
  <i>Нажмите, чтобы скрыть.</i>
</div>
<script>
  var n = document.getElementById('preview-note');
  n.onclick = function () { this.remove(); };
  setTimeout(function () { n.classList.add('small'); }, 8000);
</script>
`;

mkdirSync(OUT_FILE.split('/').slice(0, -1).join('/') || '.', { recursive: true });
writeFileSync(OUT_FILE, page + banner);
rmSync(OUT_DIR, { recursive: true, force: true });

const mb = (Buffer.byteLength(page + banner) / 1024 / 1024).toFixed(1);
console.log(`${OUT_FILE}: ${mb} MB, встроено файлов: ${embedded}`);
if (Number(mb) > 15) throw new Error('страница больше 15 МБ — публикация не пройдёт');
