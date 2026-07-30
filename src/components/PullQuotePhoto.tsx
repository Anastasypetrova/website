import type { ReactNode } from 'react';
import { ImagePlaceholder } from './ImagePlaceholder';

interface Props {
  quote: ReactNode;
  id?: string;
  objectPosition?: string;
}

export function PullQuotePhoto({ quote, id }: Props) {
  return (
    <section className="sec pullphoto" id={id}>
      <div className="pullphoto-bg">
        <ImagePlaceholder label="Фоновое фото" />
      </div>
      <div className="pullphoto-sc"></div>
      <div className="wrap-n pull">
        <div className="q">{quote}</div>
        <div className="qa">Анастасия Петрова</div>
      </div>
    </section>
  );
}
