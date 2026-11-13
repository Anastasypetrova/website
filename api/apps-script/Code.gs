/**
 * Contact database for anastasia-samadhi.club.
 *
 * Paste into the Apps Script editor of the Google Sheet that should hold the
 * contacts (Extensions -> Apps Script), set SECRET below, then Deploy -> New
 * deployment -> Web app, execute as yourself, access "Anyone".
 *
 * The deployment URL and the same SECRET go into the Worker.
 */

// Must match the SHEET_SECRET set on the Worker. Change both together.
const SECRET = 'CHANGE-ME';

const HEADERS = ['Дата', 'Тип', 'ФИО', 'Email', 'Telegram', 'Сообщение', 'Автоответ'];

// Клики по кнопкам пишутся на отдельную вкладку: это статистика, а не
// обращения, и смешивать их в одной таблице неудобно обоим.
const EVENT_SHEET = 'События';
const EVENT_HEADERS = ['Дата', 'Что произошло', 'Подробность', 'Источник'];

// Коды событий — в человеческие названия. Чего нет в списке, попадёт в
// таблицу как есть: лучше непонятная строка, чем потерянное событие.
const EVENT_NAMES = {
  'samadhi-club': 'Кнопка: Samadhi Club',
  'personal-session': 'Кнопка: личная консультация',
  'mentorship': 'Кнопка: менторство',
  'mastermind': 'Кнопка: мастермайнд',
  'forever-young': 'Кнопка: Forever Young',
  'club-audio': 'Клуб: включил аудио',
  'club-reviews': 'Клуб: открыл отзывы',
  'club-app': 'Клуб: открыл приложение',
  'formats-seen': 'Долистал до форматов',
  'lang-en': 'Переключил на английский',
  'lang-ru': 'Переключил на русский',
  'telegram-subscribe': 'Подписаться на Telegram',
  'youtube-all': 'Все видео на YouTube',
  'faq': 'Открыл вопрос в FAQ',
  'video': 'Открыл видео',
  'doc': 'Открыл документ',
  'social': 'Ушёл в соцсеть',
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.secret !== SECRET) {
      return json({ ok: false, error: 'forbidden' });
    }

    if (data.kind === 'event') {
      return appendEvent(data);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // First write of a fresh sheet lays down the column titles.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(data.at || Date.now()),
      data.kind === 'subscribe' ? 'Подписка' : 'Вопрос',
      data.name || '',
      data.email || '',
      data.telegram || '',
      data.message || '',
      data.outcome || '',
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/** Клик по кнопке формата — на отдельную вкладку, без персональных данных. */
function appendEvent(data) {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(EVENT_SHEET);

  if (!sheet) {
    sheet = book.insertSheet(EVENT_SHEET);
    sheet.appendRow(EVENT_HEADERS);
    sheet.getRange(1, 1, 1, EVENT_HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  const raw = data.outcome || '';
  const parts = raw.split(':');
  const key = parts[0];
  const detail = parts.length > 1 ? parts[1] : '';

  sheet.appendRow([
    new Date(data.at || Date.now()),
    EVENT_NAMES[raw] || EVENT_NAMES[key] || raw,
    detail,
    data.message || 'напрямую',
  ]);

  return json({ ok: true });
}

/**
 * Чтение для дашборда: обработчик спрашивает итоги, а не строки.
 *
 * Наружу уходят только количества: по дням, по названиям событий, по
 * источникам. Из вкладки обращений — одно число, сколько их было. Ни имени,
 * ни почты, ни текста сообщения здесь нет и быть не может.
 */
function doGet(e) {
  try {
    var p = (e && e.parameter) || {};
    if (p.secret !== SECRET) return json({ ok: false, error: 'forbidden' });
    if (p.action !== 'stats') return json({ ok: false, error: 'unknown action' });

    var days = parseInt(p.days, 10);
    if (!isFinite(days) || days < 1) days = 30;
    return json(buildStats(Math.min(days, 3650)));
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function buildStats(days) {
  var tz = Session.getScriptTimeZone();
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sinceDay = Utilities.formatDate(new Date(Date.now() - (days - 1) * 86400000), tz, 'yyyy-MM-dd');

  var out = {
    ok: true,
    tz: tz,
    since: sinceDay,
    total: 0,
    byDay: {},
    byEvent: {},
    bySource: {},
    contacts: 0,
    contactsByDay: {},
    firstDay: '',
    totalAllTime: 0,
  };

  var ev = book.getSheetByName(EVENT_SHEET);
  if (ev && ev.getLastRow() > 1) {
    var rows = ev.getRange(2, 1, ev.getLastRow() - 1, EVENT_HEADERS.length).getValues();
    for (var i = 0; i < rows.length; i++) {
      var day = dayOf(rows[i][0], tz);
      if (!day) continue;

      out.totalAllTime++;
      if (!out.firstDay || day < out.firstDay) out.firstDay = day;
      if (day < sinceDay) continue;

      var name = String(rows[i][1] || '—');
      var source = String(rows[i][3] || 'напрямую');
      out.byDay[day] = (out.byDay[day] || 0) + 1;
      out.byEvent[name] = (out.byEvent[name] || 0) + 1;
      out.bySource[source] = (out.bySource[source] || 0) + 1;
      out.total++;
    }
  }

  // Обращения: только счёт по дням. Первый столбец — дата, больше ничего
  // отсюда не читается, чтобы персональным данным было некуда утечь.
  var first = book.getSheets()[0];
  if (first && first.getName() !== EVENT_SHEET && first.getLastRow() > 1) {
    var dates = first.getRange(2, 1, first.getLastRow() - 1, 1).getValues();
    for (var k = 0; k < dates.length; k++) {
      var cday = dayOf(dates[k][0], tz);
      if (!cday || cday < sinceDay) continue;
      out.contactsByDay[cday] = (out.contactsByDay[cday] || 0) + 1;
      out.contacts++;
    }
  }

  return out;
}

/** Дата ячейки — в «2026-11-12» по часовому поясу таблицы. */
function dayOf(value, tz) {
  var d = value instanceof Date ? value : new Date(value);
  if (!d || isNaN(d.getTime())) return '';
  return Utilities.formatDate(d, tz, 'yyyy-MM-dd');
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
