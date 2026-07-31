import { photoUrl, type PhotoKey } from '../photos';
import { ImagePlaceholder } from './ImagePlaceholder';

interface Props {
  name: PhotoKey;
  alt: string;
  /** CSS object-position, e.g. 'center 30%' — use to keep the subject in frame when cropped. */
  objectPosition?: string;
}

/** Fills its positioned parent with a photo, or a placeholder when none is present yet. */
export function Photo({ name, alt, objectPosition }: Props) {
  const src = photoUrl(name);
  if (!src) return <ImagePlaceholder label={alt} />;
  return <img className="photo-fill" src={src} alt={alt} style={{ objectPosition }} />;
}
