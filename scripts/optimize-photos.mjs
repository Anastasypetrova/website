/**
 * Recompress the photos in src/photos/ to WebP at a sensible resolution.
 *
 * Photos arrive straight from a camera or an image generator, often several
 * megabytes and far larger than they are ever displayed. This caps each one to
 * roughly twice its on-screen width — enough for retina screens, wasted beyond
 * that — and encodes it as WebP, which is dramatically smaller than PNG for
 * photographic content at visually indistinguishable quality.
 *
 * Run with: npm run photos
 *
 * Already-optimised .webp files are skipped, so re-running is safe and never
 * re-encodes (which would compound generation loss). Originals stay in git
 * history if you ever need to go back.
 */
import { readdirSync, statSync, unlinkSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const DIR = 'src/photos';
const QUALITY = 88;

/** Widths are ~2x the largest size each slot is displayed at. */
const FULL_BLEED = 2400; // hero, pull-quote, telegram band, contacts — span the viewport
const CARD = 1400; // format cards and the About portrait — a column at most

const SLOT_WIDTH = {
  '08574d3fd1fc4601b58f29c6faaba71a': FULL_BLEED, // hero
  '9eb2e130279c44d5899c63c4ab6d6be42': FULL_BLEED, // pull quote
  photo202607271534172: FULL_BLEED, // telegram band
  hero: FULL_BLEED,
  quote: FULL_BLEED,
  telegram: FULL_BLEED,
  contacts: FULL_BLEED,
};

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const RASTER = /\.(jpe?g|png|tiff?|avif)$/i;
let before = 0;
let after = 0;
let count = 0;

for (const file of readdirSync(DIR)) {
  if (!RASTER.test(file)) continue;

  const src = join(DIR, file);
  const stem = basename(file, extname(file));
  const cap = SLOT_WIDTH[norm(stem)] ?? SLOT_WIDTH[stem.toLowerCase()] ?? CARD;

  const image = sharp(src);
  const { width, height } = await image.metadata();
  const target = Math.min(width, cap);

  const out = join(DIR, `${stem}.webp`);
  const info = await image
    .resize({ width: target, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(out);

  const wasBytes = statSync(src).size;
  before += wasBytes;
  after += info.size;
  count += 1;
  unlinkSync(src);

  const pct = Math.round((1 - info.size / wasBytes) * 100);
  console.log(
    `${stem}\n    ${width}x${height} ${(wasBytes / 1048576).toFixed(1)} MB` +
      `  ->  ${info.width}x${info.height} ${(info.size / 1048576).toFixed(2)} MB  (-${pct}%)`,
  );
}

if (!count) {
  console.log('Nothing to do — every photo is already optimised.');
} else {
  console.log(
    `\n${count} photo(s): ${(before / 1048576).toFixed(1)} MB -> ` +
      `${(after / 1048576).toFixed(2)} MB (-${Math.round((1 - after / before) * 100)}%)`,
  );
}
