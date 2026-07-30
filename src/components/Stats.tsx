import { T } from '../i18n';

export function Stats() {
  return (
    <section className="sec-s bg2">
      <div className="wrap">
        <div className="stats">
          <div>
            <div className="stat-n">15<span className="stat-sup">+</span></div>
            <div className="stat-l"><T ru="лет в духовных практиках" en="years in spiritual practice" /></div>
          </div>
          <div>
            <div className="stat-n">50<span className="stat-sup">+</span></div>
            <div className="stat-l"><T ru="стран на моем пути" en="countries on my path" /></div>
          </div>
          <div>
            <div className="stat-n"><T ru="млн" en="mln" /></div>
            <div className="stat-l"><T ru="просмотров на YouTube" en="views on YouTube" /></div>
          </div>
          <div>
            <div className="stat-n"><T ru="тысячи" en="thousands" /></div>
            <div className="stat-l"><T ru="людей, которым я помогла" en="of people I've helped" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
