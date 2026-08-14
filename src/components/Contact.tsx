import { type FormEvent } from 'react';
import { T } from '../i18n';
import { docHref, links } from '../content';
import { Photo } from './Photo';
import { photoUrl } from '../photos';
import { ClockIcon, CoinsIcon, InstagramIcon, TelegramIcon, YoutubeIcon } from './Icons';

async function submitContactForm(data: FormData) {
  // Hook point: POST `data` to the Telegram-bot automated-response flow once it exists.
  void data;
}

export function Contact() {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submitContactForm(new FormData(e.currentTarget));
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
            <form className="form" style={{ marginTop: 20 }} onSubmit={onSubmit}>
              <label className="flabel"><T ru="Ваше имя" en="Your name" /></label>
              <input className="field" type="text" name="name" placeholder="Как к вам обращаться" aria-label="Имя" />
              <label className="flabel">Email</label>
              <input className="field" type="email" name="email" placeholder="hello@site.com" aria-label="Email" />
              <label className="flabel"><T ru="Сообщение" en="Message" /></label>
              <textarea className="field" name="message" placeholder="Ваш запрос" aria-label="Сообщение"></textarea>
              <div style={{ marginTop: 20 }}>
                <button className="btn-onsage" type="submit"><T ru="Отправить сообщение" en="Send message" /></button>
              </div>
            </form>
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
