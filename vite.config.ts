import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { buildSitemap, buildStructuredData } from './src/seo'

/**
 * The fonts the first screen is drawn with. Until they arrive the hero is laid
 * out in a fallback whose metrics differ, and the whole block jumps when they
 * swap in — measured at 0.169 CLS, well past the 0.1 Google treats as healthy.
 * Preloading them removes the swap. Matched by prefix because the built file
 * names carry a content hash.
 */
const CRITICAL_FONTS = [
  'onest-400-cyrillic-',       // hero heading and section titles
  'onest-400-latin-',
  'great-vibes-400-cyrillic-', // the script accent inside the heading
  'great-vibes-400-latin-',
  'manrope-400-cyrillic-',     // body copy under it
  'manrope-400-latin-',
]

// Both halves of each: the hero text is Russian, but its full stops and commas
// live in the latin subset, so a Cyrillic-only preload still leaves the heading
// waiting — and reflowing — on a second file.

/**
 * Inlines schema.org structured data into index.html, preloads the fonts the
 * first screen needs, and emits sitemap.xml. The structured data is generated
 * from src/content.ts so the markup and the visible page can never disagree —
 * which is exactly what Google penalises FAQ markup for.
 */
function seo(): Plugin {
  return {
    name: 'seo',
    transformIndexHtml(html, ctx) {
      const files = Object.keys(ctx.bundle ?? {})
      const preloads = CRITICAL_FONTS.map((prefix) => {
        const file = files.find((f) => f.includes(prefix) && f.endsWith('.woff2'))
        return file
          ? `  <link rel="preload" as="font" type="font/woff2" href="${file}" crossorigin />`
          : ''
      })
        .filter(Boolean)
        .join('\n')

      return html.replace(
        '</head>',
        `${preloads}\n  <script type="application/ld+json">${buildStructuredData()}</script>\n  </head>`,
      )
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: buildSitemap(new Date().toISOString().slice(0, 10)),
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths, so the build works both at a domain root
  // (anastasia-samadhi.club) and under a subpath
  // (anastasypetrova.github.io/website/). An absolute base breaks whichever
  // of the two it was not built for.
  base: './',
  plugins: [react(), seo()],
})
