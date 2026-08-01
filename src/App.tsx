import { useEffect, useState } from 'react';
import { LangContext, type Lang } from './i18n';
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

function getInitialLang(): Lang {
  if (typeof localStorage === 'undefined') return 'ru';
  return (localStorage.getItem('ap_lang') as Lang) || 'ru';
}

function App() {
  const [lang, setLang] = useState<Lang>(getInitialLang);

  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang);
  }, [lang]);

  const handleSetLang = (l: Lang) => {
    setLang(l);
    try {
      localStorage.setItem('ap_lang', l);
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
  };

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
