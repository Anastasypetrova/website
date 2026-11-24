import { useState } from 'react';
import { T } from '../i18n';
import { trackClick } from '../api';

/**
 * Ролик под статьёй — обложкой, а не проигрывателем.
 *
 * Встроенный плеер YouTube тянет около полумегабайта и ставит свои куки ещё
 * до того, как человек нажал «играть». Сайт обходится без кук и без баннера
 * про них, и ломать это ради видео, которое посмотрит один из десяти, нельзя.
 *
 * Поэтому сначала картинка, и только по нажатию — настоящий плеер, с домена
 * youtube-nocookie.com. Нажатие человек делает сам, осознанно: это и есть
 * согласие, которого требует закон.
 */
export function VideoEmbed({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="vembed">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="vembed vembed-cover"
      onClick={() => {
        setPlaying(true);
        trackClick(`video:${id.slice(0, 8).toLowerCase().replace(/[^a-z0-9]/g, '')}1`, true);
      }}
      aria-label={`${title} — смотреть на YouTube`}
    >
      <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
      <span className="vembed-play" aria-hidden="true">▶</span>
      <span className="vembed-note">
        <T ru="Смотреть ролик" en="Watch the video" />
      </span>
    </button>
  );
}
