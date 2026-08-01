#!/usr/bin/env python3
"""Turn the legal PDFs in public/docs into structured data for the on-site document pages.

The PDFs are Google-Docs exports: each visual line is drawn as several runs
(Cyrillic in one, Latin/digits/spaces in another), so a plain text extraction
glues words together. We therefore rebuild every line from individual glyph
positions, then group the lines into headings, paragraphs and list items.

    pip install pdfminer.six
    python3 scripts/extract-docs.py

Writes src/legalDocs.generated.ts. Re-run whenever a PDF is replaced.
"""

import json
import re
import subprocess
from pathlib import Path

from pdfminer.high_level import extract_pages
from pdfminer.layout import LAParams, LTChar

ROOT = Path(__file__).resolve().parent.parent
PDF_DIR = ROOT / 'public' / 'docs'
OUT = ROOT / 'src' / 'legalDocs.generated.ts'

# file stem -> url slug
SLUGS = {
    '1_Dogovor_publichnoy_oferty': 'oferta',
    '2_Politika_konfidentsialnosti': 'privacy',
    '3_Soglasie_na_obrabotku_personalnyh_dannyh': 'consent',
    '4_Politika_vozvrata_sredstv': 'refunds',
    '5_Disclaimer': 'disclaimer',
    '6_Cookie_Policy': 'cookies',
    '7_Usloviya_uchastiya_Samadhi_Club': 'club-terms',
}

BULLET = '●'
CLAUSE = re.compile(r'^\d+\.\d+')


def glyphs(node):
    if isinstance(node, LTChar):
        yield node
        return
    try:
        children = iter(node)
    except TypeError:
        return
    for child in children:
        yield from glyphs(child)


def read_lines(path):
    """Rebuild visual lines: cluster glyphs by text-matrix baseline, order by x."""
    lines = []
    for index, page in enumerate(extract_pages(str(path), laparams=LAParams())):
        chars = [(round(c.matrix[5], 1), c.x0, c.x1, c.get_text(), c.fontname)
                 for c in glyphs(page)]
        chars.sort(key=lambda c: (-c[0], c[1]))
        baseline = text = None
        last = None
        fonts = []

        def flush():
            if text and text.strip():
                lines.append({
                    'text': re.sub(r'\s+', ' ', text).strip(),
                    'bold': bool(fonts) and sum('Bold' in f for f in fonts) > len(fonts) * 0.6,
                    'page': index,
                    'baseline': baseline,
                })

        for y, x0, x1, ch, font in chars:
            if baseline is None or abs(y - baseline) > 3:
                flush()
                baseline, text, last, fonts = y, '', None, []
            # glyph runs carry no explicit spaces between words; a gap means a space
            if last is not None and x0 - last > 1.0 and not text.endswith(' ') and ch != ' ':
                text += ' '
            text += ch
            last = x1
            if ch.strip():
                fonts.append(font)
        flush()
    return lines


# Lines of one paragraph sit ~15.8pt apart; every paragraph or heading break is >22pt.
LINE_STEP = 18.0


def build(lines):
    """Group lines into a title, a revision note and a list of blocks."""
    title_parts = []
    i = 0
    while i < len(lines) and lines[i]['bold'] and not lines[i]['text'].startswith('Редакция'):
        title_parts.append(lines[i]['text'])
        i += 1
    title = ' '.join(title_parts)

    revision = ''
    if i < len(lines) and lines[i]['text'].startswith('Редакция'):
        revision = lines[i]['text']
        i += 1

    blocks = []
    for n, line in enumerate(lines[i:]):
        text = line['text']
        prev = lines[i + n - 1] if n else None

        if prev is None:
            wraps = False
        elif prev['page'] != line['page']:
            # across a page break there is no gap to measure: a paragraph only
            # continues when the previous page ended plainly mid-sentence.
            wraps = bool(re.search(r'[a-zа-яё,]$', prev['text']))
        else:
            wraps = prev['baseline'] - line['baseline'] <= LINE_STEP

        if line['bold']:
            blocks.append({'kind': 'h', 'text': text})
        elif text.startswith(BULLET):
            blocks.append({'kind': 'li', 'text': text[1:].strip()})
        elif wraps and blocks and blocks[-1]['kind'] in ('li', 'p') and not CLAUSE.match(text):
            joined = blocks[-1]['text']
            # a trailing hyphen is part of a compound word ("email-рассылок"), not a break
            blocks[-1]['text'] = joined + text if joined.endswith('-') else joined + ' ' + text
        else:
            blocks.append({'kind': 'p', 'text': text})

    return title, revision, blocks


def main():
    docs = []
    for pdf in sorted(PDF_DIR.glob('*.pdf')):
        slug = SLUGS.get(pdf.stem)
        if slug is None:
            raise SystemExit(f'no slug configured for {pdf.name}')
        title, revision, blocks = build(read_lines(pdf))
        docs.append({'slug': slug, 'file': pdf.name, 'title': title,
                     'revision': revision, 'blocks': blocks})
        print(f'{pdf.name}: "{title}" — {len(blocks)} blocks')

    body = json.dumps(docs, ensure_ascii=False, indent=2)
    OUT.write_text(
        '// Generated by scripts/extract-docs.py from public/docs/*.pdf — do not edit by hand.\n'
        "import type { LegalDoc } from './legal';\n\n"
        f'export const legalDocs: LegalDoc[] = {body};\n',
        encoding='utf-8',
    )
    print(f'wrote {OUT.relative_to(ROOT)}')
    subprocess.run(['npx', 'prettier', '--write', str(OUT)], cwd=ROOT, check=False,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


if __name__ == '__main__':
    main()
