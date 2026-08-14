/**
 * Bundles the Worker into one file that can be pasted straight into the
 * Cloudflare dashboard editor — no terminal, no wrangler, no Node install.
 *
 *   node api/bundle.mjs   ->   api/dist/worker.js
 *
 * `wrangler deploy` remains the better route for anyone comfortable with a
 * terminal; this exists so the person who owns the site can deploy it herself.
 */
import { build } from 'vite';
import { renameSync, rmSync } from 'node:fs';

await build({
  logLevel: 'error',
  publicDir: false, // otherwise the site's public/ folder is copied in alongside
  build: {
    ssr: 'api/src/index.ts',
    outDir: 'api/dist',
    emptyOutDir: true,
    minify: false, // readable in the dashboard editor, and size is not a concern
    target: 'esnext',
  },
});

rmSync('api/dist/worker.js', { force: true });
renameSync('api/dist/index.js', 'api/dist/worker.js');
console.log('api/dist/worker.js готов — вставляется в редактор Cloudflare целиком');
