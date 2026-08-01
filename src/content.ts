import type { Bi } from './i18n';

export interface Video {
  id: string;
  url: string;
  thumb: string;
}

export const videos: Video[] = [
  { id: 'vid1', url: 'https://www.youtube.com/watch?v=NEHMryEJhkE', thumb: 'https://img.youtube.com/vi/NEHMryEJhkE/hqdefault.jpg' },
  { id: 'vid2', url: 'https://www.youtube.com/watch?v=U_pH9x6B-RY', thumb: 'https://img.youtube.com/vi/U_pH9x6B-RY/hqdefault.jpg' },
  { id: 'vid3', url: 'https://www.youtube.com/watch?v=BjbmsHKuak0', thumb: 'https://img.youtube.com/vi/BjbmsHKuak0/hqdefault.jpg' },
  { id: 'vid4', url: 'https://www.youtube.com/watch?v=Y0x9iOllUF0', thumb: 'https://img.youtube.com/vi/Y0x9iOllUF0/hqdefault.jpg' },
  { id: 'vid5', url: 'https://www.youtube.com/watch?v=RWx6ompGkHI', thumb: 'https://img.youtube.com/vi/RWx6ompGkHI/hqdefault.jpg' },
  { id: 'vid6', url: 'https://www.youtube.com/watch?v=IWyfNPLcH1Q', thumb: 'https://img.youtube.com/vi/IWyfNPLcH1Q/hqdefault.jpg' },
  { id: 'vid7', url: 'https://www.youtube.com/watch?v=s8etlRiKqkA', thumb: 'https://img.youtube.com/vi/s8etlRiKqkA/hqdefault.jpg' },
  { id: 'vid8', url: 'https://www.youtube.com/watch?v=kzr55qUF9z8', thumb: 'https://img.youtube.com/vi/kzr55qUF9z8/hqdefault.jpg' },
];

export const podcasts: Video[] = [
  { id: 'pod1', url: 'https://www.youtube.com/watch?v=zTsdDWTg5FU', thumb: 'https://img.youtube.com/vi/zTsdDWTg5FU/hqdefault.jpg' },
  { id: 'pod2', url: 'https://www.youtube.com/watch?v=0ZK2m_mnhsA', thumb: 'https://img.youtube.com/vi/0ZK2m_mnhsA/hqdefault.jpg' },
  { id: 'pod3', url: 'https://www.youtube.com/watch?v=_P4kog6wbRM', thumb: 'https://img.youtube.com/vi/_P4kog6wbRM/hqdefault.jpg' },
  { id: 'pod4', url: 'https://www.youtube.com/watch?v=BQE1hcHK6w4', thumb: 'https://img.youtube.com/vi/BQE1hcHK6w4/hqdefault.jpg' },
  { id: 'pod5', url: 'https://www.youtube.com/watch?v=IqIL6rPoxRs', thumb: 'https://img.youtube.com/vi/IqIL6rPoxRs/hqdefault.jpg' },
];

export interface Review {
  quote: Bi;
  body: Bi;
  name: string;
  url: string;
}

export const reviews: Review[] = [
  { quote: { ru: 'Через три недели я пришла в норму', en: 'Within three weeks I was back to normal' }, body: { ru: 'Я в клубе два месяца. Был нервный срыв, панические атаки. Делала ежедневно по 3-4 практики, слушала эфиры и подкасты. Через три недели с твоей помощью я справилась без психолога.', en: "I've been in the club for two months. I had a nervous breakdown, panic attacks. I did 3 to 4 practices daily, listened to livestreams and podcasts. Within three weeks, with your help, I coped without a therapist." }, name: 'Наталья', url: 'https://t.me/reviewsamadhi/170' },
  { quote: { ru: 'Чудеса, да и только', en: 'Nothing short of miracles' }, body: { ru: 'Чем больше я разгоняю это чувствование, тем больше пространство откликается. Белки и воробьи садятся на меня, в лесу выходят лоси и не боятся. Благодарю до луны и обратно.', en: "The more I build up this feeling, the more space responds. Squirrels and sparrows land on me, moose come out in the forest and aren't afraid. Grateful to the moon and back." }, name: 'Юлия', url: 'https://t.me/reviewsamadhi/167' },
  { quote: { ru: 'Как же ты всё просто объясняешь', en: 'You explain everything so simply' }, body: { ru: 'После почти каждого твоего видео картинка мира выстраивается заново. Мне оказывается можно всё, и я вижу, как всё меняется от того, что я думаю. Через книгу нашёл решение своей аллергии.', en: 'After almost every one of your videos, the picture of the world rebuilds itself. Turns out I can allow anything, and I see how everything shifts based on what I think. Found a solution to my allergy through a book.' }, name: 'Николай', url: 'https://t.me/reviewsamadhi/165' },
  { quote: { ru: 'Я вижу, как творю свою реальность', en: 'I can see myself creating my own reality' }, body: { ru: 'Идёт ситуация за ситуацией, где всё, что я здесь узнала, подтверждается на практике. Это реально так работает, как в осознанном сне. Спасибо, что встряхнула мою коробочку.', en: "One situation after another, everything I've learned here proves itself in practice. It really works this way, like in a lucid dream. Thank you for shaking up my little box." }, name: 'Анастасия', url: 'https://t.me/reviewsamadhi/164' },
  { quote: { ru: 'Как можно так понятно объяснять', en: 'How can you explain things so clearly' }, body: { ru: 'Восторг и восхищение. Один эфир чего только стоит, а их здесь десятки. Я только первый месяц в клубе и просто кайфую, слушаю подкасты взапой. Практики на любой вкус.', en: "Delight and admiration. One livestream alone is worth so much, and there are dozens of them here. I'm only in my first month in the club and I'm loving it, listening to podcasts nonstop. Practices for every taste." }, name: 'Ирина', url: 'https://t.me/reviewsamadhi/163' },
  { quote: { ru: 'Я вижу мир по-другому', en: 'I see the world differently now' }, body: { ru: 'Люди вокруг меня стали вести себя иначе. Я чувствую такую свободу. Ушла тревога, качество жизни уже возросло значительно. Там есть ответы уже почти на все вопросы.', en: 'People around me started acting differently. I feel such freedom. Anxiety is gone, my quality of life has already grown significantly. There are answers there to almost every question.' }, name: 'Анастасия', url: 'https://t.me/reviewsamadhi/158' },
  { quote: { ru: 'Вы сместили мой угол зрения', en: 'You shifted my whole point of view' }, body: { ru: 'За пару месяцев в клубе я начала свой блог, который постоянно растёт, и пришла в гармонию с умом и телом. Уже без разницы, о чём вы говорите, ваша энергия говорит лучше слов.', en: "Within a couple of months in the club I started my blog, which keeps growing, and found harmony between mind and body. It no longer matters what you're talking about, your energy speaks louder than words." }, name: 'Динара', url: 'https://t.me/reviewsamadhi/171' },
  { quote: { ru: 'Я очнулась и меняю жизнь', en: "I've woken up and I'm changing my life" }, body: { ru: 'Один из тех каналов, что я читаю каждый день уже несколько месяцев. Благодаря ему я увольняюсь с нелюбимой работы, продаю машину и еду в отпуск, который всё время откладывала.', en: "One of those channels I've been reading every day for months now. Thanks to it I'm quitting a job I don't love, selling my car, and going on the trip I kept putting off." }, name: 'Аня', url: 'https://t.me/reviewsamadhi/157' },
  { quote: { ru: 'Встреча как с родной душой', en: 'Like meeting a kindred soul' }, body: { ru: 'Год назад, когда я впервые увидела тебя, это было как божественный дар. Множество вопросов решается на уровне сознания. Лучший канал, который я когда-либо встречала.', en: "A year ago, when I first saw you, it felt like a divine gift. So many questions get resolved on the level of consciousness. The best channel I've ever come across." }, name: 'Кристина', url: 'https://t.me/reviewsamadhi/156' },
  { quote: { ru: 'Будто нашёл чит-код от жизни', en: 'Like I found a cheat code for life' }, body: { ru: 'Вчера в клубе был разбор нашей прошивки. Без воды, голая информация и практические рычаги, как действовать с выгодой для себя. Многие сложные выборы стали элементарным действием.', en: 'Yesterday in the club we broke down our core programming. No fluff, just raw information and practical levers for acting in your own favor. Many hard choices became simple actions.' }, name: 'Салават', url: 'https://t.me/reviewsamadhi/155' },
  { quote: { ru: 'Мгновенно меняется состояние', en: 'Your state shifts instantly' }, body: { ru: 'Это же бомба, состояние мгновенно поднимается, ведь для мозга нет разницы. Я прожила на теле упражнение вспомнить себя. Супер, беру себе в работу.', en: 'This is a bomb, your state lifts instantly, because the mind sees no difference. I lived through the exercise of remembering myself in my body. Amazing, taking this into my practice.' }, name: 'Ольга', url: 'https://t.me/reviewsamadhi/151' },
  { quote: { ru: 'Отозвалась каждая буква', en: 'Every letter resonated' }, body: { ru: 'Я слушала тысячи разных медитаций, но чтобы так отозвалась каждая буква, каждый смысл, каждая вибрация звука. Сначала слёзы, потом навзрыд, и в конце я почувствовала эту самую любовь.', en: "I've listened to thousands of different meditations, but never had every letter, every meaning, every vibration of sound resonate like this. First tears, then sobbing, and in the end I felt that very love." }, name: 'Анна', url: 'https://t.me/reviewsamadhi/150' },
  { quote: { ru: 'Жизнь разделилась на до и после', en: 'Life split into before and after' }, body: { ru: 'В клубе с сентября. Перестала зависать в соцсетях, слушаю аудиокниги и голосовые. В январе подняли зарплату, хотя везде кризис. Каждое утро благодарности. Жизнь игра, мне всё можно.', en: 'In the club since September. Stopped getting stuck in social media, I listen to audiobooks and voice messages instead. Got a raise in January despite the crisis everywhere. Gratitude every morning. Life is a game, I’m allowed anything.' }, name: 'Елена', url: 'https://t.me/reviewsamadhi/149' },
  { quote: { ru: 'Настоящая внутренняя свобода', en: 'True inner freedom' }, body: { ru: 'Раньше я боролась за свою правоту, но она была ограничена коробкой моего ума. Теперь я вижу в каждом человеке важное и чувствую тотальное доверие и настоящую внутреннюю свободу.', en: 'I used to fight to be right, but that was confined to the box of my mind. Now I see what matters in every person and feel total trust and true inner freedom.' }, name: 'Алёна', url: 'https://t.me/reviewsamadhi/141' },
  { quote: { ru: 'Океан благодарности', en: 'An ocean of gratitude' }, body: { ru: 'Впервые оставляю комментарий в соцсетях, но не могу не написать, потому что из меня океаном льётся благодарность. Спасибо, что делаете людей осознаннее и тем самым меняете их жизни.', en: "This is the first time I've ever left a comment on social media, but I couldn't not write, because gratitude is pouring out of me like an ocean. Thank you for making people more aware and changing their lives." }, name: 'София', url: 'https://t.me/reviewsamadhi/139' },
];

export interface FaqItem {
  q: Bi;
  a: Bi;
}

export const faqItems: FaqItem[] = [
  {
    q: { ru: 'Какой формат мне подойдёт?', en: 'Which format is right for me?' },
    a: {
      ru: 'Если хотите разово разобраться с конкретным запросом, подойдёт личная консультация: час один на один, где мы разберём именно вашу ситуацию. Если ищете постоянную поддержку, практики и живое общение каждый день, лучше Samadhi Club. Для глубокой длительной работы над одной темой, растянутой на несколько сессий, подойдёт индивидуальное менторство. Для группового формата, где вы работаете вместе с другими участниками и обмениваетесь опытом, подойдёт мастермайнд. Если сомневаетесь, напишите мне, и я подскажу, с чего лучше начать.',
      en: "If you want a one-off deep dive into a specific request, a personal consultation is right: an hour one on one, where we work through your exact situation. If you're looking for ongoing support, practices and live interaction every day, Samadhi Club is better. For deep, sustained work on one topic across several sessions, individual mentorship fits. For a group format, working alongside other participants and exchanging experience, choose the mastermind. If you're unsure, message me and I'll help you decide where to start.",
    },
  },
  {
    q: { ru: 'Как проходят сессии, онлайн или очно?', en: 'Are sessions online or in person?' },
    a: {
      ru: 'Все форматы, включая личную консультацию и менторство, проходят онлайн на русском языке. Использую Zoom или Google Meet, ссылку на встречу присылаю заранее, за день до сессии я обычно подтверждаю время.',
      en: "All formats, including the personal consultation and mentorship, are online in Russian. I use Zoom or Google Meet, send the meeting link in advance, and usually confirm the time a day before the session.",
    },
  },
  {
    q: { ru: 'Как оплатить и в какой валюте?', en: 'How and in what currency do I pay?' },
    a: {
      ru: 'Оплата возможна двумя способами: я высылаю инвойс на оплату, либо оплата проходит через сервис Tribute. Валюта зависит от формата и вашего местоположения, обычно рубли или евро. После записи я пришлю удобный для вас вариант и все реквизиты.',
      en: "Payment works two ways: I send an invoice, or payment goes through the Tribute service. The currency depends on the format and your location, usually rubles or euros. After you book, I'll send the option that suits you along with all the details.",
    },
  },
  {
    q: { ru: 'Как попасть в Samadhi Club?', en: 'How do I join Samadhi Club?' },
    a: {
      ru: 'Присоединиться можно по кнопке "Присоединиться" в разделе клуба. Оплата проходит через Tribute, доступна подписка на месяц, 3 месяца, полгода или год. Сразу после оплаты открывается доступ к каналу, архиву материалов и живому сообществу.',
      en: 'Join via the "Join" button in the club section. Payment goes through Tribute, with a subscription available for a month, 3 months, six months or a year. Right after payment you get access to the channel, the materials archive and the live community.',
    },
  },
  {
    q: { ru: 'Можно ли задать личный вопрос прямо здесь?', en: 'Can I ask a personal question right here?' },
    a: {
      ru: 'Организационные вопросы, по форматам, оплате и записи, можно задать через форму или Telegram, отвечаю обычно в течение дня. А вот личные запросы, которые требуют разбора, лучше приносить на консультацию: там есть время и пространство, чтобы разобраться вдумчиво, а не в переписке.',
      en: "Organisational questions, about formats, payment and booking, can go through the form or Telegram, and I usually reply within a day. Personal requests that need real unpacking are better brought to a consultation: there's time and space to work through them thoughtfully, not over chat.",
    },
  },
  {
    q: { ru: 'Что если формат не подошёл?', en: "What if the format doesn't suit me?" },
    a: {
      ru: 'Я работаю экологично и без давления: никаких обязательств продолжать, если формат оказался не тем, что вам нужно. Обсудим это открыто, и вместе подберём то, что действительно подходит именно вам, будь то другой формат или пауза.',
      en: "I work ecologically and without pressure: no obligation to continue if the format turns out not to be what you need. We'll discuss it openly and find together what genuinely suits you, whether that's another format or a pause.",
    },
  },
];

export const links = {
  instagram: 'https://www.instagram.com/anastasypetrova/',
  telegramChannel: 'https://t.me/into_samadhi',
  youtube: 'https://www.youtube.com/@anastasypetrova',
  reviewsChannel: 'https://t.me/reviewsamadhi',
  consultBot: 'https://t.me/consultpay_bot',
  clubJoin: 'https://t.me/tribute/app?startapp=sr53',
  mastermindForm: 'https://forms.gle/8MB1UucBcKHaGxSp7',
  clubAudio: 'https://t.me/into_samadhi/2531',
  email: 'hello@metasouls.co',
  mailto: 'mailto:anastasia.into.samadhi@gmail.com',
};

export const docs = [
  { slug: 'oferta', file: '1_Dogovor_publichnoy_oferty.pdf', label: { ru: 'Договор оферты', en: 'Public offer agreement' } },
  { slug: 'privacy', file: '2_Politika_konfidentsialnosti.pdf', label: { ru: 'Политика конфиденциальности', en: 'Privacy policy' } },
  { slug: 'consent', file: '3_Soglasie_na_obrabotku_personalnyh_dannyh.pdf', label: { ru: 'Согласие на обработку данных', en: 'Data processing consent' } },
  { slug: 'refunds', file: '4_Politika_vozvrata_sredstv.pdf', label: { ru: 'Политика возврата средств', en: 'Refund policy' } },
  { slug: 'disclaimer', file: '5_Disclaimer.pdf', label: { ru: 'Дисклеймер', en: 'Disclaimer' } },
  { slug: 'cookies', file: '6_Cookie_Policy.pdf', label: { ru: 'Cookie Policy', en: 'Cookie Policy' } },
  { slug: 'club-terms', file: '7_Usloviya_uchastiya_Samadhi_Club.pdf', label: { ru: 'Условия участия Samadhi Club', en: 'Samadhi Club terms' } },
];

/** Hash route for a document's own page, e.g. `#/docs/privacy`. */
export const docHref = (slug: string) => `#/docs/${slug}`;
