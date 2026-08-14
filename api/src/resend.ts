/**
 * Sending mail through Resend.
 *
 * The From address lives on anastasia-samadhi.club, which Resend verifies with
 * DNS records; Reply-To points at whichever mailbox Anastasia actually reads,
 * so a person pressing Reply lands somewhere a human sees it.
 */

export interface Letter {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Plain paragraphs in the site's colours. Deliberately simple markup: mail
 * clients mangle anything clever, and a letter that renders everywhere beats a
 * letter that looks designed in one of them.
 */
function wrap(text: string, site: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;">${escapeHtml(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');

  return `<!doctype html><html><body style="margin:0;padding:0;background:#FAF8F5;">
<div style="max-width:560px;margin:0 auto;padding:32px 24px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#2C2C2C;">
${paragraphs}
<div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(44,44,44,.12);font-size:13px;color:#8A897F;">
<a href="${site}" style="color:#8B9B82;text-decoration:none;">${site.replace(/^https?:\/\//, '')}</a>
</div>
</div></body></html>`;
}

export async function sendLetter(
  apiKey: string,
  from: string,
  site: string,
  letter: Letter,
): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [letter.to],
      subject: letter.subject,
      text: letter.text,
      html: wrap(letter.text, site),
      ...(letter.replyTo ? { reply_to: letter.replyTo } : {}),
    }),
  });

  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
