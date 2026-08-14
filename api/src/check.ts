/**
 * Self-diagnosis for the two outside services, reachable at GET /check.
 *
 * A failing auto-reply otherwise means reading Cloudflare logs to find out
 * whether the key is wrong, the balance is empty or the model simply is not
 * available to this project. Both calls here are free — listing models and
 * listing domains cost no tokens and send no mail — and neither returns a
 * secret, only whether it works and what it says when it does not.
 */

const OPENAI_MODELS = 'https://api.openai.com/v1/models';
const RESEND_DOMAINS = 'https://api.resend.com/domains';

interface ServiceCheck {
  ok: boolean;
  status: number | null;
  detail: string | null;
  models?: string[];
  domains?: { name: string; status: string }[];
}

async function checkOpenAI(apiKey: string, wanted: string): Promise<ServiceCheck> {
  if (!apiKey) return { ok: false, status: null, detail: 'ключ не задан' };
  try {
    const res = await fetch(OPENAI_MODELS, { headers: { authorization: `Bearer ${apiKey}` } });
    const text = await res.text();
    if (!res.ok) return { ok: false, status: res.status, detail: text.slice(0, 400) };

    const data = JSON.parse(text) as { data?: { id: string }[] };
    const ids = (data.data ?? []).map((m) => m.id).sort();
    const chat = ids.filter((id) => /^(gpt|o\d|chatgpt)/.test(id));
    return {
      ok: chat.includes(wanted),
      status: res.status,
      detail: chat.includes(wanted)
        ? `модель ${wanted} доступна`
        : `модель ${wanted} НЕ в списке — задайте переменную OPENAI_MODEL с одним из перечисленных ниже`,
      models: chat,
    };
  } catch (error) {
    return { ok: false, status: null, detail: String(error).slice(0, 300) };
  }
}

async function checkResend(apiKey: string): Promise<ServiceCheck> {
  if (!apiKey) return { ok: false, status: null, detail: 'ключ не задан' };
  try {
    const res = await fetch(RESEND_DOMAINS, { headers: { authorization: `Bearer ${apiKey}` } });
    const text = await res.text();
    if (!res.ok) return { ok: false, status: res.status, detail: text.slice(0, 400) };

    const data = JSON.parse(text) as { data?: { name: string; status: string }[] };
    const domains = (data.data ?? []).map((d) => ({ name: d.name, status: d.status }));
    const verified = domains.some((d) => d.status === 'verified');
    return {
      ok: verified,
      status: res.status,
      detail: verified ? 'домен подтверждён' : 'ни один домен не подтверждён',
      domains,
    };
  } catch (error) {
    return { ok: false, status: null, detail: String(error).slice(0, 300) };
  }
}

export async function runChecks(openaiKey: string, resendKey: string, model: string) {
  const [openai, resend] = await Promise.all([checkOpenAI(openaiKey, model), checkResend(resendKey)]);
  return { openai, resend };
}
