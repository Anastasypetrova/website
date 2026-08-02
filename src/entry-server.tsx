/**
 * Build-time render of the landing page. See scripts/prerender.mjs for why.
 *
 * Not a server: this runs once during `npm run build` and its output is baked
 * into dist/index.html as static HTML.
 */
import { renderToString } from 'react-dom/server';
import App from './App';

export function render(): string {
  return renderToString(<App />);
}
