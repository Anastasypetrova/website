import { T, useLang } from '../i18n';
import { useHref } from '../router';
import { HOME, findService, type ServiceSlug } from '../routes';
import { Nav } from './Nav';
import { ClubSection } from './ClubSection';
import { PersonalSessionSection } from './PersonalSessionSection';
import { MentorshipSection } from './MentorshipSection';
import { MastermindSection } from './MastermindSection';
import { ForeverYoungSection } from './ForeverYoungSection';
import { Reviews } from './Reviews';
import { Faq } from './Faq';
import { TelegramBand } from './TelegramBand';
import { Contact } from './Contact';
import { Footer } from './Footer';

/**
 * Страница одного формата.
 *
 * Раньше у сайта был ровно один адрес, и бороться в выдаче он мог только за
 * запросы с именем. Теперь у каждого формата свой адрес, свой заголовок, своё
 * описание и своя цена в разметке — то есть своё место, за которое он может
 * бороться: «клуб по подписке», «личная консультация», «менторство».
 *
 * Текст тот же самый, что в разделе на главной: он написан один раз и живёт в
 * одном месте. Отличается обрамление — заголовок первого уровня, хлебные
 * крошки и вопросы, которые задают перед оплатой.
 */
export function ServicePage({ slug }: { slug: ServiceSlug }) {
  const lang = useLang();
  const href = useHref();
  const def = findService(slug);

  return (
    <>
      <Nav solid />
      <main className="svc">
        <nav className="crumbs" aria-label={lang === 'en' ? 'Breadcrumb' : 'Навигация по сайту'}>
          <div className="wrap">
            <a href={href(HOME)}><T ru="Главная" en="Home" /></a>
            <span className="crumbs-sep" aria-hidden="true">/</span>
            <span className="crumbs-here">{def ? def.name[lang] : slug}</span>
          </div>
        </nav>

        {slug === 'samadhi-club' && <ClubSection lead />}
        {slug === 'consultation' && <PersonalSessionSection lead />}
        {slug === 'mentorship' && <MentorshipSection lead />}
        {slug === 'mastermind' && <MastermindSection lead />}
        {slug === 'forever-young' && <ForeverYoungSection lead />}

        {/* Отзывы — про клуб, поэтому стоят только на его странице. */}
        {slug === 'samadhi-club' && <Reviews />}

        <Faq />
      </main>
      <TelegramBand />
      <Contact />
      <Footer />
    </>
  );
}
