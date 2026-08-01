import { useEffect, useRef, useState } from 'react';
import { LangContext, type Lang } from './i18n';
import { LegalPage } from './components/LegalPage';
import { findLegalDoc } from './legal';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { IntroQuote } from './components/IntroQuote';
import { Stats } from './components/Stats';
import { VideosSection } from './components/VideosSection';
import { PullQuotePhoto } from './components/PullQuotePhoto';
import { Reviews } from './components/Reviews';
import { FormatList } from './components/FormatList';
import { ClubSection } from './components/ClubSection';
import { PersonalSessionSection } from './components/PersonalSessionSection';
import { MentorshipSection } from './components/MentorshipSection';
import { MastermindSection } from './components/MastermindSection';
import { AwakeningQuote } from './components/AwakeningQuote';
import { About } from './components/About';
import { TelegramBand } from './components/TelegramBand';
import { Faq } from './components/Faq';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { T } from './i18n';

const SITE_TITLE = 'Анастасия Петрова';

function getInitialLang(): Lang {
  if (typeof localStorage === 'undefined') return 'ru';
  return (localStorage.getItem('ap_lang') as Lang) || 'ru';
}

function App() {
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang);
  }, [lang]);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // `#/docs/<slug>` swaps the landing page for that document's own page. Hash
  // routing keeps every asset path relative, so the site still works both on
  // the custom domain and under the /website/ project path on github.io.
  const doc = findLegalDoc(hash);
  const cameFromDoc = useRef(Boolean(doc));

  useEffect(() => {
    if (doc) {
      window.scrollTo(0, 0);
    } else if (cameFromDoc.current) {
      // Leaving a document page: the target section only exists now that the
      // landing page has rendered, so the browser's own jump has already missed it.
      const target = hash.startsWith('#') && !hash.startsWith('#/')
        ? document.getElementById(hash.slice(1))
        : null;
      if (target) target.scrollIntoView();
      else window.scrollTo(0, 0);
    }
    cameFromDoc.current = Boolean(doc);
  }, [hash, doc]);

  useEffect(() => {
    document.title = doc ? `${doc.title} — Анастасия Петрова` : SITE_TITLE;
  }, [doc]);

  const handleSetLang = (l: Lang) => {
    setLang(l);
    try {
      localStorage.setItem('ap_lang', l);
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
  };

  if (doc) {
    return (
      <LangContext.Provider value={lang}>
        <LegalPage doc={doc} onSetLang={handleSetLang} />
      </LangContext.Provider>
    );
  }

  return (
    <LangContext.Provider value={lang}>
      <Nav onSetLang={handleSetLang} />
      <Hero />
      <IntroQuote />
      <Stats />
      <VideosSection />
      <PullQuotePhoto
        photo="quote"
        quote={
          <T
            ru={<>Эта информация и живое взаимодействие уже <em className="accent" style={{ fontSize: 'calc(clamp(28px,5vw,50px) * var(--hs))' }}>изменили жизнь</em> сотням людей</>}
            en={<>This information, and the live interaction, has already <em className="accent" style={{ fontSize: 'calc(clamp(28px,5vw,50px) * var(--hs))' }}>changed the lives</em> of hundreds of people</>}
          />
        }
      />
      <Reviews />
      <FormatList />
      <ClubSection />
      <PersonalSessionSection />
      <MentorshipSection />
      <MastermindSection />
      <AwakeningQuote />
      <About />
      <Faq />
      <TelegramBand />
      <Contact />
      <Footer />
    </LangContext.Provider>
  );
}

export default App;
