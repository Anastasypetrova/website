import { T } from '../i18n';
import { docHref } from '../content';

/**
 * Предупреждение о характере услуг.
 *
 * То же самое написано в Дисклеймере, но документ по ссылке читают единицы, а
 * прочитать это стоит каждому. Стоит после всех форматов работы — там, где
 * человек уже выбрал, и до того, как он напишет.
 *
 * Намеренно без красного цвета, капса и восклицательных знаков: спокойно
 * набранное предупреждение читается как «человек знает границы своей работы»,
 * кричащая плашка — как реклама, которая чего-то боится.
 */
export function Disclaimer() {
  return (
    <section className="sec-s bg1">
      <div className="wrap">
        <div className="disclaimer">
          <span className="klabel"><T ru="Важно" en="Important" /></span>
          <p>
            <T
              ru={
                <>
                  Форматы работы предназначены для людей, не имеющих диагностированных
                  психических расстройств, и не являются заменой профессиональной
                  медицинской или психотерапевтической помощи. Подробнее — в{' '}
                  <a href={docHref('disclaimer')}>Дисклеймере</a>.
                </>
              }
              en={
                <>
                  These formats are intended for people without diagnosed mental health
                  conditions and are not a substitute for professional medical or
                  psychotherapeutic care. More in the{' '}
                  <a href={docHref('disclaimer')}>Disclaimer</a>.
                </>
              }
            />
          </p>
        </div>
      </div>
    </section>
  );
}
