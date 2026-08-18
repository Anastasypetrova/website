#!/usr/bin/env node
// Финальный рендер: субтитры поверх покрашенной картинки → готовый MP4.
import { existsSync, mkdirSync, copyFileSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { ROOT, preset, run } from "../lib/env.mjs";

const work = join(ROOT, "work");
const pub = join(ROOT, "public");
const out = join(ROOT, "output");

for (const d of [pub, out, join(pub, "fonts")]) mkdirSync(d, { recursive: true });

// Remotion читает только из public/ — кладём туда покрашенное видео и шрифты.
const graded = join(work, "graded.mov");
if (!existsSync(graded)) {
  console.error("Нет work/graded.mov. Сначала: npm run grade");
  process.exit(1);
}
if (!existsSync(join(work, "plan.json"))) {
  console.error("Нет work/plan.json. Сначала: npm run plan");
  process.exit(1);
}
copyFileSync(graded, join(pub, "graded.mov"));

// Шрифт живёт в репозитории сайта — копируем нужные подмножества.
const fontSrc = join(dirname(ROOT), "src", "fonts");
let copied = 0;
if (existsSync(fontSrc)) {
  for (const f of readdirSync(fontSrc).filter((f) => f.startsWith("inter-300-"))) {
    copyFileSync(join(fontSrc, f), join(pub, "fonts", f));
    copied++;
  }
}
if (!copied) console.warn("⚠ Шрифты Inter не найдены — субтитры уйдут в системный гротеск.");

// План уходит в рендер пропсами: композиция ничего не импортирует из work/,
// поэтому сборка не разваливается, пока ролик ещё не прогоняли.
const plan = JSON.parse(readFileSync(join(work, "plan.json"), "utf8"));
const propsPath = join(work, "props.json");
writeFileSync(propsPath, JSON.stringify({
  video: "graded.mov",
  cards: plan.cards,
  captionStyle: {
    size_pct_of_height: preset.captions.size_pct_of_height,
    weight: preset.captions.weight,
    letter_spacing_em: preset.captions.letter_spacing_em,
    color: preset.captions.color,
    align: preset.captions.align,
    x_pct: preset.captions.x_pct,
    y_pct: preset.captions.y_pct,
  },
}));

const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const dst = join(out, `reel-${stamp}.mp4`);
const o = preset.output;

console.log("рендерю…");
run("npx", [
  "remotion", "render",
  join(ROOT, "remotion", "index.ts"), "Reel", dst,
  "--codec", "h264",
  "--crf", String(o.crf),
  "--x264-preset", o.preset,
  "--pixel-format", o.pix_fmt,
  "--props", propsPath,
  "--public-dir", pub,
  "--log", "error",
], { cwd: ROOT, stdio: ["ignore", "inherit", "inherit"] });

console.log(`\nготово → ${dst}`);
