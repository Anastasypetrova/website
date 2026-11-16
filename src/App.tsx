import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { LangContext, type Lang } from './i18n';
import { LegalPage } from './components/LegalPage';
import { ServicePage } from './components/ServicePage';
import { findLegalDoc, legalDocs } from './legal';
import { HereContext, previewMode } from './router';
import { rootPrefix, routeFromPath, type Here } from './routes';
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
import { ForeverYoungSection } from './components/ForeverYoungSection';
import { AwakeningQuote } from './components/AwakeningQuote';
import { About } from './components/About';
import { TelegramBand } from './components/TelegramBand';
import { Faq } from './components/Faq';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { showMastermind } from './content';
import { T } from './i18n';

// Дашборд — не часть сайта, а служебная страница, и её код незачем раздавать
// посетителям: lazy уводит его в отдельный файл, который скачивает только тот,
// кто открыл #/stats.
const Dashboard = lazy(() => import('./components/Dashboard'));

function Landing() {
  return (
    <>
      <Nav />
      <Hero />
      <IntroQuote />
      <Stats />
      <VideosSection />
      <PullQuotePhoto
        photo="quote"
        quote={
          <T
            ru={<>Эта информация и живое взаимодействие уже <em className="accent" style={{ fontSize: 'calc(clamp(28px,5vw,50px) * var(--hs))' }}>изменили жизнь</em> тысячам людей</>}
            en={<>This information, and the live interaction, has already <em className="accent" style={{ fontSize: 'calc(clamp(28px,5vw,50px) * var(--hs))' }}>changed the lives</em> of thousands of people</>}
          />
        }
      />
      <Reviews />
      <FormatList />
      <ClubSection />
      <PersonalSessionSection />
      <MentorshipSection />
      {showMastermind && <MastermindSection />}
      <ForeverYoungSection />
      <AwakeningQuote />
      <About />
      <Faq />
      <TelegramBand />
      <Contact />
      <Footer />
    </>
  );
}

/**
 * Одна страница сайта — та, что названа в `here`.
 *
 * Отсюда же её строит сборка: scripts/prerender.mjs вызывает этот компонент
 * для каждого адреса и кладёт результат в свой файл. Поэтому внутри не должно
 * быть ничего, что требует браузера: ни window, ни localStorage.
 */
export function Site({ here, onSetLang }: { here: Here; onSetLang?: (lang: Lang) => void }) {
  const route = here.route;
  const doc = route.kind === 'doc' ? legalDocs.find((d) => d.slug === route.slug) : undefined;

  return (
    <HereContext.Provider value={here}>
      <LangContext.Provider value={here.lang}>
        {doc ? (
          <LegalPage doc={doc} onSetLang={onSetLang ?? (() => {})} />
        ) : route.kind === 'service' ? (
          <ServicePage slug={route.slug} />
        ) : (
          <Landing />
        )}
      </LangContext.Provider>
    </HereContext.Provider>
  );
}

/**
 * Какая страница открыта. На сайте это путь в адресе; в превью — весь сайт
 * лежит одним файлом, и страницы в нём живут на «решётках» (`#/samadhi-club/`).
 */
function whereAreWe(): Here {
  if (previewMode && window.location.hash.startsWith('#/')) {
    return routeFromPath(window.location.hash.slice(2));
  }
  return routeFromPath(window.location.pathname);
}

function App() {
  const [here, setHere] = useState<Here>(whereAreWe);
  const [hash, setHash] = useState(() => window.location.hash);
  // Язык страницы задаёт её адрес. Отдельная память нужна только документам:
  // у них английского адреса нет, и язык интерфейса там переключается кнопкой.
  const [docLang, setDocLang] = useState<Lang>(() => {
    try {
      return (localStorage.getItem('ap_lang') as Lang) || here.lang;
    } catch {
      return here.lang;
    }
  });

  const lang = here.route.kind === 'doc' ? docLang : here.lang;

  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang);
    // lang читают поисковик и экранный диктор; data-lang нужен только стилям,
    // и оставить lang="ru" на английской странице — значит соврать обоим
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash);
      if (previewMode) setHere(whereAreWe());
    };
    const onPopState = () => setHere(whereAreWe());
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  /**
   * Старые ссылки вида `#/docs/oferta` разосланы и, может, уже где-то
   * сохранены. Теперь у документа есть настоящий адрес — уводим туда, чтобы и
   * человек, и поисковик оказались на странице с её собственным заголовком.
   */
  const redirected = useRef(false);
  useEffect(() => {
    const doc = findLegalDoc(hash);
    if (!doc || redirected.current || previewMode) return;
    redirected.current = true;
    window.location.replace(rootPrefix(routeFromPath(window.location.pathname)) + `docs/${doc.slug}/`);
  }, [hash]);

  // Холодная загрузка ссылки вида /#club приземляется наверху: раздела ещё нет,
  // когда браузер пытается к нему прыгнуть, а подгрузившиеся фотографии потом
  // всё равно его сдвигают. Прыгаем сами, и ещё раз — когда всё загрузилось.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id || window.location.hash.startsWith('#/')) return;
    const jump = () => document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
    jump();
    window.addEventListener('load', jump);
    return () => window.removeEventListener('load', jump);
  }, []);

  const handleSetLang = (l: Lang) => {
    setDocLang(l);
    try {
      localStorage.setItem('ap_lang', l);
    } catch {
      // ignore storage errors (private browsing, etc.)
    }
  };

  if (hash.startsWith('#/stats')) {
    return (
      <Suspense fallback={null}>
        <Dashboard />
      </Suspense>
    );
  }

  return <Site here={{ route: here.route, lang }} onSetLang={handleSetLang} />;
}

export default App;
