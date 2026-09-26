import { tsh } from '../utils/format'

const has = (text, words) =>
  words.some((w) => (w.length <= 4 ? new RegExp(`(^|[^a-z])${w}([^a-z]|$)`).test(text) : text.includes(w)))

export const SUGGESTIONS = {
  en: ['What is my score?', 'How can I build trust?', 'Plan a loan', 'How much should I save?', 'Any duplicates to check?', 'I want to invest'],
  sw: ['Alama yangu ni ngapi?', 'Nijenge uaminifu vipi?', 'Panga mkopo', 'Niweke akiba kiasi gani?', 'Kuna nakala za kukagua?', 'Nataka kuwekeza'],
}

export const GREETING = {
  en: 'Hello, I am the Onekana assistant. Onekana means be seen. Ask me about your score, trust level, a loan, savings, your records or investing. You can type or tap the microphone.',
  sw: 'Habari, mimi ni msaidizi wa Onekana. Onekana maana yake ni kuonekana. Niulize kuhusu alama yako, uaminifu, mkopo, akiba, kumbukumbu zako au uwekezaji. Unaweza kuandika au kubonyeza kipaza sauti.',
}

const APP = '/entrepreneur/app'
const INV = '/investor/app'
const MARKET = '/investor/app/market'

export function respond(raw, lang, ctx) {
  const text = raw.toLowerCase().trim()
  const sw = lang === 'sw'
  const say = (en, swText, to) => ({ reply: sw ? swText : en, to })
  const needBusiness = () =>
    say('First verify your registered business. It takes a minute and you can load demo records.', 'Kwanza hakiki biashara yako iliyosajiliwa. Inachukua dakika moja na unaweza kupakia kumbukumbu za mfano.', '/entrepreneur')

  if (has(text, ['balance', 'wallet', 'salio', 'pochi'])) {
    if (!ctx.investor) return say('You do not have a demo investor account yet. I have opened the sign-up page.', 'Bado huna akaunti ya majaribio ya uwekezaji. Nimefungua ukurasa wa kujisajili.', '/investor')
    return say(`You have ${tsh(ctx.balance)} of demo money and ${ctx.holdings} holdings.`, `Una ${tsh(ctx.balance)} za majaribio na uwekezaji ${ctx.holdings}.`, `${INV}/portfolio`)
  }
  if (has(text, ['duplicate', 'twice', 'flag', 'review', 'nakala', 'mara mbili', 'kagua'])) {
    if (!ctx.verified) return needBusiness()
    if (!ctx.pending) return say('Nothing is waiting. Every flagged line has been answered.', 'Hakuna kinachosubiri. Kila mstari uliowekwa alama umejibiwa.', `${APP}/records`)
    return say(
      `${ctx.pending} ${ctx.pending === 1 ? 'line needs' : 'lines need'} your answer. A possible duplicate is the same amount on the same day in two places. Tell me if it is one sale or two.`,
      `Mistari ${ctx.pending} inasubiri jibu lako. Nakala inayowezekana ni kiasi kilekile siku moja katika sehemu mbili. Niambie kama ni mauzo moja au mawili.`,
      `${APP}/records`,
    )
  }
  if (has(text, ['offer', 'lender', 'ofa', 'mkopeshaji', 'bank see', 'benki inaona', 'share with'])) {
    if (!ctx.verified) return needBusiness()
    if (!ctx.shared) return say('Your profile is private. On your profile page, choose Partner Bank and press Share. The bank sees your verified cash flow, score and trust level, never your NIDA number or photos.', 'Wasifu wako ni wa siri. Kwenye ukurasa wa wasifu, chagua benki na ubonyeze Shiriki. Benki inaona mapato yaliyothibitishwa, alama na uaminifu, si namba ya NIDA wala picha.', APP)
    if (!ctx.offer) return say(`Your profile is with ${ctx.sharedWith}. They have not replied yet.`, `Wasifu wako uko kwa ${ctx.sharedWith}. Bado hawajajibu.`, APP)
    if (ctx.offer.decision === 'offer') return say(`Good news. The bank offers ${tsh(ctx.offer.offer.amount)} over ${ctx.offer.offer.months} months, about ${tsh(ctx.offer.offer.instalment)} a month.`, `Habari njema. Benki inatoa ${tsh(ctx.offer.offer.amount)} kwa miezi ${ctx.offer.offer.months}, takriban ${tsh(ctx.offer.offer.instalment)} kwa mwezi.`, APP)
    return say(`The bank replied: ${ctx.offer.note}`, `Benki imejibu: ${ctx.offer.note}`, APP)
  }
  if (has(text, ['trust', 'uaminifu', 'streak', 'consisten'])) {
    if (!ctx.verified) return needBusiness()
    return say(
      `Your trust level is ${ctx.trust.level}, ${ctx.trust.score} out of 100, with a ${ctx.trust.streak}-week upload streak. Upload your ledger every week, connect a mobile money account and answer flagged lines to raise it.`,
      `Kiwango chako cha uaminifu ni ${ctx.trust.level}, ${ctx.trust.score} kati ya 100, na wiki ${ctx.trust.streak} mfululizo za kupakia. Pakia daftari kila wiki, unganisha akaunti ya pesa kwa simu na jibu mistari iliyowekwa alama ili kukipandisha.`,
      `${APP}/credit`,
    )
  }
  if (has(text, ['lock', 'lockup', 'lock-up', 'kufungiwa', 'kufungia'])) {
    return say(
      'A lock-up is the time when you cannot take out money you invested. Only invest money you will not need during that time.',
      'Muda wa kufungiwa ni kipindi ambacho huwezi kutoa pesa uliyowekeza. Wekeza pesa ambayo hutaihitaji katika kipindi hicho.',
    )
  }
  if (has(text, ['insurance', 'bima'])) {
    if (!ctx.verified || !ctx.readiness?.length) return needBusiness()
    const ins = ctx.readiness.find((r) => r.id === 'insurance')
    return say(ins.text, 'Bima ya mali na moto inaweza kulinda bidhaa zako. Nimefungua ushauri wa akiba ambapo kuna makadirio ya gharama.', `${APP}/savings`)
  }
  if (has(text, ['loan', 'borrow', 'mkopo', 'kukopa', 'kopa'])) {
    if (!ctx.credit) return ctx.verified ? say('Add a month of records first.', 'Ongeza kumbukumbu za mwezi mmoja kwanza.', `${APP}/records`) : needBusiness()
    return say(
      `With a score of ${ctx.credit.score} you could borrow up to ${tsh(ctx.credit.indicativeLoan)}, keeping repayments under ${tsh(ctx.credit.monthlyRepayment)} a month. I have opened the loan planner.`,
      `Kwa alama ${ctx.credit.score} unaweza kukopa hadi ${tsh(ctx.credit.indicativeLoan)}, na rejesho chini ya ${tsh(ctx.credit.monthlyRepayment)} kwa mwezi. Nimefungua mpango wa mkopo.`,
      `${APP}/loan`,
    )
  }
  if (has(text, ['save', 'saving', 'savings', 'akiba'])) {
    if (!ctx.savingsPlan) return ctx.verified ? say('Add a month of records and I will work out a savings amount.', 'Ongeza kumbukumbu za mwezi mmoja nikupe kiasi cha akiba.', `${APP}/records`) : needBusiness()
    return say(
      `Save ${tsh(ctx.savingsPlan.weekly)} every ${ctx.savingsPlan.day.en}, your busiest day. Your first goal is ${tsh(ctx.savingsPlan.goals[0].target)} for emergencies.`,
      `Weka akiba ya ${tsh(ctx.savingsPlan.weekly)} kila ${ctx.savingsPlan.day.sw}, siku yako yenye mauzo mengi. Lengo la kwanza ni ${tsh(ctx.savingsPlan.goals[0].target)} kwa dharura.`,
      `${APP}/savings`,
    )
  }
  if (has(text, ['score', 'profile', 'health', 'report', 'alama', 'ripoti', 'afya'])) {
    if (!ctx.credit) return ctx.verified ? say('Add a month of records to get your score.', 'Ongeza kumbukumbu za mwezi mmoja upate alama yako.', `${APP}/records`) : needBusiness()
    return say(
      `Your credit readiness score is ${ctx.credit.score} out of 100, ${ctx.credit.level.name}, ${ctx.credit.level.label}. Each point is explained on the score page.`,
      `Alama yako ya utayari ni ${ctx.credit.score} kati ya 100, ${ctx.credit.level.name}. Kila pointi imeelezwa kwenye ukurasa wa alama.`,
      `${APP}/credit`,
    )
  }
  if (has(text, ['activity', 'history', 'kept', 'log', 'historia', 'kumbukumbu zimehifadhiwa'])) {
    if (ctx.verified) return say(`We keep ${ctx.records} records for your business, and every action is in the activity log.`, `Tunahifadhi kumbukumbu ${ctx.records} za biashara yako, na kila hatua iko kwenye kumbukumbu za shughuli.`, `${APP}/activity`)
    if (ctx.investor) return say('Every move in your demo account is in the activity log.', 'Kila hatua kwenye akaunti yako ya majaribio iko kwenye kumbukumbu za shughuli.', `${INV}/activity`)
    return needBusiness()
  }
  if (has(text, ['connect', 'm-pesa', 'mpesa', 'airtel', 'mixx', 'halopesa', 'bank', 'benki', 'unganisha'])) {
    if (!ctx.verified) return needBusiness()
    return say('Connect a bank or mobile money account on the records page. Transactions from a connected provider count as verified.', 'Unganisha benki au akaunti ya pesa kwa simu kwenye ukurasa wa kumbukumbu. Miamala kutoka kwa mtoa huduma aliyeunganishwa inahesabiwa kuwa imethibitishwa.', `${APP}/records`)
  }
  if (has(text, ['upload', 'ledger', 'record', 'screenshot', 'daftari', 'kumbukumbu', 'pakia', 'picha'])) {
    if (!ctx.verified) return needBusiness()
    return say('Upload clear photos of each ledger page. Weekly uploads raise your trust level.', 'Pakia picha safi za kila ukurasa wa daftari. Kupakia kila wiki kunapandisha kiwango chako cha uaminifu.', `${APP}/records`)
  }
  if (has(text, ['document', 'need', 'require', 'nida', 'licence', 'license', 'tin', 'nyaraka', 'nahitaji', 'leseni'])) {
    return say(
      'You need your business name as registered with BRELA, your TIN, the owner’s NIDA number and your business licence number.',
      'Utahitaji jina la biashara kama lilivyosajiliwa BRELA, namba ya TIN, namba ya NIDA ya mmiliki na namba ya leseni ya biashara.',
      '/entrepreneur',
    )
  }
  if (has(text, ['learn', 'lesson', 'somo', 'masomo', 'jifunza'])) {
    if (!ctx.investor) return say('Open a demo account first, then the lessons are on the Learn page.', 'Fungua akaunti ya majaribio kwanza, kisha masomo yako kwenye ukurasa wa Jifunze.', '/investor')
    return say(`You have finished ${ctx.lessonsDone} of 5 lessons. Some opportunities unlock only after the lessons.`, `Umemaliza masomo ${ctx.lessonsDone} kati ya 5. Fursa nyingine zinafunguka baada ya masomo.`, `${INV}/learn`)
  }
  if (has(text, ['invest', 'wekeza', 'uwekezaji', 'mwekezaji', 'market', 'soko'])) {
    if (ctx.investor) return say('Here are the verified businesses. I can show you opportunities, but I never buy anything for you by voice.', 'Hizi ni biashara zilizohakikiwa. Naweza kukuonyesha fursa, lakini sinunui chochote kwa sauti.', MARKET)
    return say('Open a demo account and you get one million shillings of practice money. It is not real money.', 'Fungua akaunti ya majaribio upate shilingi milioni moja za mazoezi. Si pesa halisi.', '/investor')
  }
  if (has(text, ['verify', 'register', 'business', 'entrepreneur', 'hakiki', 'thibitisha', 'sajili', 'biashara', 'mjasiriamali'])) {
    if (ctx.verified) return say(`${ctx.business.businessName} is already verified. Here is your profile.`, `${ctx.business.businessName} tayari imehakikiwa. Huu ni wasifu wako.`, APP)
    return say('Let’s verify your business. You will need your business name, TIN, NIDA number and business licence.', 'Tuanze kuhakiki biashara yako. Utahitaji jina la biashara, TIN, namba ya NIDA na leseni ya biashara.', '/entrepreneur')
  }
  if (has(text, ['privacy', 'my data', 'faragha', 'taarifa zangu'])) {
    return say('Only you can see your records until you choose to share them. Your NIDA number is deleted after the check.', 'Taarifa zako zinaonekana kwako tu hadi utakapochagua kushiriki. Namba ya NIDA inafutwa baada ya ukaguzi.', '/privacy')
  }
  if (has(text, ['onekana', 'meaning', 'maana'])) {
    return say('Onekana means be seen. We help businesses that are busy every day become visible to banks, insurers and investors.', 'Onekana maana yake ni kuonekana. Tunasaidia biashara zinazofanya kazi kila siku zionekane kwa benki, bima na wawekezaji.')
  }
  if (has(text, ['how', 'work', 'works', 'inafanya', 'jinsi'])) {
    return say('I have opened the page that explains every rule behind the score.', 'Nimefungua ukurasa unaoeleza kila kanuni ya alama.', '/how-it-works')
  }
  if (has(text, ['home', 'welcome', 'nyumbani', 'mwanzo', 'karibu'])) {
    return say('Back to the welcome page.', 'Nimekurudisha ukurasa wa mwanzo.', '/')
  }
  if (has(text, ['hello', 'hi', 'hey', 'habari', 'mambo', 'hujambo', 'salama', 'jambo'])) {
    return say(GREETING.en, GREETING.sw)
  }
  if (has(text, ['help', 'what can', 'msaada', 'saidia', 'unaweza'])) {
    return say(
      'Try: "what is my score", "how can I build trust", "plan a loan", "how much should I save", "any duplicates to check", "I want to invest" or "what is my balance".',
      'Jaribu: "alama yangu", "nijenge uaminifu vipi", "panga mkopo", "niweke akiba kiasi gani", "kuna nakala za kukagua", "nataka kuwekeza" au "salio langu".',
    )
  }
  return say(
    'Sorry, I did not understand that. Try "what is my score", "plan a loan" or "I want to invest".',
    'Samahani, sijaelewa. Jaribu "alama yangu", "panga mkopo" au "nataka kuwekeza".',
  )
}
