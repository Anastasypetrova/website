import { T } from '../i18n';
import { links } from '../content';
import { Photo } from './Photo';
import { ConsentGate } from './ConsentGate';

/**
 * Пятый формат. Текст — целиком авторский, слово в слово; правлены только
 * опечатка и тире. Цены и ссылка на оплату ещё не заведены: блок сознательно
 * обходится без них, вместо того чтобы показывать выдуманные.
 */
const includes: [string, string][] = [
  [
    'Живые эфиры с ответами на вопросы — питание, красота, спорт, нестарение',
    'Live sessions answering your questions on nutrition, beauty, training and staying young',
  ],
  ['Чат единомышленников', 'A chat of like-minded people'],
  [
    'Обмен уникальной информацией об осознанном отношении к телу',
    'Sharing rare knowledge on a conscious relationship with the body',
  ],
  ['Тренировки и практики', 'Workouts and practices'],
  ['Инструкции по красоте и здоровью', 'Beauty and health guides'],
];

export function ForeverYoungSection() {
  return (
    <section className="sec bg2" id="forever-young">
      <div className="wrap">
        <div className="prod-grid">
          <div className="prod-main">
            <span className="taglead"><T ru="Новый клуб по подписке" en="A new subscription club" /></span>
            <h2 className="dh dh2">Forever Young</h2>
            {/* Одним абзацем: обещание обмануть время и личное доказательство
                стоят в нём подряд, без паузы между ними. */}
            <p className="lede">
              <T
                ru="Мой второй закрытый канал — о теле и заботе о нём, ведь это наш храм души. Уникальная информация о том, как через осознанный подход и присутствие в настоящем оставаться молодым — о том, как буквально обмануть время. Это мой личный опыт — тренировки, питание, биохакинг, красота, уход за телом и лицом. Всё, что помогает мне выглядеть на 10–15 лет моложе. Мне 38."
                en="My second private channel — about the body and caring for it, since it is the temple of the soul. Rare knowledge on staying young through a conscious approach and presence in the now: on how to genuinely outwit time. This is my own experience — training, nutrition, biohacking, beauty, caring for the body and the face. Everything that helps me look 10 to 15 years younger. I am 38."
              />
            </p>
            {/* Плашкой — вывод, которым раздел закрывается. */}
            <div className="callout">
              <p>
                <T
                  ru="Потому что физическое и ментальное не могут существовать друг без друга, как две стороны одной медали."
                  en="Because the physical and the mental cannot exist without each other — two sides of one coin."
                />
              </p>
            </div>
            <div className="block">
              <span className="klabel"><T ru="Что включено в подписку" en="What the subscription includes" /></span>
              <div className="list" style={{ marginTop: 4 }}>
                {includes.map(([ru, en]) => (
                  <div className="li" key={ru}>
                    <span className="li-mk"></span>
                    <span><T ru={ru} en={en} /></span>
                  </div>
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

        {/* Ссылки на вступление ещё нет: пока её нет, кнопка остаётся на этом
            же разделе и никуда не уводит. Появится — впишется в
            links.foreverYoungJoin, и больше ничего менять не нужно. */}
        <div className="mm-cta">
          <ConsentGate
            href={links.foreverYoungJoin || '#forever-young'}
            product="forever-young"
            slugs={['oferta', 'disclaimer']}
            buttonStyle={{ width: 'auto', padding: '16px 28px' }}
          >
            <T ru="Присоединиться" en="Join" />
          </ConsentGate>
        </div>
      </div>
    </section>
  );
}
