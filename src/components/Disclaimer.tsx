import { T } from '../i18n';
import { docHref } from '../content';

/**
 * Предупреждение о характере услуг.
 *
 * То же самое написано в Дисклеймере, но документ по ссылке читают единицы, а
 * прочитать это стоит каждому. Стоит под списком форматов — там, где человек
 * ещё выбирает.
 *
 * Набрано капсом гротеском в терракоте — тем же приёмом, которым на этом
 * сайте выделены утверждения в разделе «Обо мне». Заметно, но не чужеродно:
 * красная плашка с восклицательными знаками читалась бы как реклама, которая
 * чего-то боится.
 */
export function Disclaimer() {
  return (
    <div className="disclaimer">
      <p className="disclaimer-main">
        <T
          ru="Форматы работы предназначены для людей, не имеющих диагностированных психических расстройств, и не являются заменой профессиональной медицинской или психотерапевтической помощи."
          en="These formats are intended for people without diagnosed mental health conditions and are not a substitute for professional medical or psychotherapeutic care."
        />
      </p>
      <p className="disclaimer-more">
        <T
          ru={<>Подробнее — в <a href={docHref('disclaimer')}>Дисклеймере</a>.</>}
          en={<>More in the <a href={docHref('disclaimer')}>Disclaimer</a>.</>}
        />
      </p>
    </div>
  );
}
