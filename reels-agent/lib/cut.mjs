// Что выбросить из дорожки. Опора — разрывы между словами, а не тишина:
// под голосом может играть музыка, и абсолютной тишины в дорожке не будет.
import { preset } from "./env.mjs";

const norm = (s) => s.toLowerCase().replace(/[^а-яёa-z]/gi, "");

/** Слово-паразит считается мусором, только если стоит особняком. */
function isIsolatedFiller(words, i, gapMs) {
  const c = preset.cut;
  if (!c.fillers_ru.includes(norm(words[i].text))) return false;
  const before = i === 0 ? Infinity : words[i].start - words[i - 1].end;
  const after = i === words.length - 1 ? Infinity : words[i + 1].start - words[i].end;
  // «ну» посреди быстрой фразы обычно несёт интонацию, а не мусор —
  // режем только когда вокруг него уже есть воздух.
  return before * 1000 > gapMs || after * 1000 > gapMs;
}

/**
 * Строит план правок.
 *
 * Возвращает removals двух сортов: mechanical применяется молча, review
 * уходит человеку на визирование. Разделение принципиальное — механические
 * правки локальны и смысл не трогают, смысловые требуют глаз.
 */
export function buildCutPlan(words, { duration }) {
  const c = preset.cut;
  const removals = [];

  // 1. Длинные паузы — подрезаем, но не схлопываем: дыхание держит ритм.
  for (let i = 1; i < words.length; i++) {
    const gap = (words[i].start - words[i - 1].end) * 1000;
    if (gap > c.pause_trim_over_ms) {
      const keep = c.pause_keep_ms / 1000;
      removals.push({
        kind: "mechanical", reason: "пауза",
        start: words[i - 1].end + keep / 2,
        end: words[i].start - keep / 2,
        text: `${Math.round(gap)}мс → ${c.pause_keep_ms}мс`,
      });
    }
  }

  // 2. Одиночные слова-паразиты.
  if (c.remove_fillers_isolated_only) {
    for (let i = 0; i < words.length; i++) {
      if (isIsolatedFiller(words, i, 200)) {
        removals.push({
          kind: "mechanical", reason: "паразит",
          start: words[i].start, end: words[i].end, text: words[i].text,
        });
      }
    }
  }

  // 3. Подряд идущие повторы одного слова — оставляем последний.
  if (c.collapse_adjacent_repeats) {
    for (let i = 1; i < words.length; i++) {
      if (norm(words[i].text) && norm(words[i].text) === norm(words[i - 1].text)) {
        removals.push({
          kind: "mechanical", reason: "повтор",
          start: words[i - 1].start, end: words[i - 1].end, text: words[i - 1].text,
        });
      }
    }
  }

  // 4. Дубли фраз — на глаз человеку. Ловим по совпадению начал соседних
  //    предложений: дословный пересъём обычно начинается теми же словами.
  //    Переформулированный второй заход так не поймается — об этом честно
  //    сказано в README, и поэтому метка идёт в review, а не в mechanical.
  for (const d of findRetakes(words)) removals.push(d);

  return { removals, keep: invert(removals.filter(r => r.kind === "mechanical"), duration) };
}

function findRetakes(words, span = 5) {
  const out = [];
  for (let i = 0; i + span * 2 < words.length; i++) {
    const a = words.slice(i, i + span).map((w) => norm(w.text)).join(" ");
    for (let j = i + span; j < Math.min(i + span * 4, words.length - span); j++) {
      const b = words.slice(j, j + span).map((w) => norm(w.text)).join(" ");
      if (a && a === b) {
        out.push({
          kind: "review", reason: "похоже на дубль",
          start: words[i].start, end: words[j].start,
          text: words.slice(i, j).map((w) => w.text).join(" "),
        });
        i = j;
        break;
      }
    }
  }
  return out;
}

/** Из списка выбрасываемых кусков — список остающихся. */
function invert(removals, duration) {
  const sorted = [...removals].sort((a, b) => a.start - b.start);
  const keep = [];
  let cur = 0;
  for (const r of sorted) {
    if (r.start > cur) keep.push({ start: cur, end: r.start });
    cur = Math.max(cur, r.end);
  }
  if (cur < duration) keep.push({ start: cur, end: duration });
  return keep.filter((s) => s.end - s.start > 0.08);
}
