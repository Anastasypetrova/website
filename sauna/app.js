/* ------------------------------------------------------------------
   Anywhere Sauna site script. No build step, no dependencies.
   Edit CONFIG below — everything else picks it up.
   ------------------------------------------------------------------ */
const CONFIG = {
  brand: 'Anywhere Sauna',
  // WhatsApp number in international format, digits only (no +, spaces or dashes).
  whatsapp: '971543258890',
  whatsappDisplay: '+971 54 325 8890',
  instagram: 'anywhere_sauna',
  // TODO: the real TikTok handle. Until it is set the icon points at the
  // same name as Instagram, which may not exist.
  tiktok: 'anywhere_sauna',
  // Text that opens in WhatsApp when someone taps a "Chat" button.
  waGreeting: 'Hi! I’m interested in a sauna. Could you tell me more?',

  /* Traffic counters. Paste an id in and that counter starts working on the
     next page load. Leave one empty and nothing happens at all — no script is
     fetched, no cookie is set, no request leaves the visitor's browser. That
     is deliberate: a site should not be talking to four companies before
     anyone has decided to measure anything. */
  analytics: {
    ga4: '',        // Google Analytics: Admin → Data streams → "G-XXXXXXXXXX"
    metaPixel: '',  // Meta Events Manager: the numeric Pixel ID
    tiktokPixel: '',// TikTok Events Manager: the Pixel ID
    // Cloudflare Web Analytics: free, sets no cookie, needs no consent
    // banner, and answers one question well — how many people came.
    cloudflare: '', // the token from the Cloudflare dashboard
  },
};

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- traffic counters ---------- */
  /* Each one loads only when its id is filled in. The WhatsApp buttons and
     the request form also report themselves as conversions, so the numbers
     that matter — enquiries, not page views — land in the same place. */
  const A = CONFIG.analytics || {};
  const script = (src) => { const s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); };

  if (A.ga4) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', A.ga4);
    script('https://www.googletagmanager.com/gtag/js?id=' + A.ga4);
  }

  if (A.metaPixel) {
    const q = [];
    window.fbq = function () { (window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : q.push(arguments)); };
    window.fbq.queue = q; window.fbq.loaded = true; window.fbq.version = '2.0';
    window._fbq = window._fbq || window.fbq;
    script('https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', A.metaPixel);
    window.fbq('track', 'PageView');
  }

  if (A.cloudflare) {
    const s = document.createElement('script');
    s.defer = true;
    s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token: A.cloudflare }));
    document.head.appendChild(s);
  }

  if (A.tiktokPixel) {
    const t = (window.ttq = window.ttq || []);
    t.methods = ['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];
    t.setAndDefer = function (obj, m) { obj[m] = function () { obj.push([m].concat(Array.prototype.slice.call(arguments, 0))); }; };
    t.methods.forEach((m) => t.setAndDefer(t, m));
    t._i = {}; t._i[A.tiktokPixel] = []; t._t = {}; t._t[A.tiktokPixel] = +new Date(); t._o = {}; t._o[A.tiktokPixel] = {};
    script('https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + A.tiktokPixel + '&lib=ttq');
    t.page();
  }

  /* One call, so a conversion is recorded wherever counters are switched on. */
  function trackLead(where) {
    if (window.gtag) window.gtag('event', 'generate_lead', { method: where });
    if (window.fbq) window.fbq('track', 'Lead', { content_name: where });
    if (window.ttq && window.ttq.track) window.ttq.track('SubmitForm', { content_name: where });
  }
  /* ---------- brand + contacts from CONFIG ---------- */
  $$('[data-brand]').forEach((el) => { el.textContent = CONFIG.brand; });
  $$('[data-phone-display]').forEach((el) => { el.textContent = CONFIG.whatsappDisplay; });
  $$('[data-tel]').forEach((el) => { el.href = 'tel:+' + CONFIG.whatsapp; });
  $$('[data-ig]').forEach((el) => { el.href = 'https://instagram.com/' + CONFIG.instagram; });
  $$('[data-tt]').forEach((el) => { el.href = 'https://www.tiktok.com/@' + CONFIG.tiktok; });
  $$('[data-ig-display]').forEach((el) => { el.textContent = '@' + CONFIG.instagram; });

  const waLink = (text) =>
    'https://wa.me/' + CONFIG.whatsapp + (text ? '?text=' + encodeURIComponent(text) : '');

  $$('[data-wa]').forEach((el) => {
    el.addEventListener('click', () => trackLead('whatsapp'));
    el.href = waLink(CONFIG.waGreeting);
    el.target = '_blank';
    el.rel = 'noopener';
  });

  /* ---------- mobile menu ---------- */
  /* The guide pages run the same script for the counters and the WhatsApp
     links, and have no burger menu, so every lookup here tolerates a miss. */
  const sheet = $('[data-menu]');
  const openMenu = () => { if (sheet) { sheet.classList.add('on'); document.body.style.overflow = 'hidden'; } };
  const closeMenu = () => { if (sheet) { sheet.classList.remove('on'); document.body.style.overflow = ''; } };
  $$('[data-menu-open]').forEach((b) => b.addEventListener('click', openMenu));
  $$('[data-menu-close]').forEach((b) => b.addEventListener('click', closeMenu));
  if (sheet) $$('a', sheet).forEach((a) => a.addEventListener('click', closeMenu));
  /* ---------- the full-screen clip ---------- */
  /* "Watch video" plays the file we host, in one shared player. It used to
     embed an Instagram reel, which regularly failed to load; nothing here
     leaves the site. The source is attached on open and detached on close,
     so nothing downloads until someone asks and the sound stops when they
     are done. */
  const vmodal = $('[data-vmodal]');
  const vplayer = $('[data-vplayer]');

  function openVideo(src) {
    if (!vmodal || !vplayer) return;
    vplayer.src = src;
    vmodal.hidden = false;
    document.body.style.overflow = 'hidden';
    vplayer.play().catch(() => {});
  }

  function closeVideo() {
    if (!vmodal || vmodal.hidden) return;
    vplayer.pause();
    vplayer.removeAttribute('src');
    vplayer.load();
    vmodal.hidden = true;
    document.body.style.overflow = '';
  }

  $$('[data-video]').forEach((b) => b.addEventListener('click', () => openVideo(b.dataset.video)));
  $$('[data-vclose]').forEach((b) => b.addEventListener('click', closeVideo));
  /* A clip that will not play is a dead button, so it takes itself away. */
  if (vplayer) vplayer.addEventListener('error', () => {
    const src = vplayer.currentSrc || vplayer.getAttribute('src');
    closeVideo();
    if (src) $$('[data-video]').forEach((b) => { if (src.endsWith(b.dataset.video)) b.remove(); });
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenu(); closeVideo(); } });

  /* ---------- contact form → WhatsApp ---------- */
  const form = $('[data-form]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const lines = [
        'Hi! I’d like to ask about a sauna.',
        'Name: ' + f.get('name'),
        'Phone: ' + f.get('phone'),
        'Location: ' + f.get('city'),
        'Interested in: ' + f.get('type'),
        f.get('message') ? 'About the space: ' + f.get('message') : '',
      ];
      trackLead('form');
      window.open(waLink(lines.filter(Boolean).join('\n')), '_blank', 'noopener');
    });
  }


  /* ---------- clips that play as you scroll ---------- */
  /* Each spread's main picture is the poster of a short clip. The clip plays
     muted when it comes into view and pauses when it leaves, so nothing is
     downloaded or decoded for a sauna nobody has scrolled to. If the file is
     missing or the browser cannot play it, the video element goes and the
     photograph underneath stays — which is what a visitor saw before. */
  const reels = $$('[data-reel]');
  const quiet = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const muteOthers = (keep) => reels.forEach((v) => { if (v !== keep) { v.muted = true; syncSound(v); } });
  function syncSound(v) {
    const b = v.parentElement && v.parentElement.querySelector('[data-sound]');
    if (!b) return;
    b.classList.toggle('on', !v.muted);
    b.setAttribute('aria-label', v.muted ? 'Turn sound on' : 'Turn sound off');
  }

  reels.forEach((v) => {
    const fig = v.parentElement;
    const btn = fig && fig.querySelector('[data-sound]');

    v.addEventListener('error', () => { v.remove(); if (btn) btn.remove(); });
    v.addEventListener('loadeddata', () => {
      fig.classList.add('has-video');
      if (btn) btn.hidden = false;
    });

    if (btn) {
      btn.addEventListener('click', () => {
        attach(v);
        v.muted = !v.muted;
        if (!v.muted) { muteOthers(v); v.play().catch(() => {}); }
        syncSound(v);
      });
    }
  });

  /* The file is attached the first time the clip comes near the screen, not
     when the page loads. Four clips on the tag cost ten megabytes before
     anyone had scrolled; this way nothing is fetched until it is wanted. */
  function attach(v) {
    if (v.src || !v.dataset.src) return;
    v.src = v.dataset.src;
  }

  if (reels.length && 'IntersectionObserver' in window && !quiet) {
    /* A wide margin so the file has a head start on the clip being seen. */
    const near = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { attach(en.target); near.unobserve(en.target); }
      });
    }, { rootMargin: '300px 0px' });
    reels.forEach((v) => near.observe(v));
  } else {
    reels.forEach(attach);
  }

  if (reels.length && 'IntersectionObserver' in window && !quiet) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const v = en.target;
        if (en.isIntersecting) { attach(v); v.play().catch(() => {}); }
        else { v.pause(); v.muted = true; syncSound(v); }
      });
    }, { threshold: 0.45 });
    reels.forEach((v) => vio.observe(v));
  }

  /* ---------- reveal on scroll ---------- */
  const rv = $$('.rv');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach((el) => io.observe(el));
  } else {
    rv.forEach((el) => el.classList.add('in'));
  }
})();
