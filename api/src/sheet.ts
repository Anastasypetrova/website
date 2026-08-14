/**
 * Appending a row to the contact database — a Google Sheet on Anastasia's own
 * Drive, reached through a small Apps Script bound to it (api/apps-script).
 *
 * Apps Script rather than the Sheets API on purpose: the API route needs a
 * Google Cloud project, a service account and a private key pasted around,
 * which is a lot of moving parts for one spreadsheet. The script is a five
 * minute setup, and the data never leaves her own Drive.
 */

export interface ContactRow {
  kind: 'contact' | 'subscribe';
  name?: string;
  email: string;
  telegram?: string;
  message?: string;
  /** What the auto-reply did: sent, skipped as off-topic, or failed. */
  outcome: string;
}

export async function appendRow(endpoint: string, secret: string, row: ContactRow): Promise<void> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ secret, at: new Date().toISOString(), ...row }),
  });

  // Apps Script answers 302 to a redirect chain on success; fetch follows it.
  if (!res.ok) throw new Error(`Sheet ${res.status}: ${(await res.text()).slice(0, 200)}`);

  const body = await res.text();
  if (!body.includes('"ok":true')) {
    throw new Error(`Sheet rejected the row: ${body.slice(0, 200)}`);
  }
}
