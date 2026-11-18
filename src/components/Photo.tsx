import { useLang } from '../i18n';
import { photoUrl, type PhotoKey } from '../photos';
import { ImagePlaceholder } from './ImagePlaceholder';

/** Описание снимка. Два языка там, где описание осмысленное: на английской
 *  странице русский alt читает вслух только экранный диктор, и неправильно. */
export type Alt = string | { ru: string; en: string };

interface Props {
  name: PhotoKey;
  alt: Alt;
  /** CSS object-position, e.g. 'center 30%' — use to keep the subject in frame when cropped. */
  objectPosition?: string;
  /** Set on the hero, which is above the fold and should not wait to load. */
  priority?: boolean;
}

/** Fills its positioned parent with a photo, or a placeholder when none is present yet. */
export function Photo({ name, alt, objectPosition, priority = false }: Props) {
  const lang = useLang();
  const text = typeof alt === 'string' ? alt : alt[lang];
  const src = photoUrl(name);
  if (!src) return <ImagePlaceholder label={text} />;
  return (
    <img
      className="photo-fill"
      src={src}
      alt={text}
      style={{ objectPosition }}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
    />
  );
}
