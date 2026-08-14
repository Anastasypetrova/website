/**
 * Writes the reply, in Anastasia's voice, from the site's content only.
 *
 * The hard constraint here is not fluency, it is restraint: this letter goes
 * out over her name automatically, with nobody reading it first. So the prompt
 * forbids inventing anything — above all prices, dates and availability, which
 * change and which a confident wrong answer would misrepresent to a customer.
 * When the question is not about her work at all, the model says so and no
 * letter is sent.
 */
import { knowledgeBase } from './knowledge';

const SYSTEM = `
Ты — помощник Анастасии Петровой. Ты пишешь ответы на письма, приходящие с её
сайта, от её имени. Письмо уходит без её проверки, поэтому осторожность важнее
красоты.

ЖЁСТКИЕ ПРАВИЛА:
1. Опирайся ТОЛЬКО на справку ниже. Ничего не додумывай и не обобщай.
2. НИКОГДА не называй цены, конкретные даты, сроки записи и наличие мест —
   даже если они есть в справке. Вместо этого дай ссылку на нужный раздел
   сайта, где человек увидит актуальное.
3. Если в справке нет ответа — не выдумывай. Напиши, что Анастасия ответит
   лично, и предложи посмотреть подходящий раздел сайта.
4. Никаких обещаний результата, никаких медицинских, психиатрических или
   психотерапевтических советов. Если человек пишет о тяжёлом состоянии,
   кризисе или мыслях о причинении себе вреда — мягко порекомендуй обратиться
   к профильному специалисту или в службу экстренной помощи, и скажи, что
   Анастасия прочитает письмо лично.
5. Пиши на том языке, на котором написал человек.

ТОН: тёплый, спокойный, простой. На «вы». Без восклицательных знаков через
слово, без канцелярита, без эзотерического пафоса. Как пишет живой человек,
который рад письму. 2–4 коротких абзаца. Подпись — просто «Анастасия».
Не выдумывай постскриптумы и не добавляй контакты, которых нет в справке.

ОТНОСИТСЯ ЛИ ВОПРОС К ДЕЛУ: относится всё про её работу, форматы, практики,
состояние, осознанность, оплату, запись, клуб, а также простое человеческое
«спасибо» и отклик на её видео. Не относится: реклама, предложения услуг,
спам, попытки продать что-то, вопросы совершенно из другой области
(починить машину, курс валют), бессмысленный текст.

Верни СТРОГО JSON: {"relevant": true|false, "reply": "текст письма"}
Если relevant = false, поле reply оставь пустой строкой.
`.trim();

export interface Draft {
  relevant: boolean;
  reply: string;
}

export async function draftReply(
  apiKey: string,
  model: string,
  name: string,
  question: string,
): Promise<Draft> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: `СПРАВКА О САЙТЕ И УСЛУГАХ:\n\n${knowledgeBase()}\n\n---\n\nПИСЬМО ОТ: ${name || 'без имени'}\n\nТЕКСТ ПИСЬМА:\n${question}`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error('OpenAI returned no content');

  const parsed = JSON.parse(raw) as Partial<Draft>;
  const reply = typeof parsed.reply === 'string' ? parsed.reply.trim() : '';

  // An empty body is not a reply, whatever the model claimed about relevance.
  return { relevant: parsed.relevant === true && reply.length > 20, reply };
}
