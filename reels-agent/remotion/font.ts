import { continueRender, delayRender, staticFile } from "remotion";

/**
 * Inter грузится всеми четырьмя подмножествами.
 *
 * На сайте шрифт нарезан по unicode-range: кириллица и латиница лежат в разных
 * файлах. Русский субтитр без латинского подмножества отрисуется, а точки,
 * запятые и восклицательные знаки останутся без глифов — они живут в латинском
 * куске. Рендер не ждёт шрифт сам, поэтому держим кадр через delayRender:
 * иначе первые кадры уйдут в фолбэк-шрифт с другими метриками.
 */
const SUBSETS = [
  "fonts/inter-300-cyrillic.woff2",
  "fonts/inter-300-cyrillic-ext.woff2",
  "fonts/inter-300-latin.woff2",
  "fonts/inter-300-latin-ext.woff2",
];

let started = false;

export const loadInter = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("загрузка Inter");

  Promise.all(
    SUBSETS.map(async (src) => {
      const face = new FontFace("Inter", `url(${staticFile(src)}) format('woff2')`, {
        weight: "300",
        style: "normal",
      });
      await face.load();
      // FontFaceSet в текущих типах DOM не объявляет add — приведение
      // нужно только для тайпчека, в браузере метод есть.
      (document.fonts as unknown as { add: (f: FontFace) => void }).add(face);
    })
  )
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
};
