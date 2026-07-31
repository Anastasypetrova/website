import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths, so the build works both at a domain root
  // (anastasia-samadhi.club) and under a subpath
  // (anastasypetrova.github.io/website/). An absolute base breaks whichever
  // of the two it was not built for.
  base: './',
  plugins: [react()],
})
