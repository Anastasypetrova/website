#!/usr/bin/env node
// Цветокор в промежуточный ProRes. Один filter_complex, один энкод.
import { join } from "node:path";
import { ffmpeg, ffprobe, run, resolveInput, preset, ROOT } from "../lib/env.mjs";
import { buildFilterComplex, maskSource, ensureMask, intermediateArgs } from "../lib/grade.mjs";

const input = resolveInput(process.argv[2]);
const output = process.argv[3] || join(ROOT, "work", "graded.mov");

const meta = JSON.parse(
  run(ffprobe(), ["-v", "error", "-print_format", "json", "-show_streams", input])
);
const v = meta.streams.find((s) => s.codec_type === "video");
const hasAudio = meta.streams.some((s) => s.codec_type === "audio");

// Вверх не масштабируем: рендерим в размере исходника, если он мельче цели.
const width = Math.min(preset.output.width, v.width);
const height = Math.min(preset.output.height, v.height);

const fc = buildFilterComplex({ width, height, srcW: v.width, srcH: v.height });
console.log("filter_complex:\n  " + fc.replace(/;/g, ";\n  "));

const t0 = Date.now();
run(ffmpeg(), [
  "-v", "error", "-y",
  "-i", input,
  "-t", process.env.LIMIT_SECONDS || "999999",
  ...maskSource(ensureMask(width, height)),
  "-filter_complex", fc,
  "-map", "[out]",
  ...(hasAudio ? ["-map", "0:a", "-c:a", "copy"] : []),
  ...intermediateArgs(),
  "-color_primaries", preset.output.color.primaries,
  "-color_trc", preset.output.color.trc,
  "-colorspace", preset.output.color.space,
  output,
], { stdio: ["ignore", "inherit", "inherit"] });

console.log(`\nготово за ${((Date.now() - t0) / 1000).toFixed(1)} с → ${output}`);
