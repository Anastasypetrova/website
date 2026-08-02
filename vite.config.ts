import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { buildSitemap, buildStructuredData } from './src/seo'

/**
 * Inlines schema.org structured data into index.html and emits sitemap.xml,
 * both generated from src/content.ts so the markup and the visible page can
 * never disagree — which is exactly what Google penalises FAQ markup for.
 */
function seo(): Plugin {
  return {
    name: 'seo',
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `  <script type="application/ld+json">${buildStructuredData()}</script>\n  </head>`,
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
