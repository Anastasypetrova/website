import { photoUrl, type PhotoKey } from '../photos';
import { ImagePlaceholder } from './ImagePlaceholder';

interface Props {
  name: PhotoKey;
  alt: string;
  /** CSS object-position, e.g. 'center 30%' — use to keep the subject in frame when cropped. */
  objectPosition?: string;
  /** Set on the hero, which is above the fold and should not wait to load. */
  priority?: boolean;
}

/** Fills its positioned parent with a photo, or a placeholder when none is present yet. */
export function Photo({ name, alt, objectPosition, priority = false }: Props) {
  const src = photoUrl(name);
  if (!src) return <ImagePlaceholder label={alt} />;
  return (
    <img
      className="photo-fill"
      src={src}
      alt={alt}
      style={{ objectPosition }}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
    />
  );
}
