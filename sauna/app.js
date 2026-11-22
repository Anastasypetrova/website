/* ------------------------------------------------------------------
   NORDA site script. No build step, no dependencies.
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
  waGreeting: {
    en: 'Hi! I’m interested in a sauna. Could you tell me more?',
    ru: 'Здравствуйте! Интересует сауна. Расскажите подробнее?',
  },
};

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const html = document.documentElement;

  /* ---------- brand + contacts from CONFIG ---------- */
  $$('[data-brand]').forEach((el) => { el.textContent = CONFIG.brand; });
  $$('[data-phone-display]').forEach((el) => { el.textContent = CONFIG.whatsappDisplay; });
  $$('[data-tel]').forEach((el) => { el.href = 'tel:+' + CONFIG.whatsapp; });
  $$('[data-ig]').forEach((el) => { el.href = 'https://instagram.com/' + CONFIG.instagram; });
  $$('[data-tt]').forEach((el) => { el.href = 'https://www.tiktok.com/@' + CONFIG.tiktok; });
  $$('[data-ig-display]').forEach((el) => { el.textContent = '@' + CONFIG.instagram; });

  const waLink = (text) =>
    'https://wa.me/' + CONFIG.whatsapp + (text ? '?text=' + encodeURIComponent(text) : '');

  function setWaLinks() {
    const lang = html.dataset.lang || 'en';
    $$('[data-wa]').forEach((el) => {
      el.href = waLink(CONFIG.waGreeting[lang] || CONFIG.waGreeting.en);
      el.target = '_blank';
      el.rel = 'noopener';
    });
  }

  /* ---------- language: EN lives in the HTML, RU in ru.js ---------- */
  const EN = {};
  const ENph = {};
  $$('[data-i]').forEach((el) => { if (!(el.dataset.i in EN)) EN[el.dataset.i] = el.innerHTML; });
  $$('[data-i-ph]').forEach((el) => { ENph[el.dataset.iPh] = el.placeholder; });

  function setLang(lang) {
    const dict = lang === 'ru' ? window.RU || {} : EN;
    $$('[data-i]').forEach((el) => {
      const v = dict[el.dataset.i];
      if (v != null) el.innerHTML = v;
    });
    $$('[data-i-ph]').forEach((el) => {
      const v = lang === 'ru' ? (window.RU || {})[el.dataset.iPh] : ENph[el.dataset.iPh];
      if (v != null) el.placeholder = v;
    });
    html.dataset.lang = lang;
    html.lang = lang;
    $$('[data-lang-toggle]').forEach((b) => { b.textContent = lang === 'ru' ? 'EN' : 'RU'; });
    try { localStorage.setItem('anywhere-lang', lang); } catch (_) {}
    setWaLinks();
  }

  $$('[data-lang-toggle]').forEach((b) =>
    b.addEventListener('click', () => setLang(html.dataset.lang === 'ru' ? 'en' : 'ru')));

  let saved = null;
  try { saved = localStorage.getItem('anywhere-lang'); } catch (_) {}
  if (!saved && /^ru\b/i.test(navigator.language || '')) saved = 'ru';
  setLang(saved === 'ru' ? 'ru' : 'en');

  /* ---------- mobile menu ---------- */
  const sheet = $('[data-menu]');
  const openMenu = () => { sheet.classList.add('on'); document.body.style.overflow = 'hidden'; };
  const closeMenu = () => { sheet.classList.remove('on'); document.body.style.overflow = ''; };
  $$('[data-menu-open]').forEach((b) => b.addEventListener('click', openMenu));
  $$('[data-menu-close]').forEach((b) => b.addEventListener('click', closeMenu));
  $$('a', sheet).forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenu(); closeVideo(); } });

  /* ---------- contact form → WhatsApp ---------- */
  const form = $('[data-form]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const ru = html.dataset.lang === 'ru';
      const lines = ru
        ? [
            'Здравствуйте! Хочу узнать про сауну.',
            'Имя: ' + f.get('name'),
            'Телефон: ' + f.get('phone'),
            'Где: ' + f.get('city'),
            'Интересует: ' + f.get('type'),
            f.get('message') ? 'Про место: ' + f.get('message') : '',
          ]
        : [
            'Hi! I’d like to ask about a sauna.',
            'Name: ' + f.get('name'),
            'Phone: ' + f.get('phone'),
            'Location: ' + f.get('city'),
            'Interested in: ' + f.get('type'),
            f.get('message') ? 'About the space: ' + f.get('message') : '',
          ];
      window.open(waLink(lines.filter(Boolean).join('\n')), '_blank', 'noopener');
    });
  }

  /* ---------- video ---------- */
  /* Each sauna's "Watch video" opens its reel in one shared player. The
     iframe gets a src only on open: nothing reaches Instagram until someone
     asks for a video, and clearing the src on close stops the sound. */
  const vmodal = $('[data-vmodal]');
  const vframe = $('[data-vframe]');
  const vlink = $('[data-vlink]');
  const openVideo = (id) => {
    if (!vmodal) return;
    vframe.src = 'https://www.instagram.com/reel/' + id + '/embed/';
    vlink.href = 'https://www.instagram.com/reel/' + id + '/';
    vmodal.hidden = false;
    document.body.style.overflow = 'hidden';
  };
  const closeVideo = () => {
    if (!vmodal || vmodal.hidden) return;
    vmodal.hidden = true;
    vframe.src = '';
    document.body.style.overflow = '';
  };
  $$('[data-video]').forEach((b) => b.addEventListener('click', () => openVideo(b.dataset.video)));
  $$('[data-vclose]').forEach((b) => b.addEventListener('click', closeVideo));

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
        v.muted = !v.muted;
        if (!v.muted) { muteOthers(v); v.play().catch(() => {}); }
        syncSound(v);
      });
    }
  });

  if (reels.length && 'IntersectionObserver' in window && !quiet) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const v = en.target;
        if (en.isIntersecting) { v.play().catch(() => {}); }
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
