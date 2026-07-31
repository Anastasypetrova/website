/**
 * Photo registry.
 *
 * Drop image files into `src/photos/` — any common extension works
 * (.jpg, .jpeg, .png, .webp, .avif). Vite picks them up at build time,
 * optimises them and adds cache-busting hashes.
 *
 * Files are matched either by slot name (`hero.jpg`) or by the original
 * filename used in the design handoff, so the handoff's `uploads/` folder
 * can be copied in as-is and every photo lands where the design put it.
 *
 * A slot with no matching file falls back to a neutral placeholder.
 */
const files = import.meta.glob('./photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export type PhotoKey =
  | 'hero'
  | 'about'
  | 'club'
  | 'consultation'
  | 'mentorship'
  | 'mastermind'
  | 'quote'
  | 'telegram'
  | 'contacts';

/** Original filenames from the design handoff, mapped to the slot each one filled. */
const HANDOFF_NAMES: Record<string, PhotoKey> = {
  '08574D3F-D1FC-4601-B58F-29C6FAABA71A': 'hero',
  '9EB2E130-279C-44D5-899C-63C4AB6D6BE4 2': 'quote',
  'ChatGPT Image Jul 23, 2026, 04_17_32 PM': 'club',
  'ChatGPT Image Jul 23, 2026, 04_19_50 PM': 'consultation',
  'ChatGPT Image Jul 31, 2026, 07_54_09 PM': 'consultation',
  '93A7FE90-DC1C-4ACE-A530-DA2E72B35AF9': 'mentorship',
  'ChatGPT Image Jul 24, 2026, 10_24_00 AM': 'mastermind',
  IMG_3101: 'about',
  'PHOTO-2026-07-27-15-34-17 2': 'telegram',
};

/** Lowercase and strip punctuation so spaces, commas and case never break a match. */
function normalise(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const aliases = new Map<string, PhotoKey>();
for (const [filename, slot] of Object.entries(HANDOFF_NAMES)) {
  aliases.set(normalise(filename), slot);
}

const bySlot: Partial<Record<PhotoKey, string>> = {};
for (const [path, url] of Object.entries(files)) {
  const base = path.split('/').pop()!.replace(/\.[^.]+$/, '');
  const key = normalise(base);
  const slot = aliases.get(key) ?? (key as PhotoKey);
  // A file named after the slot itself wins over one named after the handoff file.
  if (!bySlot[slot] || key === slot) bySlot[slot] = url;
}

export function photoUrl(key: PhotoKey): string | undefined {
  return bySlot[key];
}
