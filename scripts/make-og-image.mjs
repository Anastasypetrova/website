/**
 * Builds public/og-image.jpg — the picture messengers and social networks show
 * when someone shares a link to the site.
 *
 *   node scripts/make-og-image.mjs
 *
 * The hero photo is a 1080x1350 portrait; a link preview is a 1.91:1 landscape,
 * so most of the frame has to go. The band below keeps the face a little above
 * centre, which is where it reads best in a small card. Re-run after replacing
 * src/photos/hero.webp.
 *
 * JPEG on purpose: Telegram handles WebP, but several other previewers still
 * do not, and a preview that silently fails is worse than a slightly bigger file.
 */
import sharp from 'sharp';

const SOURCE = 'src/photos/hero.webp';
const OUT = 'public/og-image.jpg';

// 1.91:1 is what Open Graph asks for; 1200x630 is the size every previewer accepts
const WIDTH = 1200;
const HEIGHT = 630;
const CROP_TOP = 70;

const { width, height } = await sharp(SOURCE).metadata();
const bandHeight = Math.round(width / (WIDTH / HEIGHT));

if (CROP_TOP + bandHeight > height) {
  throw new Error(`crop runs past the bottom of ${SOURCE} (${width}x${height})`);
}

await sharp(SOURCE)
  .extract({ left: 0, top: CROP_TOP, width, height: bandHeight })
  .resize(WIDTH, HEIGHT, { fit: 'fill' })
  .jpeg({ quality: 86, progressive: true, mozjpeg: true })
  .toFile(OUT);

const out = await sharp(OUT).metadata();
console.log(`${OUT}: ${out.width}x${out.height}, ${(out.size / 1024).toFixed(0)} KB`);
