/**
 * The bot answers from the site's own FAQ — the same src/content.ts the page
 * renders, so an answer can never quietly fall out of date on one side only.
 */
import { faqItems } from '../../src/content';

export interface Answer {
  question: string;
  answer: string;
}

export const answers: Answer[] = faqItems.map((item) => ({
  question: String(item.q.ru),
  answer: String(item.a.ru),
}));

const STOP_WORDS = new Set([
  'как', 'что', 'где', 'когда', 'какой', 'какая', 'какие', 'мне', 'вам', 'это',
  'для', 'или', 'если', 'уже', 'ещё', 'еще', 'меня', 'вас', 'сколько', 'можно',
  'быть', 'есть', 'the', 'and', 'for', 'you', 'how', 'what', 'can', 'are',
]);

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
    // crude Russian stemming: endings carry most of the mismatch between
    // "оплатить" and "оплата", and a prefix match is enough to score on
    .map((w) => w.slice(0, 5));
}

/**
 * Picks the FAQ entry sharing the most distinctive words with the question, or
 * null when nothing matches well enough to be worth sending. Deliberately shy:
 * a wrong canned answer reads worse than an honest "she'll reply herself".
 */
export function findAnswer(question: string): Answer | null {
  const asked = new Set(tokenise(question));
  if (asked.size === 0) return null;

  let best: Answer | null = null;
  let bestScore = 0;

  for (const entry of answers) {
    const words = new Set(tokenise(`${entry.question} ${entry.answer}`));
    let score = 0;
    for (const word of asked) if (words.has(word)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  // two distinctive words in common, and a real share of what was asked
  return bestScore >= 2 && bestScore / asked.size >= 0.34 ? best : null;
}
