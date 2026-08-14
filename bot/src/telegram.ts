/** Minimal Telegram Bot API client — only the four calls this bot makes. */

export interface InlineButton {
  text: string;
  callback_data: string;
}

export class Telegram {
  constructor(private readonly token: string) {}

  private async call(method: string, body: unknown): Promise<unknown> {
    const res = await fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { ok: boolean; description?: string; result?: unknown };
    if (!data.ok) {
      // Surfaced in `wrangler tail`; the caller decides whether it is fatal.
      throw new Error(`Telegram ${method} failed: ${data.description ?? res.status}`);
    }
    return data.result;
  }

  sendMessage(chatId: number | string, text: string, buttons?: InlineButton[][]) {
    return this.call('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
    });
  }

  answerCallbackQuery(id: string) {
    return this.call('answerCallbackQuery', { callback_query_id: id });
  }
}

/** Telegram's HTML mode parses these four; anything user-typed has to be escaped. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
