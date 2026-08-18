// Звук: дорожка под whisper и карта тишины — там, где тишина вообще есть.
import { join } from "node:path";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { ffmpeg, run, ROOT } from "./env.mjs";

/**
 * whisper.cpp принимает только 16 кГц моно PCM. Конвертируем сами, иначе он
 * молча спотыкается на 44.1 кГц стерео из телефона.
 */
export function extractWav(input, out = join(ROOT, "work", "audio.wav")) {
  if (!existsSync(out)) {
    run(ffmpeg(), ["-v", "error", "-y", "-i", input,
      "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", out]);
  }
  return out;
}

/**
 * ffmpeg пишет статистику в stderr, а execFileSync при успешном коде возврата
 * отдаёт только stdout — из-за этого замеры молча превращались в заглушку.
 * spawnSync отдаёт оба потока независимо от кода возврата.
 */
function ffmpegStderr(args) {
  const r = spawnSync(ffmpeg(), args, { encoding: "utf8", maxBuffer: 64 << 20 });
  return (r.stderr || "") + (r.stdout || "");
}

/** Средний и пиковый уровень — от них считается адаптивный порог. */
export function levels(input) {
  const out = ffmpegStderr(["-hide_banner", "-i", input, "-af", "volumedetect", "-f", "null", "-"]);
  const mean = parseFloat((out.match(/mean_volume:\s*(-?[\d.]+)/) || [])[1] ?? "-20");
  const max = parseFloat((out.match(/max_volume:\s*(-?[\d.]+)/) || [])[1] ?? "0");
  return { mean, max };
}

/**
 * Карта тишины. Порог считается от среднего уровня дорожки, а не берётся
 * фиксированным: -32 dB осмысленны для чистой записи и бессмысленны для
 * дорожки с музыкой под голосом.
 *
 * ВАЖНО: если под голосом играет музыка, настоящей тишины в дорожке нет
 * вообще — проверено на референсе, где при любом пороге вплоть до -50 dB
 * не нашлось ни одной паузы. Поэтому silencedetect здесь вспомогательный,
 * а основной сигнал для нарезки — разрывы между словами из whisper: они
 * не зависят от того, что играет на фоне. Функция возвращает usable=false,
 * чтобы вызывающий понимал, что опираться надо на слова.
 */
export function detectSilence(input, { minMs = 250, offsetDb = 22 } = {}) {
  const { mean } = levels(input);
  const threshold = Math.round(mean - offsetDb);
  const out = ffmpegStderr(["-hide_banner", "-i", input,
    "-af", `silencedetect=noise=${threshold}dB:d=${minMs / 1000}`, "-f", "null", "-"]);

  const spans = [];
  let start = null;
  for (const line of out.split("\n")) {
    const s = line.match(/silence_start:\s*(-?[\d.]+)/);
    const e = line.match(/silence_end:\s*([\d.]+)/);
    if (s) start = parseFloat(s[1]);
    if (e && start !== null) {
      spans.push({ start: Math.max(0, start), end: parseFloat(e[1]) });
      start = null;
    }
  }
  return { spans, threshold, meanDb: mean, usable: spans.length > 0 };
}
