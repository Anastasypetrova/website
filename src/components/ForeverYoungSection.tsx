import { T } from '../i18n';
import { Photo } from './Photo';

/**
 * Пятый формат. Текст — целиком авторский, слово в слово; правлены только
 * опечатка и тире. Цены и ссылка на оплату ещё не заведены: блок сознательно
 * обходится без них, вместо того чтобы показывать выдуманные.
 */
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
                ru="Мой второй закрытый канал — о теле и заботе о нём, ведь это наш храм души. Уникальная информация о том, как через осознанный подход и присутствие в настоящем оставаться молодым — о том, как буквально обмануть время."
                en="My second private channel — about the body and caring for it, since it is the temple of the soul. Rare knowledge on staying young through a conscious approach and presence in the now: on how to genuinely outwit time."
              />
            </p>
            <div className="callout">
              <p>
                <T
                  ru="Потому что физическое и ментальное не могут существовать друг без друга, как две стороны одной медали."
                  en="Because the physical and the mental cannot exist without each other — two sides of one coin."
                />
              </p>
            </div>
            {/* Личное доказательство в конце: возраст и то, как она выглядит,
                убеждают сильнее любого перечисления тем. */}
            <p className="p">
              <T
                ru="Это мой личный опыт — тренировки, питание, биохакинг, красота, уход за телом и лицом. Всё, что помогает мне выглядеть на 10–15 лет моложе. Мне 38."
                en="This is my own experience — training, nutrition, biohacking, beauty, caring for the body and the face. Everything that helps me look 10 to 15 years younger. I am 38."
              />
            </p>
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
