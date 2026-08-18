// Разбивка пословного потока на карточки субтитров.
import { preset } from "./env.mjs";

/**
 * Карточка меняется не по счётчику слов, а по дыханию фразы: на знаке
 * препинания, на разрыве в речи и на пределе длительности. Счётчик слов —
 * только верхняя граница, иначе на быстрой речи карточки начинают мелькать,
 * а на медленной висят мёртвым грузом.
 */
export function groupIntoCards(words, {
  maxWords = preset.captions.words_per_card[1],
  minWords = preset.captions.words_per_card[0],
  breakGapMs = 350,
  maxDurationS = 2.5,
} = {}) {
  const cards = [];
  let cur = [];

  const flush = () => {
    if (!cur.length) return;
    cards.push({
      start: cur[0].start,
      end: cur[cur.length - 1].end,
      text: cur.map((w) => w.text.trim()).join(" ").replace(/\s+/g, " ").trim(),
      words: cur.map((w) => ({ text: w.text.trim(), start: w.start, end: w.end })),
    });
    cur = [];
  };

  for (let i = 0; i < words.length; i++) {
    cur.push(words[i]);
    const next = words[i + 1];
    const dur = cur[cur.length - 1].end - cur[0].start;
    const gap = next ? (next.start - words[i].end) * 1000 : Infinity;
    const punct = /[.!?…,;:]$/.test(words[i].text.trim());

    if (
      cur.length >= maxWords ||
      dur >= maxDurationS ||
      (cur.length >= minWords && (punct || gap > breakGapMs))
    ) flush();
  }
  flush();

  return cards.map((c) => ({
    ...c,
    text: preset.captions.case === "lowercase" ? c.text.toLowerCase() : c.text,
  }));
}

/** Пересчёт таймкодов из исходной шкалы в шкалу смонтированного ролика. */
export function remapToTimeline(items, keep) {
  const out = [];
  for (const it of items) {
    let acc = 0;
    for (const k of keep) {
      if (it.start >= k.start && it.start < k.end) {
        const shift = acc + (it.start - k.start);
        out.push({ ...it, start: shift, end: shift + (it.end - it.start) });
        break;
      }
      acc += k.end - k.start;
    }
  }
  return out;
}

/**
 * Слова, пережившие нарезку.
 *
 * Порядок здесь принципиален: карточки субтитров строятся ПОСЛЕ реза, из
 * оставшихся слов. Если строить до, в титры попадут «ээ» и задвоенные слова,
 * которые из картинки уже вырезаны — текст разойдётся со звуком.
 */
export function filterWordsByKeep(words, keep) {
  return words.filter((w) =>
    keep.some((k) => w.start >= k.start - 1e-6 && w.end <= k.end + 1e-6)
  );
}
