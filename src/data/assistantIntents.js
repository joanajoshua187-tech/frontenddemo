import { tsh } from '../utils/format'

const has = (text, words) =>
  words.some((w) => (w.length <= 4 ? new RegExp(`(^|[^a-z])${w}([^a-z]|$)`).test(text) : text.includes(w)))

export const SUGGESTIONS = {
  en: ['What do I need to start?', 'What is my score?', 'Plan a loan', 'I want to invest', 'What is a lock-up?'],
  sw: ['Nahitaji nini kuanza?', 'Alama yangu ni ngapi?', 'Panga mkopo', 'Nataka kuwekeza', 'Muda wa kufungiwa ni nini?'],
}

export const GREETING = {
  en: 'Hello, I am the Africa Credit OS assistant. Ask me about your score, planning a loan, saving or investing. You can type or tap the microphone.',
  sw: 'Habari, mimi ni msaidizi wa Africa Credit OS. Niulize kuhusu alama yako, kupanga mkopo, akiba au uwekezaji. Unaweza kuandika au kubonyeza kipaza sauti.',
}

export function respond(raw, lang, ctx) {
  const text = raw.toLowerCase().trim()
  const sw = lang === 'sw'
  const say = (en, swText, to) => ({ reply: sw ? swText : en, to })

  if (has(text, ['balance', 'wallet', 'salio', 'pochi'])) {
    if (!ctx.investor) return say('You do not have a demo investor account yet. I have opened the sign-up page.', 'Bado huna akaunti ya majaribio ya uwekezaji. Nimefungua ukurasa wa kujisajili.', '/investor')
    return say(`You have ${tsh(ctx.balance)} of demo money in your wallet.`, `Una ${tsh(ctx.balance)} za majaribio kwenye pochi yako.`, '/investor/dashboard')
  }
  if (has(text, ['lock', 'lockup', 'lock-up', 'kufungiwa', 'kufungia'])) {
    return say(
      'A lock-up is the time when you cannot take out money you invested. Only invest money you will not need during that time.',
      'Muda wa kufungiwa ni kipindi ambacho huwezi kutoa pesa uliyowekeza. Wekeza pesa ambayo hutaihitaji katika kipindi hicho.',
    )
  }
  if (has(text, ['document', 'need', 'require', 'nida', 'licence', 'license', 'tin', 'nyaraka', 'nahitaji', 'leseni'])) {
    return say(
      'You need your business name as registered with BRELA, your TIN, the owner’s NIDA number and your business licence number. Then photos of your ledger and mobile money screenshots.',
      'Utahitaji jina la biashara kama lilivyosajiliwa BRELA, namba ya TIN, namba ya NIDA ya mmiliki na namba ya leseni ya biashara. Kisha picha za daftari na za miamala ya pesa kwa simu.',
      '/entrepreneur',
    )
  }
  if (has(text, ['loan', 'borrow', 'mkopo', 'kukopa', 'kopa'])) {
    if (!ctx.report) return say('To plan a loan I first need your report. Verify your business and upload your records.', 'Ili kupanga mkopo, kwanza nahitaji ripoti yako. Hakiki biashara yako na upakie kumbukumbu zako.', '/entrepreneur')
    return say(
      `You could borrow up to ${tsh(ctx.report.indicativeLoan)}, with instalments under ${tsh(ctx.report.monthlyRepayment)} a month. I have opened the loan planner.`,
      `Unaweza kukopa hadi ${tsh(ctx.report.indicativeLoan)}, kwa rejesho la chini ya ${tsh(ctx.report.monthlyRepayment)} kwa mwezi. Nimefungua mpango wa mkopo.`,
      '/entrepreneur/loan-plan',
    )
  }
  if (has(text, ['save', 'saving', 'savings', 'akiba'])) {
    if (!ctx.report) return say('Once your report is ready I will tell you how much to save each week. A good first goal is two months of business costs.', 'Ripoti yako ikiwa tayari nitakuambia kiasi cha kuweka akiba kila wiki. Lengo zuri la kwanza ni gharama za biashara za miezi miwili.')
    return say(`Save ${tsh(ctx.report.savings.weekly)} every week. That builds an emergency fund of ${tsh(ctx.report.savings.emergencyTarget)}.`, `Weka akiba ya ${tsh(ctx.report.savings.weekly)} kila wiki. Hiyo itajenga akiba ya dharura ya ${tsh(ctx.report.savings.emergencyTarget)}.`)
  }
  if (has(text, ['score', 'report', 'alama', 'ripoti'])) {
    if (!ctx.report) return say('You do not have a report yet. Verify your business and upload your records first.', 'Bado huna ripoti. Hakiki biashara yako na upakie kumbukumbu zako kwanza.', ctx.verified ? '/entrepreneur/records' : '/entrepreneur')
    return say(
      `Your credit readiness score is ${ctx.report.score} out of 100, which is ${ctx.report.level.name}, ${ctx.report.level.label}. I have opened your report.`,
      `Alama yako ni ${ctx.report.score} kati ya 100, yaani ${ctx.report.level.name}. Nimefungua ripoti yako.`,
      '/entrepreneur/report',
    )
  }
  if (has(text, ['upload', 'ledger', 'record', 'screenshot', 'daftari', 'kumbukumbu', 'pakia', 'picha'])) {
    if (!ctx.verified) return say('First verify your business. Then you can upload your ledger photos and mobile money screenshots.', 'Kwanza hakiki biashara yako. Kisha utapakia picha za daftari na za miamala ya simu.', '/entrepreneur')
    return say('Upload clear photos of each ledger page and screenshots of your mobile money statements.', 'Pakia picha safi za kila ukurasa wa daftari na picha za skrini za miamala ya pesa kwa simu.', '/entrepreneur/records')
  }
  if (has(text, ['verify', 'register', 'business', 'entrepreneur', 'hakiki', 'thibitisha', 'sajili', 'biashara', 'mjasiriamali'])) {
    return say('Let’s verify your business. You will need your business name, TIN, NIDA number and business licence.', 'Tuanze kuhakiki biashara yako. Utahitaji jina la biashara, TIN, namba ya NIDA na leseni ya biashara.', '/entrepreneur')
  }
  if (has(text, ['invest', 'wekeza', 'uwekezaji', 'mwekezaji'])) {
    if (ctx.investor) return say('Here are the verified businesses you can practise with.', 'Hizi ni biashara zilizohakikiwa unazoweza kufanyia mazoezi.', '/investor/dashboard')
    return say('Open a demo account and you get one million shillings of practice money. It is not real money.', 'Fungua akaunti ya majaribio upate shilingi milioni moja za mazoezi. Si pesa halisi.', '/investor')
  }
  if (has(text, ['privacy', 'my data', 'faragha', 'taarifa zangu'])) {
    return say('Only you can see your records until you choose to share them. Your NIDA number is deleted after the check.', 'Taarifa zako zinaonekana kwako tu hadi utakapochagua kushiriki. Namba ya NIDA inafutwa baada ya ukaguzi.', '/privacy')
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
      'Try: "what do I need to start", "what is my score", "plan a loan", "how much should I save", "I want to invest" or "what is my balance".',
      'Jaribu: "nahitaji nini kuanza", "alama yangu ni ngapi", "panga mkopo", "niweke akiba kiasi gani", "nataka kuwekeza" au "salio langu".',
    )
  }
  return say(
    'Sorry, I did not understand that. Try "what is my score", "plan a loan" or "I want to invest".',
    'Samahani, sijaelewa. Jaribu "alama yangu", "panga mkopo" au "nataka kuwekeza".',
  )
}
