export const lessons = [
  {
    id: 'lock-up',
    title: 'Money that is locked cannot be spent',
    body: 'Every listing has a lock-up period. Only invest money your household will not need before that date.',
  },
  {
    id: 'spread',
    title: 'Spread the risk',
    body: 'If one business has a bad season, the others can carry you. Keep any single business under a quarter of your money.',
  },
  {
    id: 'no-promises',
    title: 'A return range is not a promise',
    body: 'The range shows what similar businesses have earned. Yours could be higher, lower, or a loss.',
  },
  {
    id: 'verification',
    title: 'Verified does not mean safe',
    body: 'Verification proves the business is real and its records add up. It does not remove the risk of a bad season.',
  },
]

export function suggestionsFor({ holdings, balance, startingBalance, simulated, listingsById }) {
  const tips = []
  const invested = holdings.reduce((sum, h) => sum + h.amount, 0)
  if (holdings.length === 0) {
    tips.push({ tone: 'info', text: 'Start small. Put 50,000 into one business and watch how the lock-up and updates work.' })
    return tips
  }
  const sectors = new Set(holdings.map((h) => listingsById(h.listingId)?.sector))
  if (sectors.size === 1) {
    tips.push({ tone: 'info', text: 'All your money sits in one sector. Add a business from a different sector to spread the risk.' })
  }
  const biggest = holdings.reduce((max, h) => (h.amount > max.amount ? h : max), holdings[0])
  const share = biggest.amount / startingBalance
  if (share > 0.25) {
    tips.push({ tone: 'warn', text: `${listingsById(biggest.listingId)?.name} holds ${Math.round(share * 100)}% of your money. Most careful investors keep one business under 25%.` })
  }
  if (balance > startingBalance * 0.5 && invested > 0 && !simulated) {
    tips.push({ tone: 'info', text: 'Keeping some money uninvested is sensible. It works like an emergency fund.' })
  }
  if (simulated) {
    const losses = holdings.filter((h) => (listingsById(h.listingId)?.sixMonthChange ?? 0) < 0)
    if (losses.length) {
      const l = listingsById(losses[0].listingId)
      tips.push({ tone: 'warn', text: `${l.name} lost value. ${l.story} Real investments have seasons like this.` })
    } else {
      tips.push({ tone: 'good', text: 'Every business you chose grew this time. Try a higher-risk listing to see how a loss feels in practice.' })
    }
  }
  return tips
}
