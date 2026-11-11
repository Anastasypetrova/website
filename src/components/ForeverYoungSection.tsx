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
                ru="Мой второй закрытый канал — о теле и о том, как обмануть время. Двигаться, восстанавливаться, ухаживать за собой и питаться так, чтобы годы были к вам добры."
                en="My second private channel — about the body, and about outwitting time. Moving, recovering, caring for yourself and eating in a way that keeps the years kind to you."
              />
            </p>
            {/* Её же фраза, и она здесь главная: именно она объясняет, почему
                этот клуб стоит рядом с Samadhi Club, а не вместо него. */}
            <div className="callout">
              <p>
                <T
                  ru="Потому что физическое и ментальное не могут существовать друг без друга, как две стороны одной медали."
                  en="Because the physical and the mental cannot exist without each other — two sides of one coin."
                />
              </p>
            </div>
            <p className="p">
              <T
                ru="Samadhi Club — про внимание и состояние. Forever Young — про тот храм, в котором они живут."
                en="Samadhi Club is about attention and state. Forever Young is about the temple they live in."
              />
            </p>
            <div className="block">
              <span className="klabel"><T ru="О чём канал" en="What the channel covers" /></span>
              <div className="chips">
                {chips.map(([ru, en]) => (
                  <span className="chip" key={ru}><T ru={ru} en={en} /></span>
                ))}
              </div>
            </div>
            <div className="pricerow">
              <div className="pricebox">
                <span className="klabel"><T ru="Вход сейчас" en="Entry today" /></span>
                <div className="price" style={{ marginTop: 8, fontFamily: 'var(--font-grotesk)', fontWeight: 100 }}>
                  <T ru="300 ₽" en="300 RUB" />
                </div>
                <p className="card-note">
                  <T
                    ru="Для новых участников цена будет расти каждый месяц."
                    en="For new members the price will rise every month."
                  />
                </p>
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
