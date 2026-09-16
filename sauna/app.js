/* ------------------------------------------------------------------
   NORDA site script. No build step, no dependencies.
   Edit CONFIG below — everything else picks it up.
   ------------------------------------------------------------------ */
const CONFIG = {
  brand: 'NORDA',
  // WhatsApp number in international format, digits only (no +, spaces or dashes).
  whatsapp: '971500000000',
  whatsappDisplay: '+971 50 000 0000',
  email: 'hello@example.com',
  instagram: 'norda.sauna',
  // Text that opens in WhatsApp when someone taps a "Chat" button.
  waGreeting: {
    en: 'Hi! I’m interested in a custom sauna. Could you tell me more?',
    ru: 'Здравствуйте! Интересует сауна на заказ. Расскажите подробнее?',
  },
};

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const html = document.documentElement;

  /* ---------- brand + contacts from CONFIG ---------- */
  $$('[data-brand]').forEach((el) => { el.textContent = CONFIG.brand; });
  $$('[data-phone-display]').forEach((el) => { el.textContent = CONFIG.whatsappDisplay; });
  $$('[data-email]').forEach((el) => { el.href = 'mailto:' + CONFIG.email; });
  $$('[data-email-display]').forEach((el) => { el.textContent = CONFIG.email; });
  $$('[data-ig]').forEach((el) => { el.href = 'https://instagram.com/' + CONFIG.instagram; });
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
    try { localStorage.setItem('norda-lang', lang); } catch (_) {}
    setWaLinks();
  }

  $$('[data-lang-toggle]').forEach((b) =>
    b.addEventListener('click', () => setLang(html.dataset.lang === 'ru' ? 'en' : 'ru')));

  let saved = null;
  try { saved = localStorage.getItem('norda-lang'); } catch (_) {}
  if (!saved && /^ru\b/i.test(navigator.language || '')) saved = 'ru';
  setLang(saved === 'ru' ? 'ru' : 'en');

  /* ---------- mobile menu ---------- */
  const sheet = $('[data-menu]');
  const openMenu = () => { sheet.classList.add('on'); document.body.style.overflow = 'hidden'; };
  const closeMenu = () => { sheet.classList.remove('on'); document.body.style.overflow = ''; };
  $$('[data-menu-open]').forEach((b) => b.addEventListener('click', openMenu));
  $$('[data-menu-close]').forEach((b) => b.addEventListener('click', closeMenu));
  $$('a', sheet).forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

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
