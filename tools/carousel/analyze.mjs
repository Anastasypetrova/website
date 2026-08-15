/**
 * Find where text can sit on a photo without covering anything.
 *
 * The rule the reference carousels follow: copy goes on empty sky, never on
 * the subject. That is a measurable property — sky is flat, a person is full
 * of detail — so we score every candidate text box by how much visual detail
 * it contains and pick the calmest one.
 *
 * No model, no network: a Sobel energy map plus integral images, which is
 * enough to tell sky from a body and runs in a few milliseconds per photo.
 */
import sharp from 'sharp';

/** Working resolution for the analysis. Detail survives; the cost does not. */
const SAMPLE_W = 200;

/**
 * Build the luminance and detail maps for a photo.
 * Both are returned as integral images so any box query is four lookups.
 */
async function maps(file) {
  const img = sharp(file).greyscale().resize({ width: SAMPLE_W });
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  // Sobel magnitude — high where edges are, near zero on flat sky.
  const detail = new Float32Array(w * h);
  const at = (x, y) => data[y * w + x];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const gx =
        -at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1) +
        at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1);
      const gy =
        -at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1) +
        at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1);
      detail[y * w + x] = Math.min(1, Math.hypot(gx, gy) / 500);
    }
  }

  return { w, h, detailSum: integral(detail, w, h), lumSum: integral(data, w, h, 255) };
}

/** Summed-area table, padded by one row/column so box sums need no bounds checks. */
function integral(src, w, h, scale = 1) {
  const S = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let row = 0;
    for (let x = 0; x < w; x++) {
      row += src[y * w + x] / scale;
      S[(y + 1) * (w + 1) + (x + 1)] = S[y * (w + 1) + (x + 1)] + row;
    }
  }
  return S;
}

/** Mean value of an integral image over a pixel box. */
function boxMean(S, w, x0, y0, x1, y1) {
  const W = w + 1;
  const area = Math.max(1, (x1 - x0) * (y1 - y0));
  return (S[y1 * W + x1] - S[y0 * W + x1] - S[y1 * W + x0] + S[y0 * W + x0]) / area;
}

/**
 * Pick the best text box for a photo.
 *
 * `box` is normalised {x, y, w, h} in 0..1 of the rendered canvas, so it is
 * independent of the photo's own aspect — the renderer crops the photo to the
 * canvas first and analysis runs on that same crop.
 *
 * Returns the winning box plus the mean luminance under it, which decides
 * whether the copy is set in white or in ink.
 */
export async function findTextBox(file, opts = {}) {
  const {
    boxW = 0.46,      // column width, as in the reference: a narrow measure
    boxH = 0.16,      // room for three or four lines
    margin = 0.085,   // keep clear of the canvas edge
    topBias = 0.24,   // the reference always sits in the upper third
    step = 0.02,
  } = opts;

  const { w, h, detailSum, lumSum } = await maps(file);
  const px = (v, span) => Math.max(0, Math.min(span, Math.round(v * span)));

  let best = null;
  for (let y = margin; y + boxH <= 1 - margin; y += step) {
    for (let x = margin; x + boxW <= 1 - margin; x += step) {
      const x0 = px(x, w), x1 = px(x + boxW, w);
      const y0 = px(y, h), y1 = px(y + boxH, h);

      // Pad the sampled region a little: text needs quiet around it, not just
      // under it, or it ends up tucked against the subject's outline.
      const pad = Math.round(0.02 * w);
      const detail = boxMean(detailSum, w, Math.max(0, x0 - pad), Math.max(0, y0 - pad),
        Math.min(w, x1 + pad), Math.min(h, y1 + pad));
      const lum = boxMean(lumSum, w, x0, y0, x1, y1);

      let score = detail * 3.2;
      score += Math.abs(y + boxH / 2 - topBias) * 0.5;   // hold the upper third
      score += Math.max(0, lum - 0.62) * 0.9;            // white type needs a darker ground
      score += x > 0.5 ? 0.04 : 0;                       // mild preference for the left

      if (!best || score < best.score) best = { x, y, w: boxW, h: boxH, score, detail, lum };
    }
  }

  return {
    ...best,
    /** Light ground gets ink type, dark ground gets white — same rule as the site. */
    tone: best.lum > 0.62 ? 'dark' : 'light',
  };
}

/** Round a box for readable JSON without losing placement accuracy. */
export function roundBox(b) {
  const r = (v) => Math.round(v * 1000) / 1000;
  return { x: r(b.x), y: r(b.y), w: r(b.w), h: r(b.h) };
}
