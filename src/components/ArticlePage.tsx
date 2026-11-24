import { T, useLang } from '../i18n';
import { useHref } from '../router';
import { HOME, findService } from '../routes';
import { findArticle, readingMinutes, type Article } from '../articles';
import { Nav } from './Nav';
import { VideoEmbed } from './VideoEmbed';
import { Contact } from './Contact';
import { Footer } from './Footer';

const dateLabel = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

/** Идущие подряд пункты — один список, остальное стоит само по себе. */
type Rendered = Article['blocks'][number] | { kind: 'ul'; items: string[] };

function group(blocks: Article['blocks']): Rendered[] {
  const out: Rendered[] = [];
  for (const block of blocks) {
    const last = out[out.length - 1];
    if (block.kind === 'li' && last && last.kind === 'ul') last.items.push(block.text);
    else if (block.kind === 'li') out.push({ kind: 'ul', items: [block.text] });
    else out.push(block);
  }
  return out;
}

/**
 * Статья.
 *
 * Порядок на странице не случайный: заголовок — вопрос, следом ответ целиком,
 * и только потом разбор. Человек пришёл из поиска за ответом, а не за
 * подводкой; кто захочет разобраться — дочитает. Ролик, из которого выросла
 * статья, стоит под текстом, а не над ним: читать быстрее, чем смотреть.
 */
export function ArticlePage({ slug }: { slug: string }) {
  const href = useHref();
  const lang = useLang();
  const article = findArticle(slug);
  if (!article) return null;

  const service = article.cta ? findService(article.cta === 'consultation' ? 'consultation' : article.cta) : undefined;

  return (
    <>
      <Nav solid />
      <main className="svc">
        <nav className="crumbs" aria-label={lang === 'en' ? 'Breadcrumb' : 'Навигация по сайту'}>
          <div className="wrap">
            <a href={href(HOME)}><T ru="Главная" en="Home" /></a>
            <span className="crumbs-sep" aria-hidden="true">/</span>
            <a href={href({ kind: 'blog' })}><T ru="Статьи" en="Articles" /></a>
            <span className="crumbs-sep" aria-hidden="true">/</span>
            <span className="crumbs-here">{article.title}</span>
          </div>
        </nav>

        <article className="sec bg1 post">
          <div className="wrap post-in">
            <h1 className="dh dh2 post-h">{article.title}</h1>
            <p className="post-meta">
              {dateLabel(article.date)} · {readingMinutes(article)} мин чтения
              {article.updated && article.updated !== article.date
                ? ` · обновлено ${dateLabel(article.updated)}`
                : ''}
            </p>

            <p className="post-lead">{article.lead}</p>

            <div className="post-body">
              {group(article.blocks).map((block, i) =>
                block.kind === 'h' ? (
                  <h2 key={i}>{block.text}</h2>
                ) : block.kind === 'quote' ? (
                  <blockquote key={i}>{block.text}</blockquote>
                ) : block.kind === 'ul' ? (
                  <ul key={i}>
                    {block.items.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                ) : (
                  <p key={i}>{block.text}</p>
                ),
              )}
            </div>

            {article.video ? (
              <div className="post-video">
                <span className="klabel"><T ru="Ролик, из которого выросла статья" en="The video this grew from" /></span>
                <VideoEmbed id={article.video} title={article.title} />
              </div>
            ) : null}

            {service ? (
              <aside className="post-cta">
                <p>
                  Разбираем это подробно и на живых примерах — в разделе{' '}
                  <a href={href({ kind: 'service', slug: service.slug })}>{service.name.ru}</a>.
                </p>
              </aside>
            ) : null}

            <a className="post-back" href={href({ kind: 'blog' })}>
              <T ru="← Все статьи" en="← All articles" />
            </a>
          </div>
        </article>
      </main>
      <Contact />
      <Footer />
    </>
  );
}
