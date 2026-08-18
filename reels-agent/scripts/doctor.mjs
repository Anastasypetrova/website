#!/usr/bin/env node
// Проверка перед первым запуском: всё ли на месте.
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT, preset } from "../lib/env.mjs";

const ok = [], bad = [], warn = [];

const major = +process.versions.node.split(".")[0];
(major >= 20 ? ok : bad).push(`Node ${process.versions.node}` + (major >= 20 ? "" : " — нужен 20 или новее"));

for (const [name, envVar] of [["ffmpeg", "FFMPEG_PATH"], ["ffprobe", "FFPROBE_PATH"]]) {
  try {
    const { ffmpeg, ffprobe } = await import("../lib/env.mjs");
    const p = name === "ffmpeg" ? ffmpeg() : ffprobe();
    const sys = (() => { try { return execFileSync("which", [name], { encoding: "utf8" }).trim(); } catch { return ""; } })();
    ok.push(`${name}: ${sys ? "системный" : "пакетный"} (${p.split("/").pop()})`);
  } catch {
    bad.push(`${name} не найден — выполни npm install в папке reels-agent`);
  }
}

const inputDir = join(ROOT, "input");
const vids = existsSync(inputDir)
  ? readdirSync(inputDir).filter((f) => /\.(mp4|mov|m4v)$/i.test(f)) : [];
if (vids.length) {
  const f = join(inputDir, vids[0]);
  ok.push(`ролик: ${vids[0]} (${(statSync(f).size / 1e6).toFixed(0)} МБ)`);
  if (vids.length > 1) ok.push(`  ещё файлов в очереди: ${vids.length - 1}`);
} else {
  warn.push(`в input/ пусто — положи туда мастер после ретуши`);
}

const model = preset.transcribe.model;
const whisper = join(ROOT, "whisper.cpp");
if (existsSync(join(whisper, `ggml-${model}.bin`)))
  ok.push(`модель ${model} скачана`);
else
  warn.push(`модель ${model} ещё не скачана — приедет при первом запуске (~3 ГБ, разово)`);

// Место на диске: ProRes жрёт примерно 2.5 ГБ на минуту 1080x1920.
try {
  const out = execFileSync("df", ["-k", ROOT], { encoding: "utf8" }).split("\n")[1];
  const freeGb = +out.split(/\s+/)[3] / 1e6;
  const msg = `свободно на диске: ${freeGb.toFixed(1)} ГБ`;
  (freeGb > 20 ? ok : warn).push(msg + (freeGb > 20 ? "" : " — промежуточный ProRes занимает ~2.5 ГБ на минуту"));
} catch {}

const p = (icon, list) => list.forEach((l) => console.log(`${icon} ${l}`));
p("✓", ok); p("•", warn); p("✗", bad);
console.log(
  bad.length
    ? `\nЕсть чего не хватает — см. строки со знаком ✗`
    : vids.length
      ? `\nВсё на месте. Дальше: npm run probe`
      : `\nОкружение готово, ждём ролик в input/`
);
process.exit(bad.length ? 1 : 0);
