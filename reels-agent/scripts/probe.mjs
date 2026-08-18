#!/usr/bin/env node
// Что за файл принесли: разрешение, кадры, звук. Отсюда решается, надо ли масштабировать.
import { ffprobe, run, resolveInput, preset } from "../lib/env.mjs";

const input = resolveInput(process.argv[2]);
const raw = run(ffprobe(), [
  "-v", "error", "-print_format", "json", "-show_format", "-show_streams", input,
]);
const { streams, format } = JSON.parse(raw);
const v = streams.find((s) => s.codec_type === "video");
const a = streams.find((s) => s.codec_type === "audio");

const [num, den] = (v.r_frame_rate || "0/1").split("/").map(Number);
const out = preset.output;
const info = {
  файл: input.split("/").pop(),
  разрешение: `${v.width}x${v.height}`,
  кадров_в_секунду: +(num / den).toFixed(3),
  длительность_с: +Number(format.duration).toFixed(2),
  битрейт_мбит: +(Number(format.bit_rate) / 1e6).toFixed(2),
  видео_кодек: v.codec_name,
  звук: a ? `${a.codec_name} ${a.sample_rate}Гц ${a.channels}к` : "НЕТ",
};

console.log(JSON.stringify(info, null, 2));

const warn = [];
if (!a) warn.push("В файле нет звуковой дорожки — транскрибировать будет нечего.");
if (v.width / v.height > 0.6)
  warn.push(`Кадр не вертикальный (${v.width}x${v.height}). Ожидается 9:16.`);
if (v.width < out.width || v.height < out.height)
  warn.push(
    `Исходник (${v.width}x${v.height}) мельче цели (${out.width}x${out.height}). ` +
      `Вверх тянуть не буду — рендер выйдет в размере исходника.`
  );
if (Number(format.bit_rate) < 8e6)
  warn.push(
    `Битрейт ${(Number(format.bit_rate) / 1e6).toFixed(1)} Мбит/с — низковато для мастера. ` +
      `Похоже, файл уже пережат. Лучше переэкспортировать из CapCut в максимальном качестве.`
  );
if (warn.length) console.error("\n⚠ " + warn.join("\n⚠ "));
