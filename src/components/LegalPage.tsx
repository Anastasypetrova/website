import { T, useLang, type Lang } from '../i18n';
import { docs, docHref, links } from '../content';
import type { LegalBlock, LegalDoc } from '../legal';

/** Consecutive bullets become one list; everything else stays a standalone block. */
function groupBlocks(blocks: LegalBlock[]): (LegalBlock | { kind: 'ul'; items: string[] })[] {
  const out: (LegalBlock | { kind: 'ul'; items: string[] })[] = [];
  for (const block of blocks) {
    const last = out[out.length - 1];
    if (block.kind === 'li' && last && last.kind === 'ul') last.items.push(block.text);
    else if (block.kind === 'li') out.push({ kind: 'ul', items: [block.text] });
    else out.push(block);
  }
  return out;
}

interface Props {
  doc: LegalDoc;
  onSetLang: (lang: Lang) => void;
}

export function LegalPage({ doc, onSetLang }: Props) {
  const lang = useLang();
  const label = docs.find((d) => d.slug === doc.slug)?.label;

  return (
    <>
      <header className="legal-top">
        <div className="legal-top-in">
          <a className="logo" href="#top">Анастасия Петрова</a>
          <div className="legal-top-right">
            <a className="legal-back" href="#top">
              <T ru="← На главную" en="← Back to the site" />
            </a>
            <div className="langsw">
              <button className={`lang-btn ${lang === 'ru' ? 'active' : ''}`} onClick={() => onSetLang('ru')}>RU</button>
              <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => onSetLang('en')}>EN</button>
            </div>
          </div>
        </div>
      </header>

      <main className="legal">
        <article className="legal-doc">
          <span className="eyebrow"><T ru="Документы" en="Documents" /></span>
          <h1 className="legal-h1">{label ? <T ru={doc.title} en={label.en} /> : doc.title}</h1>
          <p className="legal-rev">{doc.revision}</p>

          {/* `.tr-en` is display:contents, so the styled box has to be a child of it */}
          <div className="tr-en">
            <p className="legal-note">
              The legal documents are published in Russian, the language they are legally
              binding in. The original Russian text follows.
            </p>
          </div>

          <div className="legal-body">
            {groupBlocks(doc.blocks).map((block, i) =>
              block.kind === 'h' ? (
                <h2 className="legal-h2" key={i}>{block.text}</h2>
              ) : block.kind === 'ul' ? (
                <ul className="legal-ul" key={i}>
                  {block.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              ) : (
                <p className="legal-p" key={i}>{block.text}</p>
              ),
            )}
          </div>

          <div className="legal-actions">
            <a className="legal-pdf" href={`docs/${doc.file}`} target="_blank" rel="noopener">
              <T ru="Скачать PDF" en="Download PDF" />
            </a>
            <a className="legal-mail" href={`mailto:${links.email}`}>{links.email}</a>
          </div>
        </article>

        <nav className="legal-other">
          <span className="legal-other-h"><T ru="Другие документы" en="Other documents" /></span>
          <div className="legal-other-list">
            {docs
              .filter((d) => d.slug !== doc.slug)
              .map((d) => (
                <a className="legal-other-link" href={docHref(d.slug)} key={d.slug}>
                  <T ru={d.label.ru} en={d.label.en} />
                </a>
              ))}
          </div>
        </nav>
      </main>

      <div className="legal-foot">
        <span><T ru="© 2026 Анастасия Петрова. Все права защищены." en="© 2026 Anastasia Petrova. All rights reserved." /></span>
        <a href="#top"><T ru="Вернуться на сайт" en="Back to the site" /></a>
      </div>
    </>
  );
}
