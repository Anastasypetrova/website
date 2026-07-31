import type { ReactNode } from 'react';
import { Photo } from './Photo';
import type { PhotoKey } from '../photos';

interface Props {
  quote: ReactNode;
  photo: PhotoKey;
  id?: string;
  objectPosition?: string;
}

export function PullQuotePhoto({ quote, photo, id, objectPosition }: Props) {
  return (
    <section className="sec pullphoto" id={id}>
      <div className="pullphoto-bg">
        <Photo name={photo} alt="" objectPosition={objectPosition ?? 'center 30%'} />
      </div>
      <div className="pullphoto-sc"></div>
      <div className="wrap-n pull">
        <div className="q">{quote}</div>
        <div className="qa">Анастасия Петрова</div>
      </div>
    </section>
  );
}
