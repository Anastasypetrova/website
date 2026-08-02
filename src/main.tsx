import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.css'
import './styles.css'
import App from './App.tsx'

/**
 * `?z=0.85` renders the whole site at that scale, so a scale can be judged on
 * the real site instead of guessed and redeployed. Ignored unless the value is
 * a sane fraction; the built-in scale lives in --z in styles.css.
 */
function applyScaleOverride() {
  const z = Number(new URLSearchParams(window.location.search).get('z'))
  if (Number.isFinite(z) && z >= 0.5 && z <= 1.5) {
    document.documentElement.style.setProperty('--z', String(z))
  }
}

applyScaleOverride()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
