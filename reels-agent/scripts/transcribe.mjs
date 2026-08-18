#!/usr/bin/env node
// Транскрипция локальным whisper.cpp. Ключей не нужно, наружу ничего не уходит.
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  downloadWhisperModel, installWhisperCpp, transcribe, toCaptions,
} from "@remotion/install-whisper-cpp";
import { ROOT, preset, resolveInput } from "../lib/env.mjs";
import { extractWav } from "../lib/audio.mjs";

const t = preset.transcribe;

// Модели с суффиксом .en понимают только английский и на русском выдают
// правдоподобный мусор — без ошибки, что хуже всего. Ловим это до запуска.
if (t.language !== "en" && /\.en$/.test(t.model)) {
  console.error(
    `Модель «${t.model}» англо-только, а язык в пресете «${t.language}».\n` +
    `Возьми мультиязычную: medium или large-v3.`
  );
  process.exit(1);
}

const input = resolveInput(process.argv[2]);
const whisperPath = join(ROOT, "whisper.cpp");
const version = "1.5.5";

console.log("готовлю whisper.cpp…");
await installWhisperCpp({ to: whisperPath, version });
await downloadWhisperModel({ model: t.model, folder: whisperPath });

const wav = extractWav(input);
console.log(`распознаю (${t.model}, язык ${t.language})…`);

const out = await transcribe({
  model: t.model,
  whisperPath,
  whisperCppVersion: version,
  inputPath: wav,
  tokenLevelTimestamps: t.token_level_timestamps,
  language: t.language,
  translateToEnglish: false,
});

const { captions } = toCaptions({ whisperCppOutput: out });
const dst = join(ROOT, "work", "captions.json");
writeFileSync(dst, JSON.stringify(captions, null, 2));

const secs = captions.length ? captions[captions.length - 1].endMs / 1000 : 0;
console.log(`\nслов: ${captions.length}, до ${secs.toFixed(1)} с → ${dst}`);
console.log(`дальше: npm run plan`);
