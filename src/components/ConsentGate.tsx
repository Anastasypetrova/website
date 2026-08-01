import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import { T } from '../i18n';
import { docHref, docs } from '../content';
import { legalDocs } from '../legal';

/**
 * Records that this visitor accepted a specific revision of specific documents
 * before being handed to the payment flow.
 *
 * The site is static, so this is a local trace only — good enough to gate the
 * button, not good enough to prove anything later. The real record has to be
 * written where the person is identified, i.e. the Telegram bot: user id,
 * timestamp and document revision. When the bot exists, POST this payload to it
 * (or pass `payload.ref` through to Tribute and let the bot pick it up).
 */
function recordConsent(product: string, slugs: string[]) {
  const payload = {
    product,
    at: new Date().toISOString(),
    documents: slugs.map((slug) => ({
      slug,
      // pin the revision: "accepted the offer" is worthless a year from now if
      // nobody can say which wording was accepted
      revision: legalDocs.find((d) => d.slug === slug)?.revision ?? '',
    })),
  };
  try {
    const log = JSON.parse(localStorage.getItem('ap_consent') || '[]');
    log.push(payload);
    localStorage.setItem('ap_consent', JSON.stringify(log.slice(-20)));
  } catch {
    // private browsing or a full quota — never block the purchase over this
  }
  return payload;
}

interface Props {
  /** Where the buyer goes once they have accepted. */
  href: string;
  /** Which documents they are accepting, by slug. */
  slugs: string[];
  /** Identifies the purchase in the consent record. */
  product: string;
  children: ReactNode;
  style?: CSSProperties;
}

/** A call-to-action that stays locked until the documents are accepted. */
export function ConsentGate({ href, slugs, product, children, style }: Props) {
  const [agreed, setAgreed] = useState(false);
  const [nudge, setNudge] = useState(false);
  const id = useId();

  const labels = slugs.map((slug) => docs.find((d) => d.slug === slug)).filter((d) => d !== undefined);

  const link = (
    <>
      {labels.map((d, i) => (
        <span key={d.slug}>
          {i > 0 && (i === labels.length - 1 ? <T ru=" и " en=" and " /> : ', ')}
          <a href={docHref(d.slug)}><T ru={d.label.ru} en={d.label.en} /></a>
        </span>
      ))}
    </>
  );

  return (
    <div className="consent-wrap">
      <label className={`consent ${nudge ? 'consent-nudge' : ''}`} htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={agreed}
          onChange={(e) => {
            setAgreed(e.target.checked);
            setNudge(false);
          }}
        />
        <span className="consent-text">
          <T ru={<>Я ознакомлен(а) и принимаю {link}</>} en={<>I have read and accept the {link}</>} />
        </span>
      </label>
      <a
        className={`btn-onsage ${agreed ? '' : 'is-locked'}`}
        href={href}
        target="_blank"
        rel="noopener"
        aria-disabled={!agreed}
        style={style}
        onClick={(e) => {
          if (!agreed) {
            e.preventDefault();
            setNudge(true);
            return;
          }
          recordConsent(product, slugs);
        }}
      >
        {children}
      </a>
    </div>
  );
}
