export const lessons = [
  {
    id: 'lock-up',
    title: 'Money that is locked cannot be spent',
    body: 'Every opportunity has a lock-up period. During that time you cannot take your money out. Only invest money your household will not need before that date.',
    question: 'You need money for school fees in three months. Should you put it in an opportunity locked for 12 months?',
    options: ['Yes, if the return is high', 'No, keep it where you can reach it'],
    answer: 1,
  },
  {
    id: 'spread',
    title: 'Spread the risk',
    body: 'If one business has a bad season, others can carry you. Spreading money across sectors and places is called diversification.',
    question: 'Which is safer: all your money in one poultry farm, or smaller amounts in a farm, a salon and a water kiosk?',
    options: ['All in one farm', 'Spread across three'],
    answer: 1,
  },
  {
    id: 'no-promises',
    title: 'A return range is not a promise',
    body: 'The range shows what similar businesses earned in the past. Yours could be higher, lower, or a loss. Anyone promising a fixed high return is a warning sign.',
    question: 'Someone promises you 40% a month, guaranteed. What is this most likely to be?',
    options: ['A great opportunity', 'A scam'],
    answer: 1,
  },
  {
    id: 'verification',
    title: 'Verified does not mean safe',
    body: 'Verification proves a business is real and its records add up. It does not remove the risk of disease, bad weather or a broken machine.',
    question: 'A business is verified. Can it still lose money?',
    options: ['No, verification removes risk', 'Yes, it can still have a bad season'],
    answer: 1,
  },
  {
    id: 'units',
    title: 'Owning a fraction',
    body: 'Opportunities are split into small units. Buying units makes you a part-owner. If the opportunity grows, each unit is worth more. If it shrinks, each unit is worth less.',
    question: 'A unit costs 10,000 and the business value rises 5%. What is your unit worth now?',
    options: ['10,500', '15,000'],
    answer: 0,
  },
]

export function suggestionsFor({ holdings, wallet, simulated, profile, listingsById }) {
  const tips = []
  const invested = holdings.reduce((s, h) => s + h.cost, 0)
  if (!holdings.length) {
    tips.push({ tone: 'info', text: 'Start small. Buy a few units in one opportunity and watch how the lock-up and updates work.' })
    return tips
  }
  const categories = new Set(holdings.map((h) => listingsById(h.listingId)?.category))
  if (categories.size === 1) tips.push({ tone: 'info', text: 'All your money is in one category. Add something from a different category to spread the risk.' })
  const biggest = holdings.reduce((m, h) => (h.cost > m.cost ? h : m), holdings[0])
  const share = biggest.cost / wallet.starting
  if (share > profile.maxShare) {
    tips.push({ tone: 'warn', text: `${listingsById(biggest.listingId).name} holds ${Math.round(share * 100)}% of your money. Your ${profile.riskProfile.toLowerCase()} profile suggests under ${Math.round(profile.maxShare * 100)}%.` })
  }
  if (wallet.balance > wallet.starting * 0.3 && invested > 0 && !simulated) tips.push({ tone: 'info', text: 'Keeping some money uninvested is sensible. It works like an emergency fund.' })
  if (simulated) {
    const loss = holdings.find((h) => listingsById(h.listingId).sixMonthChange < 0)
    if (loss) {
      const l = listingsById(loss.listingId)
      tips.push({ tone: 'warn', text: `${l.name} lost value. ${l.story} Real investments have seasons like this.` })
    } else {
      tips.push({ tone: 'good', text: 'Everything you chose grew this time. Try a higher-risk opportunity to see how a loss looks.' })
    }
  }
  return tips
}
