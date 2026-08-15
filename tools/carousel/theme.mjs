/**
 * Design tokens and slide CSS for the Instagram carousel renderer.
 *
 * The palette, type scale and shapes are the site's own (see `src/styles.css`),
 * scaled up for a 1080px canvas: a carousel that lands on the same feed as the
 * site should read as the same brand, not as a lookalike.
 *
 * Fonts are not redefined here — the page links `src/fonts.css` straight from
 * the repo, so the slides use exactly the woff2 files the site ships.
 */

/** Instagram canvases. 4:5 is the default: it takes the most feed height. */
export const SIZES = {
  '4:5': { w: 1080, h: 1350 },
  '1:1': { w: 1080, h: 1080 },
  '9:16': { w: 1080, h: 1920 },
};

export const DEFAULT_SIZE = '4:5';

/**
 * Escape text before it goes into HTML. Every string from a spec passes
 * through here, so a stray `<` in copy can never break the layout.
 */
export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * The tiny markup language a spec's text fields understand:
 *
 *   {слово}   accent word in Great Vibes, like `em.accent` on the site
 *   *слово*   italic Playfair Display, like `.dh em`
 *   //        hard line break
 *
 * Everything else is plain text and is escaped.
 */
export function rich(s) {
  return esc(s)
    .replace(/\{([^{}]+)\}/g, '<em class="accent">$1</em>')
    .replace(/\*([^*]+)\*/g, '<em class="serif">$1</em>')
    .replace(/\s*\/\/\s*/g, '<br>');
}

export function baseCss({ w, h }) {
  return `
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --cream:#FAF8F5;--cream-2:#F7F5F2;--sand-200:#EFEAE2;
  --ink:#2C2C2C;--taupe-700:#5B5B55;--taupe-600:#6E6E67;--taupe-500:#8A897F;
  --sage:#8B9B82;--sage-deep:#3F443B;--mist-100:#EEF1EA;--mist-200:#DDE4D4;
  --clay:#C79A78;--clay-d:#8F5A3B;
  --font-head:'Onest',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;
  --font-display:'Playfair Display',Georgia,serif;
  --font-script:'Great Vibes',cursive;
  --font-sans:'Manrope',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;
  --font-grotesk:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;
  --pad:92px;
  --border-subtle:rgba(44,44,44,.10);
  /* Set per slide by the auto-fit pass; every type size is multiplied by it. */
  --fit:1;
}
html,body{background:#111;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
body{display:flex;flex-direction:column;align-items:center;gap:40px;padding:40px}

.slide{
  position:relative;width:${w}px;height:${h}px;overflow:hidden;
  background:var(--cream);color:var(--ink);font-family:var(--font-sans);
}
.slide-in{position:relative;z-index:3;height:100%;padding:var(--pad);display:flex;flex-direction:column}

/* photo layer */
.bg{position:absolute;inset:0;z-index:1}
.bg img{width:100%;height:100%;object-fit:cover;display:block}
.scrim{position:absolute;inset:0;z-index:2}
.scrim-bottom{background:linear-gradient(180deg,rgba(26,24,21,.46) 0%,rgba(26,24,21,.06) 26%,rgba(26,24,21,.14) 52%,rgba(26,24,21,.80) 100%)}
.scrim-full{background:linear-gradient(180deg,rgba(20,20,20,.52),rgba(20,20,20,.44))}
.scrim-soft{background:linear-gradient(180deg,rgba(20,20,20,.28),rgba(20,20,20,.30))}
.scrim-top{background:linear-gradient(180deg,rgba(26,24,21,.72) 0%,rgba(26,24,21,.18) 46%,rgba(26,24,21,.10) 100%)}
.on-photo{color:#fff}
.on-photo .body,.on-photo .kicker{color:rgba(255,255,255,.90)}
.on-photo .eyebrow{color:rgba(255,255,255,.88)}
.on-photo .rule{background:rgba(255,255,255,.30)}

/* type */
.eyebrow{
  font-family:var(--font-sans);font-weight:600;font-size:calc(19px*var(--fit));
  letter-spacing:.20em;text-transform:uppercase;color:var(--clay-d);
  display:inline-flex;align-items:center;gap:14px;
}
.eyebrow::before{content:'';width:38px;height:1px;background:currentColor;opacity:.55;flex:none}
.eyebrow.bare::before{display:none}

.h{font-family:var(--font-head);font-weight:400;color:inherit;line-height:1.06;letter-spacing:-.022em;text-wrap:balance}
.h1{font-size:calc(90px*var(--fit))}
.h2{font-size:calc(68px*var(--fit));line-height:1.12}
.h3{font-size:calc(52px*var(--fit));line-height:1.16}
em.accent{font-family:var(--font-script);font-style:normal;font-weight:400;font-size:1.16em;letter-spacing:0;line-height:.92}
em.serif{font-family:var(--font-display);font-style:italic;font-weight:500;letter-spacing:0}

.body{font-family:var(--font-sans);font-weight:400;font-size:calc(30px*var(--fit));line-height:1.60;color:var(--taupe-700);text-wrap:pretty}
.body.lg{font-size:calc(34px*var(--fit));line-height:1.56}
.body + .body{margin-top:calc(26px*var(--fit))}
.kicker{font-family:var(--font-sans);font-weight:500;font-size:calc(26px*var(--fit));letter-spacing:.02em;color:var(--taupe-600)}

.rule{width:76px;height:1px;background:var(--border-subtle);flex:none}

/* cover */
.cover .slide-in{justify-content:flex-end}
.cover .top{position:absolute;top:var(--pad);left:var(--pad);right:var(--pad)}
.cover .h1{max-width:15ch}
.cover .body{margin-top:calc(30px*var(--fit));max-width:26ch}

/* centred statement / quote */
.center .slide-in{justify-content:center;align-items:center;text-align:center}
.center .h{max-width:17ch}
.center .body{max-width:28ch;margin-top:calc(34px*var(--fit))}
.qa{margin-top:calc(40px*var(--fit));font-family:var(--font-sans);font-weight:600;font-size:calc(20px*var(--fit));letter-spacing:.16em;text-transform:uppercase;color:var(--clay-d)}
.on-photo .qa{color:rgba(255,255,255,.80)}
.quotemark{font-family:var(--font-display);font-size:calc(150px*var(--fit));line-height:.6;color:var(--clay);opacity:.42;margin-bottom:calc(16px*var(--fit))}
.on-photo .quotemark{color:rgba(255,255,255,.55);opacity:1}

/* left-aligned text slide */
.text .slide-in{justify-content:center;gap:calc(38px*var(--fit))}
.text .h2{max-width:15ch}
.text .body{max-width:30ch}

/* lists */
.items{display:flex;flex-direction:column;gap:calc(30px*var(--fit))}
.item{display:flex;gap:26px;align-items:flex-start}
.item .dot{flex:none;width:11px;height:11px;border-radius:50%;background:var(--sage);margin-top:calc(17px*var(--fit))}
.item .t{font-family:var(--font-head);font-weight:400;font-size:calc(38px*var(--fit));line-height:1.32;letter-spacing:-.012em;color:var(--ink)}
.item .b{margin-top:10px;font-size:calc(27px*var(--fit));line-height:1.55;color:var(--taupe-700)}
.on-photo .item .t{color:#fff}
.on-photo .item .b{color:rgba(255,255,255,.88)}

/* numbered steps — thin Inter numerals, as on the site's stat blocks */
.item .n{
  flex:none;font-family:var(--font-grotesk);font-weight:100;font-size:calc(56px*var(--fit));
  line-height:1;letter-spacing:-.03em;color:var(--clay-d);min-width:calc(96px*var(--fit));
  padding-top:calc(2px*var(--fit));
}

/* big number */
.stat{display:flex;align-items:flex-start;font-family:var(--font-grotesk);font-weight:100;font-size:calc(250px*var(--fit));line-height:.86;letter-spacing:-.04em;color:var(--clay-d)}
.stat sup{font-size:.34em;font-weight:inherit;margin-left:6px;margin-top:.06em;line-height:1}
.stat-l{margin-top:calc(34px*var(--fit));font-family:var(--font-sans);font-weight:600;font-size:calc(21px*var(--fit));letter-spacing:.14em;text-transform:uppercase;color:var(--taupe-500)}

/* split: photo above, copy below */
.split .slide-in{padding:0}
.split .ph{position:relative;width:100%;height:52%;overflow:hidden;flex:none}
.split .ph img{width:100%;height:100%;object-fit:cover}
.split .cp{flex:1;padding:calc(72px*var(--fit)) var(--pad) var(--pad);display:flex;flex-direction:column;justify-content:center;gap:calc(28px*var(--fit))}

/* cta */
.cta-slide .slide-in{justify-content:center;align-items:center;text-align:center}
.pill{
  display:inline-flex;align-items:center;gap:18px;background:var(--sage);color:#fff;
  border-radius:999px;padding:calc(28px*var(--fit)) calc(52px*var(--fit));
  font-family:var(--font-sans);font-weight:600;font-size:calc(28px*var(--fit));
  letter-spacing:.01em;white-space:nowrap;margin-top:calc(48px*var(--fit));
}
.pill svg{width:calc(28px*var(--fit));height:calc(28px*var(--fit));flex:none}
.cta-slide .link{margin-top:calc(30px*var(--fit));font-family:var(--font-sans);font-weight:500;font-size:calc(24px*var(--fit));letter-spacing:.04em;color:var(--taupe-600)}
.on-photo .cta-slide .link,.cta-slide.on-photo .link{color:rgba(255,255,255,.85)}

/* footer chrome: handle, counter, swipe hint */
.foot{
  position:absolute;left:var(--pad);right:var(--pad);bottom:calc(var(--pad) - 26px);z-index:4;
  display:flex;align-items:center;justify-content:space-between;
  font-family:var(--font-sans);font-weight:600;font-size:20px;letter-spacing:.10em;
  text-transform:uppercase;color:var(--taupe-500);
}
.on-photo .foot{color:rgba(255,255,255,.78)}
.foot .swipe{display:inline-flex;align-items:center;gap:12px}
.foot .swipe svg{width:26px;height:26px}
.cover .foot,.cta-slide .foot{bottom:calc(var(--pad) - 34px)}

/* safe-area guides, drawn only with --guides */
.guides{position:absolute;inset:0;z-index:9;pointer-events:none;display:none}
.guides.on{display:block}
.guides .sq{position:absolute;left:0;right:0;top:calc((${h}px - ${w}px)/2);height:${w}px;outline:2px dashed rgba(255,0,90,.55)}
.guides .pad{position:absolute;inset:var(--pad);outline:2px dashed rgba(0,120,255,.45)}
`;
}

/** Arrow used by the swipe hint and the CTA pill. */
export const ARROW_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

export const TELEGRAM_SVG =
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.4-4.9 9-8.1c.4-.3-.1-.5-.6-.2L6.7 13.2 2 11.7c-1-.3-1-1 .2-1.5l18.4-7.1c.9-.3 1.6.2 1.3 1.2Z"/></svg>';
