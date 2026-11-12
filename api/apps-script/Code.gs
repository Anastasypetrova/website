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
const EVENT_SHEET = 'Клики';
const EVENT_HEADERS = ['Дата', 'Кнопка', 'Источник'];

const BUTTON_NAMES = {
  'samadhi-club': 'Samadhi Club',
  'personal-session': 'Личная консультация',
  'mentorship': 'Менторство',
  'mastermind': 'Мастермайнд-группа',
  'forever-young': 'Forever Young',
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

  const key = data.outcome || '';
  sheet.appendRow([
    new Date(data.at || Date.now()),
    BUTTON_NAMES[key] || key,
    data.message || 'напрямую',
  ]);

  return json({ ok: true });
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
