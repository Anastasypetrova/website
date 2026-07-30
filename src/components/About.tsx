import { T } from '../i18n';
import { ImagePlaceholder } from './ImagePlaceholder';

export function About() {
  return (
    <section className="sec bg1 anchor" id="about">
      <div className="wrap about">
        <div className="about-port">
          <span className="eyebrow"><T ru="Анастасия Петрова" en="Anastasia Petrova" /></span>
          <h2 className="dh dh2" style={{ margin: '14px 0 30px' }}>
            <T ru={<><em className="accent">Обо</em> мне</>} en={<><em className="accent">About</em> me</>} />
          </h2>
          <div className="arch" style={{ borderRadius: 0 }}>
            <ImagePlaceholder label="Анастасия Петрова" />
          </div>
        </div>
        <div className="about-body">
          <p className="about-lead">
            <T ru="МЕНЯЮ ЖИЗНИ ЧЕРЕЗ СОСТОЯНИЕ И МЫШЛЕНИЕ" en="I CHANGE LIVES THROUGH STATE AND MINDSET" />
          </p>
          <p className="about-intro">
            <T
              ru={<>Я в духовных практиках уже более 15 лет. В моём опыте випассаны, медитации, дыхательные практики, тибетское учение Дзогчен, гипнотерапия, осознанные сны и многое другое. <span className="muted">Это был долгий путь поиска, но я поняла, что не нужно столько искать, чтобы найти. Реальность меняется в один момент через намерение и перемещение внимания.</span></>}
              en={<>I've been in spiritual practice for over 15 years. My experience includes vipassana, meditation, breathwork, the Tibetan Dzogchen teaching, hypnotherapy, lucid dreaming and much more. <span className="muted">It was a long road of searching, but I realised you don't need to search so much to find. Reality shifts in a single moment through intention and the movement of attention.</span></>}
            />
          </p>
          <p className="p" style={{ textAlign: 'justify' }}>
            <T
              ru="Я на своем примере поняла, что можно исполнять любые желания при помощи внимания и прожила несколько совершенно разных жизней. Жизнь корпоративного сотрудника в Москве, где работала в большой компании и управляла большой командой, жизнь консультанта по внедрению ИИ в Амстердаме, где прожила 7 лет и была международным спикером по крипто и web3, объехав с лекциями половину Европы."
              en="Through my own experience I realised I could fulfil any desire through attention, and I've lived several completely different lives. Life as a corporate employee in Moscow, running a large team; life as an AI implementation consultant in Amsterdam, where I lived for 7 years and was an international speaker on crypto and web3, touring half of Europe with lectures."
            />
          </p>
          <p className="about-key">
            <T
              ru="Сегодня я исследователь сознания и трансформационный ментор. Большую часть времени я путешествую по всему миру, у меня за плечами более 50 стран. Веду Youtube с миллионами просмотров и говорю об энергии и состоянии, помогаю выйти за пределы концепций, изменить восприятие и реальность каждого человека так, чтоб не просто жить, а наслаждаться каждым моментом, потому что мы здесь именно за этим."
              en="Today I'm a consciousness researcher and transformational mentor. I spend most of my time travelling the world, with over 50 countries behind me. I run a YouTube channel with millions of views about energy and state, helping people move beyond limiting concepts, and shift their perception and reality so they don't just live, but enjoy every moment, because that's exactly what we're here for."
            />
          </p>
          <div className="about-callout">
            <span className="klabel">
              <T
                ru="Ваш запрос может быть любым. Мы работаем с вниманием, и неизбежно меняется всё остальное."
                en="Your request can be anything. We work with attention, and everything else inevitably changes."
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
