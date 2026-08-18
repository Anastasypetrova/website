// Цепочка цветокора. Собирается одним filter_complex, потому что каждый
// отдельный проход ffmpeg — это лишнее поколение сжатия.
import { join } from "node:path";
import { existsSync } from "node:fs";
import { preset, ROOT, FFMPEG, run } from "./env.mjs";

/**
 * Виньетка своей маской, а не фильтром vignette.
 *
 * Штатный vignette гасит кадр целиком: на пробе он утащил центр со 128 до 45,
 * и картинка ушла в темноту, хотя отношение край/центр было верным. Здесь маска
 * строится явно — в центре ровно 1.0, то есть центр не трогается вообще, а к
 * краю яркость падает до заданной доли. Падение квадратичное: линейное читается
 * как грязное пятно, квадратичное — как объектив.
 */
function vignetteMask(w, h) {
  const edge = preset.color.vignette_edge_ratio; // 0.65
  const k = (1 - edge).toFixed(4);
  const r = `hypot((X-${w}/2)/(${w}/2),(Y-${h}/2)/(${h}/2))`;
  return `geq=lum='255*(1-${k}*pow(${r},2))':cb=128:cr=128`;
}

/**
 * Порядок неслучаен: сначала экспозиция и цвет, потом виньетка (она
 * творческая, а не корректирующая), и только в конце резкость — иначе шарп
 * подчеркнёт то, что потом всё равно затемнится.
 */
export function buildFilterComplex({ width, height, srcW, srcH }) {
  const c = preset.color;
  const pre = [];

  // Масштаб только вниз и только если надо. Вверх не тянем никогда.
  if (srcW > width || srcH > height) {
    pre.push(`scale=${width}:${height}:force_original_aspect_ratio=increase:flags=lanczos`);
    pre.push(`crop=${width}:${height}`);
  }
  pre.push(`eq=brightness=${c.brightness}:contrast=${c.contrast}:saturation=${c.saturation}`);
  pre.push("format=gbrp");

  const u = c.unsharp;
  return (
    `[1:v]format=gbrp[mask];` +
    `[0:v]${pre.join(",")}[g];` +
    `[g][mask]blend=all_mode=multiply,` +
    `unsharp=${u.luma_msize}:${u.luma_msize}:${u.luma_amount}:5:5:0.0,` +
    `format=yuv422p10le[out]`
  );
}

/**
 * Маска строится ОДИН раз в файл и дальше подставляется картинкой.
 *
 * geq считает выражение для каждого пикселя каждого кадра — на 76 секундах это
 * не закончилось и за десять минут. Маска статична, поэтому её место в кэше.
 */
export function ensureMask(width, height) {
  const path = join(ROOT, "work", `vignette_${width}x${height}.png`);
  if (!existsSync(path)) {
    run(FFMPEG, [
      "-v", "error", "-y",
      "-f", "lavfi", "-i", `color=white:s=${width}x${height}`,
      "-vf", `${vignetteMask(width, height)},format=gray`,
      "-frames:v", "1", path,
    ]);
  }
  return path;
}

export function maskSource(path) {
  return ["-loop", "1", "-i", path];
}

export function intermediateArgs() {
  const i = preset.pipeline.intermediate;
  return ["-c:v", i.codec, "-profile:v", String(i.profile), "-pix_fmt", i.pix_fmt];
}
