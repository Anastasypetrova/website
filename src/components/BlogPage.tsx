import { T, useLang } from '../i18n';
import { useHref } from '../router';
import { HOME } from '../routes';
import { articlesByDate, readingMinutes } from '../articles';
import { Nav } from './Nav';
import { Contact } from './Contact';
import { Footer } from './Footer';

const dateLabel = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

/** Список статей. Ничего, кроме списка: это оглавление, а не витрина. */
export function BlogPage() {
  const href = useHref();
  const lang = useLang();
  const posts = articlesByDate();

  return (
    <>
      <Nav solid />
      <main className="svc">
        <nav className="crumbs" aria-label={lang === 'en' ? 'Breadcrumb' : 'Навигация по сайту'}>
          <div className="wrap">
            <a href={href(HOME)}><T ru="Главная" en="Home" /></a>
            <span className="crumbs-sep" aria-hidden="true">/</span>
            <span className="crumbs-here"><T ru="Статьи" en="Articles" /></span>
          </div>
        </nav>

        <section className="sec bg1" id="blog">
          <div className="wrap">
            <span className="eyebrow"><T ru="тексты" en="writing" /></span>
            <h1 className="dh dh2" style={{ marginTop: 14, maxWidth: '18ch' }}>
              <T ru="Статьи" en="Articles" />
            </h1>
            <p className="lede" style={{ maxWidth: '62ch', marginTop: 18 }}>
              <T
                ru="То, о чём я говорю в эфирах и роликах, — текстом. Можно прочитать за пять минут вместо часа."
                en="What I talk about in live sessions and videos, as text. Five minutes to read instead of an hour."
              />
            </p>

            <div className="postlist">
              {posts.map((post) => (
                <a className="postrow" href={href({ kind: 'article', slug: post.slug })} key={post.slug}>
                  <span className="postrow-main">
                    <span className="postrow-t">{post.title}</span>
                    <span className="postrow-l">{post.lead}</span>
                  </span>
                  <span className="postrow-m">
                    {dateLabel(post.date)} · {readingMinutes(post)} мин
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Contact />
      <Footer />
    </>
  );
}
