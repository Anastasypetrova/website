/**
 * Сборка страниц сайта в готовый HTML. Зачем — см. scripts/prerender.mjs.
 *
 * Не сервер: это выполняется один раз во время `npm run build`, а результат
 * кладётся в dist как статические файлы.
 */
import { renderToString } from 'react-dom/server';
import { Site } from './App';
import type { Here } from './routes';

export function render(here: Here): string {
  return renderToString(<Site here={here} />);
}

export { allPages, pathOf } from './routes';
export { buildHead } from './seo';
