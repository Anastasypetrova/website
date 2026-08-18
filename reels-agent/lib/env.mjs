// Пути к бинарникам и чтение пресета. Всё остальное опирается на это.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
export const preset = JSON.parse(readFileSync(join(ROOT, "preset.json"), "utf8"));

/** Сначала системный (brew), потом пакетный — на случай, если brew нет. */
function findBin(name, envVar) {
  if (process.env[envVar] && existsSync(process.env[envVar])) return process.env[envVar];
  try {
    const p = execFileSync("which", [name], { encoding: "utf8" }).trim();
    if (p) return p;
  } catch {}
  try {
    const mod = name === "ffmpeg" ? "ffmpeg-static" : "ffprobe-static";
    const r = require(mod);
    return typeof r === "string" ? r : r.path;
  } catch {}
  throw new Error(`Не найден ${name}. На маке: brew install ffmpeg`);
}

/**
 * Разрешаются по вызову, а не при импорте: логика нарезки и разбивки на
 * карточки к ffmpeg отношения не имеет, и требовать его ради их запуска —
 * значит сделать их непроверяемыми там, где ffmpeg не стоит.
 */
let _ffmpeg, _ffprobe;
export const ffmpeg = () => (_ffmpeg ??= findBin("ffmpeg", "FFMPEG_PATH"));
export const ffprobe = () => (_ffprobe ??= findBin("ffprobe", "FFPROBE_PATH"));

export function run(bin, args, opts = {}) {
  return execFileSync(bin, args, { encoding: "utf8", maxBuffer: 64 << 20, ...opts });
}

/** Первый ролик в input/, если путь не передали явно. */
export function resolveInput(arg) {
  if (arg && existsSync(arg)) return arg;
  const dir = join(ROOT, "input");
  const files = readdirSync(dir).filter((f) => /\.(mp4|mov|m4v)$/i.test(f));
  if (!files.length) throw new Error(`Положи ролик в ${dir}`);
  return join(dir, files[0]);
}
