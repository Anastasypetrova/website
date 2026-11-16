import { T } from '../i18n';
import { foreverYoungPrice, links } from '../content';
import { Photo } from './Photo';
import { ConsentGate } from './ConsentGate';

/**
 * Пятый формат. Текст — целиком авторский, слово в слово; правлены только
 * тире и заглавные, которыми в переписке выделяют голосом, а на странице
 * выделяет вёрстка. Цена и срок ещё не объявлены: блок сознательно обходится
 * без них, вместо того чтобы показывать выдуманные.
 *
 * Порядок как в клубе: сверху — о чём канал и доказательство, ниже во всю
 * ширину — что входит в подписку, и только потом кнопка. Сначала человек
 * понимает, потом платит.
 */
const includes: [string, string][] = [
  ['Живые эфиры с ответами на вопросы', 'Live sessions answering your questions'],
  ['Ритуалы ухода', 'Care rituals'],
  ['Телесные практики исцеления тела', 'Body practices for healing'],
  ['Биохакинг', 'Biohacking'],
  ['Мои тренировки', 'My workouts'],
  ['Средства красоты', 'Beauty products'],
  ['Масла, массаж, баня и восстановление', 'Oils, massage, sauna and recovery'],
  ['Честные разборы', 'Honest reviews'],
];

export function ForeverYoungSection() {
  return (
    <section className="sec bg2" id="forever-young">
      <div className="wrap">
        <div className="prod-grid">
          <div className="prod-main">
            <span className="taglead"><T ru="Новый клуб по подписке" en="A new subscription club" /></span>
            <h2 className="dh dh2">Forever Young</h2>
            {/* Первая фраза — обещание, вторая — доказательство. Дальше можно
                не читать и всё равно понять, о чём канал. */}
            <p className="lede">
              <T
                ru="Этот канал о том, как обмануть время. О теле и заботе о нём."
                en="This channel is about outwitting time. About the body and caring for it."
              />
            </p>
            <p className="p">
              <T
                ru="Мне 38, и никто не даёт мне мой возраст. Канал Forever Young — мой личный опыт: тренировки, питание, биохакинг, красота, уход за телом и лицом. Всё, что помогает мне выглядеть на 10–15 лет моложе."
                en="I am 38, and nobody ever guesses it. Forever Young is my own experience: training, nutrition, biohacking, beauty, caring for the body and the face. Everything that helps me look 10 to 15 years younger."
              />
            </p>
            <p className="p">
              <T
                ru="Здесь я буду говорить об уходе за телом и о его исцелении. Тело умеет восстанавливаться само, и это нормально: кожа обновляется, ткани заживают, и часто ему не нужны ни таблетки, ни добавки. Наша задача — не мешать."
                en="Here I will talk about caring for the body and about healing it. The body knows how to recover on its own, and that is normal: skin renews itself, tissue heals, and often it needs neither pills nor supplements. Our job is to stay out of its way."
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
          </div>
          <div className="prod-right">
            <div className="prod-photo">
              <Photo name="foreveryoung" alt="Forever Young" />
            </div>
          </div>
        </div>

        <div className="club-stack">
          <div className="mm-card">
            <span className="klabel"><T ru="Что включено в подписку" en="What the subscription includes" /></span>
            <div className="list list-2col" style={{ marginTop: 16 }}>
              {includes.map(([ru, en]) => (
                <div className="li" key={ru}>
                  <span className="li-mk"></span>
                  <span><T ru={ru} en={en} /></span>
                </div>
              ))}
            </div>
            <p className="card-note card-note-lead">
              <T
                ru="Но самое крутое — сообщество, которое делится своими лайфхаками о том, как долгие годы оставаться молодым."
                en="But the best part is the community, sharing what keeps them young year after year."
              />
            </p>
          </div>

          {/* Цена здесь — аргумент, а не формальность: она низкая именно сейчас,
              и об этом сказано прямо, без «успейте» и прочего понукания. */}
          <div className="mm-card fy-price">
            <div className="fy-price-row">
              <span className="klabel"><T ru="Стоимость подписки" en="Subscription" /></span>
              <span className="fy-price-v">
                {foreverYoungPrice.eur} €
                <span className="fy-price-per"><T ru="в месяц" en="a month" /></span>
              </span>
            </div>
            <p className="finep">
              <T
                ru="Это почти донат. Канал только наполняется, и по мере того как он растёт, цена будет расти для новых участников. Оплата и продление — через Tribute, из любой страны; отменить продление можно в любой момент."
                en="Almost a donation. The channel is only filling up, and as it grows the price will rise for new members. Payment and renewal run through Tribute, from any country; renewal can be cancelled at any time."
              />
            </p>
          </div>

          {/* Своими словами о том, чего в подписке нет: честность здесь
              продаёт лучше обещаний, да и дисклеймер сайта говорит то же. */}
          <p className="fy-honest">
            <T
              ru="Я не врач и не косметолог. Но я выгляжу и чувствую себя намного лучше, чем десять лет назад, — и это может каждый. Делюсь только тем, что проверила на себе."
              en="I am not a doctor or a cosmetologist. But I look and feel far better than I did ten years ago — and anyone can. I share only what I have tested on myself."
            />
          </p>

          <div className="mm-cta">
            <ConsentGate
              href={links.foreverYoungJoin}
              product="forever-young"
              slugs={['oferta', 'disclaimer']}
            secondary={
              <a className="btn-outline" href={links.reviewsChannel} target="_blank" rel="noopener">
                <T ru="Отзывы" en="Reviews" />
              </a>
            }
            >
              <T ru="Присоединиться" en="Join" />
            </ConsentGate>
          </div>
        </div>
      </div>
    </section>
  );
}
