import { useState } from 'react';
import { T, useLang } from '../i18n';
import { faqItems } from '../content';

export function Faq() {
  const lang = useLang();
  const [open, setOpen] = useState(0);

  return (
    <section className="sec bg1 anchor" id="faq">
      <div className="wrap-n">
        <span className="eyebrow" style={{ display: 'block', textAlign: 'center' }}>FAQ</span>
        <h2 className="dh dh2" style={{ margin: '14px auto 56px', textAlign: 'center', maxWidth: '20ch' }}>
          <T
            ru={<>Частые <em className="accent" style={{ fontSize: 'clamp(36px,6.8vw,68px)' }}>вопросы</em></>}
            en={<>Frequently asked <em className="accent" style={{ fontSize: 'clamp(36px,6.8vw,68px)' }}>questions</em></>}
          />
        </h2>
        <div className="faqlist">
          {faqItems.map((item, i) => {
            const isOpen = open === i;
            return (
              <div className={`faqrow ${isOpen ? 'open' : ''}`} key={i}>
                <button className="faqq" onClick={() => setOpen(isOpen ? -1 : i)}>
                  <span className="faqq-text">{lang === 'en' ? item.q.en : item.q.ru}</span>
                  <span className="faqidx">{String(i + 1).padStart(2, '0')} / {String(faqItems.length).padStart(2, '0')}</span>
                </button>
                {isOpen && <div className="faqa">{lang === 'en' ? item.a.en : item.a.ru}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
