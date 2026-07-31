/**
 * Photo registry.
 *
 * Drop image files into `src/photos/` named after the keys below — any common
 * extension works (.jpg, .jpeg, .png, .webp, .avif). Vite picks them up at
 * build time, optimises them and adds cache-busting hashes.
 *
 * A slot with no matching file falls back to a neutral placeholder, so the
 * site stays presentable while photos are still being chosen.
 */
const files = import.meta.glob('./photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const byName: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const base = path.split('/').pop()!.replace(/\.[^.]+$/, '').toLowerCase();
  byName[base] = url;
}

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

export function photoUrl(key: PhotoKey): string | undefined {
  return byName[key];
}
