#!/usr/bin/env node
// Собирает план монтажа и лист для согласования.
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT, preset, resolveInput } from "../lib/env.mjs";
import { buildCutPlan } from "../lib/cut.mjs";
import { groupIntoCards, filterWordsByKeep, remapToTimeline } from "../lib/cards.mjs";

const capPath = join(ROOT, "work", "captions.json");
if (!existsSync(capPath)) {
  console.error(`Нет ${capPath}. Сначала: npm run transcribe`);
  process.exit(1);
}
const words = JSON.parse(readFileSync(capPath, "utf8")).map((c) => ({
  text: c.text, start: c.startMs / 1000, end: c.endMs / 1000,
}));
const duration = words.length ? words[words.length - 1].end : 0;

const cut = buildCutPlan(words, { duration });
const survivors = filterWordsByKeep(words, cut.keep);
const cards = remapToTimeline(groupIntoCards(survivors), cut.keep);

const kept = cut.keep.reduce((a, k) => a + (k.end - k.start), 0);
const plan = {
  source: resolveInput(process.argv[2]),
  duration_original_s: +duration.toFixed(2),
  duration_edited_s: +kept.toFixed(2),
  keep: cut.keep,
  removals: cut.removals,
  cards,
  stickers: [],
};
writeFileSync(join(ROOT, "work", "plan.json"), JSON.stringify(plan, null, 2));

// ── лист для человека ──
const ts = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${(s % 60).toFixed(1).padStart(4, "0")}`;
const auto = cut.removals.filter((r) => r.kind === "mechanical");
const ask = cut.removals.filter((r) => r.kind === "review");

let md = `# Лист согласования\n\n`;
md += `Было **${duration.toFixed(1)} с** → станет **${kept.toFixed(1)} с** `;
md += `(вырезано ${(duration - kept).toFixed(1)} с)\n\n`;
md += `## Вырезано автоматически — ${auto.length} правок\n\n`;
md += `Паузы, одиночные слова-паразиты и подряд идущие повторы. Смысл не тронут.\n\n`;
const byReason = {};
for (const r of auto) byReason[r.reason] = (byReason[r.reason] || 0) + 1;
for (const [k, v] of Object.entries(byReason)) md += `- ${k}: ${v}\n`;

if (ask.length) {
  md += `\n## Нужно твоё решение — ${ask.length}\n\n`;
  ask.forEach((r, i) => {
    md += `**[${i + 1}]** ${ts(r.start)}–${ts(r.end)} · ${r.reason}\n`;
    md += `> ${r.text.slice(0, 200)}\n\n`;
  });
}

md += `\n## Сценарий — что предлагаю проиллюстрировать\n\n`;
cards.forEach((c, i) => {
  md += `\`[${String(i + 1).padStart(2, "0")}]\` \`${ts(c.start)}\`  ${c.text}\n`;
});
md += `\n---\n\nОтветь одной строкой: «да» / «все кроме 4 и 9» / «7 — глобус».\n`;

writeFileSync(join(ROOT, "work", "review.md"), md);
console.log(`план:  work/plan.json`);
console.log(`лист:  work/review.md`);
console.log(`\nбыло ${duration.toFixed(1)} с → станет ${kept.toFixed(1)} с`);
console.log(`правок автоматом: ${auto.length}, на решение: ${ask.length}`);
console.log(`карточек субтитров: ${cards.length}`);
