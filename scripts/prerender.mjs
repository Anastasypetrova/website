/**
 * Bakes the rendered landing page into dist/index.html.
 *
 * Without this the file a crawler downloads is an empty <div id="root"></div>:
 * every word of the site only exists after the JavaScript has run. Google does
 * render JavaScript, but it queues those pages and re-crawls them later, and
 * Yandex — which matters for a Russian-speaking audience — is far less reliable
 * at it. Baking the markup in means the text is simply there, for every crawler,
 * on the first fetch.
 *
 * React takes over on load and re-renders the same tree, so nothing is frozen:
 * the language toggle, the accordion and the consent checkboxes work as before.
 * The markup is a starting picture, not a hydration target.
 *
 * Runs from `npm run build` after `vite build`.
 */
import { build } from 'vite';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const OUT = 'dist/index.html';
const SSR_DIR = 'node_modules/.tmp/ssr';

await build({
  logLevel: 'warn',
  build: {
    ssr: 'src/entry-server.tsx',
    outDir: SSR_DIR,
    emptyOutDir: true,
    // the CSS is already in dist from the client build
    cssCodeSplit: false,
  },
});

const { render } = await import(pathToFileURL(resolve(SSR_DIR, 'entry-server.js')).href);
const html = readFileSync(OUT, 'utf8');
const markup = render();

if (!html.includes('<div id="root"></div>')) {
  throw new Error(`${OUT} no longer has an empty root div to fill`);
}
if (markup.length < 10_000) {
  throw new Error(`prerendered markup is suspiciously short (${markup.length} bytes)`);
}

writeFileSync(OUT, html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`));
rmSync(SSR_DIR, { recursive: true, force: true });

console.log(`prerendered ${(markup.length / 1024).toFixed(0)} KB of markup into ${OUT}`);
