export type LegalBlock = {
  kind: 'h' | 'p' | 'li';
  text: string;
};

export type LegalDoc = {
  slug: string;
  file: string;
  title: string;
  revision: string;
  blocks: LegalBlock[];
};

import { legalDocs } from './legalDocs.generated';

export { legalDocs };

/** Resolve a `#/docs/<slug>` hash to its document, or undefined for the landing page. */
export function findLegalDoc(hash: string): LegalDoc | undefined {
  const match = /^#\/docs\/([\w-]+)$/.exec(hash);
  return match ? legalDocs.find((d) => d.slug === match[1]) : undefined;
}
