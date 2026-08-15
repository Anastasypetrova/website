#!/usr/bin/env node
/**
 * Render an Instagram carousel from a spec file.
 *
 *   node tools/carousel/render.mjs tools/carousel/examples/mir-za.json
 *
 * Each slide is a photo cropped to the canvas, a gradient vignette, and a short
 * line of copy placed on the emptiest part of the frame. Placement is measured
 * from the photo itself (see `analyze.mjs`) unless the spec pins a box.
 *
 * Output: numbered PNGs ready to post, a caption file, and a preview page.
 *
 * Flags:
 *   --out <dir>    output root                     (default: out/carousel)
 *   --size 4:5     canvas                          (4:5 | 1:1 | 9:16)
 *   --guides       draw the chosen text box and the 1:1 grid crop
 *   --jpg          write JPEG instead of PNG
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import http from 'node:http';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SIZES, DEFAULT_SIZE, TEXT_SIZES, baseCss, rich, esc } from './theme.mjs';
import { findTextBox, roundBox } from './analyze.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * How tall the copy will actually be, as a share of the canvas.
 *
 * The analyser needs the real footprint: reserving four lines' worth of space
 * for a two-line sentence pushes the box away from spots that would have fitted
 * it comfortably. Cyrillic in Inter averages close to half the point size per
 * glyph, which is near enough to count lines from.
 */
/**
 * Vignette strength for a measured placement.
 *
 * Scaled to what the ground actually needs: a dark frame gets almost none, a
 * bright one gets enough to hold white type. A fixed strength either muddies
 * the dark frames or loses the type on the light ones.
 */
function vignetteFor(measured) {
  return measured.tone === 'dark'
    ? clamp((0.88 - measured.lum) * 2.6, 0.5, 1.8)
    : clamp((measured.lum - 0.12) * 2.6, 0.5, 1.8);
}

function textHeight(slide, boxW, size) {
  const fs = (TEXT_SIZES[slide.size ?? 'm'] ?? TEXT_SIZES.m) * size.w;
  const perLine = Math.max(8, (boxW * size.w) / (fs * 0.5));
  const chars = [slide.text, slide.text2].filter(Boolean).join(' ').length;
  const lines = Math.max(1, Math.ceil(chars / perLine)) + (slide.text2 ? 1 : 0);
  return clamp((lines * 1.36 * fs) / size.h, 0.05, 0.62);
}

/* ---------------------------------------------------------------- photos -- */

/**
 * Resolve a spec's `photo` to a file: either a path, or one of the slot names
 * the site itself uses. The slot aliases live in `src/photos.ts` — read them
 * from there rather than keeping a second copy that can drift.
 */
async function photoIndex() {
  const dir = path.join(ROOT, 'src/photos');
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  const aliases = new Map();
  try {
    const src = await fs.readFile(path.join(ROOT, 'src/photos.ts'), 'utf8');
    const block = src.match(/HANDOFF_NAMES[^{]*\{([\s\S]*?)\n\};/)?.[1] ?? '';
    for (const m of block.matchAll(/'([^']+)'\s*:\s*'([^']+)'|(\w+)\s*:\s*'([^']+)'/g)) {
      aliases.set(norm(m[1] ?? m[3]), m[2] ?? m[4]);
    }
  } catch { /* no registry: slot names still work */ }

  const bySlot = new Map();
  for (const file of await fs.readdir(dir).catch(() => [])) {
    if (!/\.(jpe?g|png|webp|avif)$/i.test(file)) continue;
    const key = norm(file.replace(/\.[^.]+$/, ''));
    const slot = aliases.get(key) ?? key;
    // A file named after the slot wins over one named after the handoff file.
    if (!bySlot.has(slot) || key === slot) bySlot.set(slot, path.join(dir, file));
  }
  return bySlot;
}

/** Tone curves. `none` is the reference look — the photos there are ungraded. */
const GRADES = {
  none: null,
  natural: { saturation: 0.97, brightness: 1.01 },
  warm: { saturation: 1.04, brightness: 1.02, hue: 4 },
  muted: { saturation: 0.86, brightness: 1.03 },
};

/**
 * Crop a photo to the canvas and grade it. Everything downstream — the
 * analysis and the render — works on this file, so the box the analyser picks
 * is the box the viewer sees.
 */
async function prepPhoto(src, dest, { w, h }, { focus = 'centre', grade = 'none' }) {
  const position = focus === 'auto' ? sharp.strategy.attention : focus;
  let img = sharp(src).rotate().resize(w, h, { fit: 'cover', position });
  const g = GRADES[grade];
  if (g) img = img.modulate(g);
  await img.jpeg({ quality: 95, chromaSubsampling: '4:4:4' }).toFile(dest);
}

/* ------------------------------------------------------------------ html -- */

function slideHtml(s, i, cfg) {
  const box = s._box;
  const tone = s._tone;                       // 'light' = white type, 'dark' = ink
  const fs = TEXT_SIZES[s.size ?? 'm'] ?? TEXT_SIZES.m;
  const vs = s.vignette ?? s._vs ?? 1;        // vignette strength, 0 turns it off

  const vars = [
    `--bx:${box.x}`, `--by:${box.y}`, `--bw:${box.w}`, `--bh:${box.h}`,
    `--fs:${fs}`, `--pad:0.085`,
    `--vx:${((box.x + box.w / 2) * 100).toFixed(1)}%`,
    `--vy:${((box.y + box.h / 2) * 100).toFixed(1)}%`,
    `--vs:${vs}`,
  ].join(';');

  const copy = s.text
    ? `<div class="copy ${tone === 'dark' ? 'dark' : ''}">${rich(s.text)}${
        s.text2 ? `<span class="l2">${rich(s.text2)}</span>` : ''
      }</div>`
    : '';

  const handle = s.handle ?? (cfg.handle && i === cfg.slides.length - 1 ? cfg.handle : null);

  return `<div class="slide" style="${vars}">
  <div class="bg"><img src="${esc(s._url)}" alt=""></div>
  <div class="vig ${vs > 0 && s.text ? 'on' : ''} ${tone === 'dark' ? 'inverted' : ''}"></div>
  ${copy}
  ${handle ? `<div class="handle ${tone === 'dark' ? 'dark' : ''}">${esc(handle)}</div>` : ''}
  <div class="guides ${cfg._guides ? 'on' : ''}"><div class="box"></div><div class="sq"></div></div>
</div>`;
}

function pageHtml(items, cfg, size) {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<link rel="stylesheet" href="/src/fonts.css">
<style>${baseCss(size)}</style></head><body>
${items.map((it) => slideHtml(it.slide, it.index, cfg)).join('\n')}
</body></html>`;
}

/**
 * Expand the slides into what actually gets shot.
 *
 * Normally that is one frame per slide. With --candidates each slide with copy
 * is shot once per placement the analyser proposed, so the agent can look at
 * the real options side by side instead of guessing from coordinates.
 */
function renderItems(cfg, candidates) {
  const items = [];
  for (const [index, slide] of cfg.slides.entries()) {
    const opts = candidates && slide.text && !slide.box ? slide._options : null;
    if (!opts?.length) {
      items.push({ slide, index, name: String(index + 1).padStart(2, '0') });
      continue;
    }
    for (const [k, o] of opts.entries()) {
      items.push({
        index,
        name: `${String(index + 1).padStart(2, '0')}${'abcd'[k]}`,
        slide: { ...slide, _box: roundBox(o), _tone: o.tone, _vs: vignetteFor(o) },
      });
    }
  }
  return items;
}

/* ---------------------------------------------------------------- server -- */

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif',
};

/**
 * Serve the repo over HTTP for the duration of the render.
 *
 * Chromium refuses to load webfonts cross-origin from `file://` URLs, and the
 * whole point here is that the slides use the site's own woff2 files — so the
 * page is served rather than opened from disk.
 */
async function serve(pageBody) {
  const server = http.createServer(async (req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (url === '/') {
      res.writeHead(200, { 'content-type': MIME['.html'] });
      return res.end(pageBody);
    }
    const file = path.join(ROOT, path.normalize(url).replace(/^(\.\.[/\\])+/, ''));
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    try {
      await fs.access(file);
      res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream' });
      createReadStream(file).pipe(res);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { server, port: server.address().port };
}

/* ------------------------------------------------------------------ main -- */

function parseArgs(argv) {
  const args = { spec: null, out: 'out/carousel', size: null, guides: false, jpg: false, candidates: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') args.out = argv[++i];
    else if (a === '--size') args.size = argv[++i];
    else if (a === '--guides') args.guides = true;
    else if (a === '--candidates') args.candidates = true;
    else if (a === '--jpg') args.jpg = true;
    else if (!a.startsWith('--')) args.spec = a;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.spec) {
    console.error('usage: node tools/carousel/render.mjs <spec.json> [--out dir] [--size 4:5] [--guides] [--jpg]');
    process.exit(1);
  }

  const cfg = JSON.parse(await fs.readFile(path.resolve(args.spec), 'utf8'));
  const sizeKey = args.size ?? cfg.size ?? DEFAULT_SIZE;
  const size = SIZES[sizeKey];
  if (!size) throw new Error(`unknown size "${sizeKey}" — use ${Object.keys(SIZES).join(', ')}`);
  if (!Array.isArray(cfg.slides) || !cfg.slides.length) throw new Error('spec has no slides');
  if (cfg.slides.length > 10) throw new Error('Instagram allows at most 10 slides per carousel');
  cfg._guides = args.guides;

  const slug = cfg.slug ?? path.basename(args.spec, '.json');
  const outDir = path.resolve(ROOT, args.out, slug);
  const workDir = path.join(outDir, '_photos');
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(workDir, { recursive: true });

  const photos = await photoIndex();

  // Prepare every photo, then measure where its copy can go.
  for (const [i, s] of cfg.slides.entries()) {
    if (!s.photo) throw new Error(`slide ${i + 1}: "photo" is required`);
    // Slide one is the title — it carries the whole post in the feed, so it is
    // set larger than the slides that follow unless the spec says otherwise.
    if (i === 0 && !s.size) s.size = 'l';
    const src = photos.get(s.photo.toLowerCase().replace(/[^a-z0-9]/g, '')) ??
      (await fs.access(path.resolve(ROOT, s.photo)).then(() => path.resolve(ROOT, s.photo), () => null));
    if (!src) {
      throw new Error(`slide ${i + 1}: no photo "${s.photo}" — put a file in src/photos/ or give a path. ` +
        `Known slots: ${[...photos.keys()].join(', ')}`);
    }

    const dest = path.join(workDir, `${String(i + 1).padStart(2, '0')}.jpg`);
    await prepPhoto(src, dest, size, { focus: s.focus, grade: s.grade ?? cfg.grade });
    s._url = `/${path.relative(ROOT, dest).split(path.sep).join('/')}`;

    if (s.text) {
      const boxW = s.box?.w ?? cfg.boxW ?? 0.46;
      const measured = await findTextBox(dest, {
        boxW,
        boxH: s.box?.h ?? textHeight(s, boxW, size),
        tone: s.tone && s.tone !== 'auto' ? s.tone : 'auto',
      });
      s._box = s.box ? { ...roundBox(measured), ...s.box } : roundBox(measured);
      s._tone = measured.tone;
      s._detail = measured.detail;
      s._lum = measured.lum;
      s._vs = vignetteFor(measured);
      s._options = measured.options;
    } else {
      s._box = { x: 0.085, y: 0.085, w: 0.46, h: 0.16 };
      s._tone = 'light';
    }
  }

  // Render.
  const items = renderItems(cfg, args.candidates);
  const { server, port } = await serve(pageHtml(items, cfg, size));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: size.w + 80, height: size.h + 80 },
      deviceScaleFactor: 2,          // supersample, then scale down for clean edges
    });
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const ext = args.jpg ? 'jpg' : 'png';
    const files = [];
    for (const [i, el] of (await page.locator('.slide').all()).entries()) {
      const raw = await el.screenshot({ type: 'png' });
      const name = `${items[i].name}.${ext}`;
      const img = sharp(raw).resize(size.w, size.h, { kernel: 'lanczos3' });
      await (args.jpg ? img.jpeg({ quality: 92, chromaSubsampling: '4:4:4' }) : img.png({ compressionLevel: 9 }))
        .toFile(path.join(outDir, name));
      files.push(name);
    }

    if (cfg.caption) await fs.writeFile(path.join(outDir, 'caption.txt'), `${cfg.caption}\n`);
    await fs.writeFile(path.join(outDir, 'preview.html'), previewHtml(cfg, files, size));

    console.log(`\n  ${slug} — ${files.length} слайд(ов) → ${path.relative(ROOT, outDir)}`);
    for (const [i, s] of cfg.slides.entries()) {
      const b = s._box;
      const where = s.text
        ? `текст ${(b.x * 100).toFixed(0)}%,${(b.y * 100).toFixed(0)}% · ${s._tone === 'dark' ? 'тёмный' : 'белый'}` +
          ` · виньетка ${(s.vignette ?? s._vs).toFixed(2)}` +
          (s.box ? ' · вручную' : ` · авто (детализация ${s._detail.toFixed(3)}, яркость ${s._lum.toFixed(2)})`)
        : 'без текста';
      console.log(`  ${String(i + 1).padStart(2, '0')}  ${where}`);
    }
    console.log(`\n  превью: ${path.relative(ROOT, path.join(outDir, 'preview.html'))}\n`);
  } finally {
    await browser.close();
    server.close();
  }
}

function previewHtml(cfg, files, size) {
  return `<!doctype html><meta charset="utf-8"><title>${esc(cfg.slug ?? 'carousel')}</title>
<style>
 body{margin:0;background:#111;color:#ddd;font:14px/1.6 -apple-system,system-ui,sans-serif;padding:28px}
 .row{display:flex;gap:18px;overflow-x:auto;padding-bottom:18px}
 .row img{height:${Math.round((520 / size.h) * size.w)}px;width:auto;border-radius:8px;flex:none}
 pre{white-space:pre-wrap;max-width:70ch;color:#bbb;background:#1a1a1a;padding:18px;border-radius:8px}
</style>
<div class="row">${files.map((f) => `<img src="${f}">`).join('')}</div>
${cfg.caption ? `<pre>${esc(cfg.caption)}</pre>` : ''}`;
}

main().catch((e) => { console.error(`\n  ошибка: ${e.message}\n`); process.exit(1); });
