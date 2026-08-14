import { useState, type FormEvent } from 'react';
import { T, useLang } from '../i18n';
import { docHref, links } from '../content';
import { Photo } from './Photo';
import { photoUrl } from '../photos';
import { apiConfigured, mailtoFallback, submitContact, type SubmitResult } from '../api';
import { ClockIcon, CoinsIcon, InstagramIcon, TelegramIcon, YoutubeIcon } from './Icons';

type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; answer: string | null }
  | { kind: 'failed'; reason: Extract<SubmitResult, { status: 'error' }>['reason'] };

export function Contact() {
  const lang = useLang();
  const [state, setState] = useState<State>({ kind: 'idle' });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const fields = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
      website: String(data.get('website') ?? ''),
    };

    // Nothing to send to yet: hand the message to the visitor's mail app rather
    // than swallow it.
    if (!apiConfigured) {
      window.location.href = mailtoFallback(fields);
      return;
    }

    setState({ kind: 'sending' });
    const result = await submitContact(fields);
    if (result.status === 'ok') {
      setState({ kind: 'sent', answer: result.answer ?? null });
      form.reset();
    } else {
      setState({ kind: 'failed', reason: result.reason });
    }
  };

  // Without a photo the section is the deep sage green from the design; the
  // darkening scrim only exists to keep text legible over a photo.
  const hasPhoto = Boolean(photoUrl('contacts'));

  return (
    <section className="csec sec anchor" id="contacts">
      {hasPhoto && (
        <>
          <div className="csec-bg">
            <Photo name="contacts" alt="" />
          </div>
          <div className="csec-sc"></div>
        </>
      )}
      <div className="csec-in">
        <div className="cgrid">
          <div className="fcard2">
            <div className="fcard2-logo">Анастасия Петрова</div>
            <h2 className="dh dh3"><T ru="Остались вопросы?" en="Any questions?" /></h2>

            {state.kind === 'sent' ? (
              <div className="form-done">
                <p className="form-done-h">
                  <T ru="Сообщение отправлено" en="Message sent" />
                </p>
                <p className="form-done-p">
                  {state.answer ? (
                    <T
                      ru="Похоже, на ваш вопрос уже есть ответ — он ниже. Если он не подошёл, Анастасия ответит вам письмом."
                      en="It looks like your question already has an answer — see below. If it does not fit, Anastasia will reply by email."
                    />
                  ) : (
                    <T
                      ru="Анастасия ответит вам письмом на указанный адрес."
                      en="Anastasia will reply by email to the address you gave."
                    />
                  )}
                </p>
                {state.answer && <p className="form-answer">{state.answer}</p>}
                <button className="btn-outline" type="button" onClick={() => setState({ kind: 'idle' })}>
                  <T ru="Написать ещё" en="Write again" />
                </button>
              </div>
            ) : (
              <form className="form" style={{ marginTop: 20 }} onSubmit={onSubmit}>
                <label className="flabel" htmlFor="cf-name"><T ru="Ваше имя" en="Your name" /></label>
                <input className="field" id="cf-name" type="text" name="name" autoComplete="name"
                  placeholder={lang === 'en' ? 'How should I call you' : 'Как к вам обращаться'} />

                <label className="flabel" htmlFor="cf-email">Email</label>
                <input className="field" id="cf-email" type="email" name="email" required autoComplete="email"
                  placeholder="hello@site.com" />

                <label className="flabel" htmlFor="cf-message"><T ru="Сообщение" en="Message" /></label>
                <textarea className="field" id="cf-message" name="message" required
                  placeholder={lang === 'en' ? 'Your question' : 'Ваш запрос'}></textarea>

                {/* Hidden from people, filled in by form bots — a submission with
                    it set is dropped server-side. */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                  className="hp-field" />

                {state.kind === 'failed' && (
                  <p className="form-error">
                    {state.reason === 'email_invalid' ? (
                      <T ru="Проверьте адрес электронной почты." en="Please check the email address." />
                    ) : state.reason === 'message_required' ? (
                      <T ru="Напишите, пожалуйста, сам вопрос." en="Please write your question." />
                    ) : (
                      <T
                        ru={<>Не получилось отправить. Напишите, пожалуйста, на <a href={`mailto:${links.email}`}>{links.email}</a>.</>}
                        en={<>Could not send. Please write to <a href={`mailto:${links.email}`}>{links.email}</a>.</>}
                      />
                    )}
                  </p>
                )}

                <div style={{ marginTop: 20 }}>
                  <button className="btn-onsage" type="submit" disabled={state.kind === 'sending'}>
                    {state.kind === 'sending'
                      ? <T ru="Отправляю…" en="Sending…" />
                      : <T ru="Отправить сообщение" en="Send message" />}
                  </button>
                </div>
              </form>
            )}

            <p className="fineprint">
              <T
                ru={<>Нажимая кнопку, вы соглашаетесь с <a href={docHref('privacy')}>политикой конфиденциальности</a>.</>}
                en={<>By clicking the button, you agree to the <a href={docHref('privacy')}>privacy policy</a>.</>}
              />
            </p>
          </div>
          <div>
            <h2 className="ctitle">
              <T
                ru={<>Давайте оставаться <br />на <em className="accent" style={{ fontSize: 'calc(clamp(64px,15vw,150px) * var(--hs))' }}>связи</em>.</>}
                en={<>Let's stay <br />in <em className="accent" style={{ fontSize: 'calc(clamp(64px,15vw,150px) * var(--hs))' }}>touch</em>.</>}
              />
            </h2>
            <p className="clead"><T ru="Ответим на любые организационные вопросы" en="We'll answer any organisational questions" /></p>
            <div className="crule"></div>
            <div className="cfeatures">
              <div>
                <div className="cfeat-h"><ClockIcon /><T ru="Форматы и запись" en="Formats and booking" /></div>
                <p className="cfeat-p"><T ru="Подскажем, какой формат подойдёт и как на него записаться." en="We'll help you pick the right format and how to book it." /></p>
              </div>
              <div>
                <div className="cfeat-h"><CoinsIcon /><T ru="Оплата и детали" en="Payment and details" /></div>
                <p className="cfeat-p"><T ru="Ответим на вопросы об оплате, сроках и организации." en="We'll answer questions on payment, timing and logistics." /></p>
              </div>
            </div>
            <div className="cmini">
              <a className="c-mail2" href={`mailto:${links.email}`}>{links.email}</a>
              <div className="c-social">
                <a className="soc soc-l" href={links.instagram} target="_blank" rel="noopener" aria-label="Instagram"><InstagramIcon /></a>
                <a className="soc soc-l" href={links.telegramChannel} target="_blank" rel="noopener" aria-label="Telegram"><TelegramIcon /></a>
                <a className="soc soc-l" href={links.youtube} target="_blank" rel="noopener" aria-label="YouTube"><YoutubeIcon /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
