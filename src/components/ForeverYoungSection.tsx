import { T } from '../i18n';
import { Photo } from './Photo';

/**
 * Пятый формат. Цены и ссылка на оплату ещё не заведены — блок сознательно
 * обходится без них, вместо того чтобы показывать выдуманные: как только
 * появятся, сюда встают карточка стоимости и кнопка, как в Samadhi Club.
 */
const chips: [string, string][] = [
  ['Нестарение', 'Staying young'],
  ['Тело', 'The body'],
  ['Спорт', 'Training'],
  ['Массажи', 'Massage'],
  ['Красота', 'Beauty'],
  ['Питание', 'Nutrition'],
];

export function ForeverYoungSection() {
  return (
    <section className="sec bg2" id="forever-young">
      <div className="wrap">
        <div className="prod-grid">
          <div className="prod-main">
            <span className="taglead"><T ru="Новый клуб по подписке" en="A new subscription club" /></span>
            <h2 className="dh dh2">Forever Young</h2>
            <p className="lede">
              <T
                ru="Канал о том, как обмануть время. Про нестарение и заботу о теле: спорт, массажи, красота, питание."
                en="A channel about outwitting time. On staying young and caring for the body: training, massage, beauty, nutrition."
              />
            </p>
            {/* Её же фраза, и она здесь главная: именно она объясняет, почему
                этот клуб стоит рядом с Samadhi Club, а не вместо него. */}
            <div className="callout">
              <p>
                <T
                  ru="Потому что без физики нет менталки, и наоборот."
                  en="Because there is no mental work without the physical, and none the other way round."
                />
              </p>
            </div>
            <div className="block">
              <span className="klabel"><T ru="О чём канал" en="What the channel covers" /></span>
              <div className="chips">
                {chips.map(([ru, en]) => (
                  <span className="chip" key={ru}><T ru={ru} en={en} /></span>
                ))}
              </div>
            </div>
          </div>
          <div className="prod-right">
            <div className="prod-photo">
              <Photo name="foreveryoung" alt="Forever Young" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
