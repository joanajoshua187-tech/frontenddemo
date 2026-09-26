import { assessBusiness } from './scoring'
import { roundDown } from './format'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAYS_SW = ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi']

export const INSURANCE_RATE = 0.012

export function businessRows(transactions) {
  return transactions.filter((t) => t.status === 'confirmed' && t.category !== 'Personal' && t.category !== 'Savings')
}

export function monthlySeries(transactions) {
  const map = new Map()
  businessRows(transactions).forEach((t) => {
    const key = t.date.slice(0, 7)
    if (!map.has(key)) map.set(key, { in: 0, out: 0 })
    map.get(key)[t.direction === 'in' ? 'in' : 'out'] += t.amount
  })
  const keys = [...map.keys()].sort().filter((k) => map.get(k).in > 0)
  return {
    keys,
    months: keys.map((k) => MONTH_LABELS[Number(k.slice(5, 7)) - 1]),
    moneyIn: keys.map((k) => map.get(k).in),
    moneyOut: keys.map((k) => map.get(k).out),
  }
}

export function verifiedShare(transactions) {
  const sales = businessRows(transactions).filter((t) => t.direction === 'in')
  const total = sales.reduce((s, t) => s + t.amount, 0)
  if (!total) return 0
  return sales.filter((t) => t.verified).reduce((s, t) => s + t.amount, 0) / total
}

export function buildTrust(uploads, transactions) {
  const recent = uploads.slice(-12)
  const consistency = recent.length ? recent.filter((u) => u.uploaded).length / recent.length : 0
  let streak = 0
  for (let i = uploads.length - 1; i >= 0 && uploads[i].uploaded; i--) streak += 1
  const pending = transactions.filter((t) => t.status === 'pending').length
  const resolved = transactions.filter((t) => t.resolved).length
  const handled = pending + resolved ? resolved / (pending + resolved) : 1
  const share = verifiedShare(transactions)
  const tenureWeeks = uploads.filter((u) => u.uploaded).length
  const parts = [
    { label: `Uploaded records in ${Math.round(consistency * 12)} of the last 12 weeks`, points: Math.round(consistency * 40), max: 40 },
    { label: `${Math.round(share * 100)}% of sales confirmed by a bank or mobile money provider`, points: Math.round(share * 30), max: 30 },
    { label: pending ? `${pending} flagged ${pending === 1 ? 'line waits' : 'lines wait'} for your answer` : 'Every flagged line has been answered', points: Math.round(handled * 15), max: 15 },
    { label: `${tenureWeeks} weeks of history`, points: tenureWeeks >= 24 ? 15 : tenureWeeks >= 12 ? 10 : 5, max: 15 },
  ]
  const score = parts.reduce((s, p) => s + p.points, 0)
  const level = score >= 70 ? 'Strong' : score >= 40 ? 'Growing' : 'Building'
  return { score, level, parts, streak, consistency, pending }
}

export function buildProfile(state) {
  const { transactions, uploads, verification } = state
  const series = monthlySeries(transactions)
  const share = verifiedShare(transactions)
  const mixedMoney = transactions.some((t) => t.status === 'confirmed' && t.category === 'Personal')
  const saved = transactions.filter((t) => t.category === 'Savings').reduce((s, t) => s + t.amount, 0)
  const credit = series.months.length
    ? assessBusiness({
        months: series.months,
        moneyIn: series.moneyIn,
        moneyOut: series.moneyOut,
        verifiedShare: share,
        registered: verification?.status === 'verified',
        mixedMoney,
        savingsFound: saved > 0,
      })
    : null
  const trust = buildTrust(uploads, transactions)
  return { series, share, mixedMoney, saved, credit, trust, readiness: credit ? buildReadiness(credit, trust, series, transactions) : [] }
}

function buildReadiness(credit, trust, series, transactions) {
  const stockSpend = businessRows(transactions).filter((t) => t.category === 'Stock').reduce((s, t) => s + t.amount, 0) / Math.max(1, series.months.length)
  const finance =
    credit.score >= 60 && trust.score >= 60
      ? { status: 'Ready', text: `Lenders can consider up to ${credit.indicativeLoan.toLocaleString('en-US')} shillings, repaid at ${credit.monthlyRepayment.toLocaleString('en-US')} a month.` }
      : credit.score >= 45
        ? { status: 'Almost', text: 'A small starter loan is possible. Raise your trust level first to get a better offer.' }
        : { status: 'Not yet', text: 'Build three more months of records and a savings habit before borrowing.' }
  const savings =
    credit.kpis.surplus > 0
      ? { status: 'Ready', text: `You keep about ${Math.round(credit.kpis.surplus).toLocaleString('en-US')} shillings a month. Saving ${credit.savings.weekly.toLocaleString('en-US')} a week is realistic.` }
      : { status: 'Not yet', text: 'Costs are higher than sales. Fix that before saving.' }
  const insurance =
    stockSpend > 0
      ? { status: 'Ready', text: `You hold about ${roundDown(stockSpend * 2, 50000).toLocaleString('en-US')} shillings of stock. Stock and fire cover would cost roughly ${roundDown(stockSpend * 2 * INSURANCE_RATE, 500).toLocaleString('en-US')} a month.` }
      : { status: 'Almost', text: 'Record your stock purchases so we can size cover for you.' }
  const investment =
    credit.score >= 70 && trust.score >= 70 && series.months.length >= 6
      ? { status: 'Ready', text: 'You qualify to be listed for community investors after a bank officer reviews your profile.' }
      : { status: 'Almost', text: `Reach a credit readiness score of 70 and a Strong trust level to be listed. You are at ${credit.score} and ${trust.score}.` }
  return [
    { id: 'finance', title: 'Finance', ...finance },
    { id: 'savings', title: 'Savings', ...savings },
    { id: 'insurance', title: 'Insurance', ...insurance },
    { id: 'investment', title: 'Investment', ...investment },
  ]
}

export function bestSalesDay(transactions) {
  const totals = Array(7).fill(0)
  businessRows(transactions)
    .filter((t) => t.direction === 'in')
    .forEach((t) => {
      totals[new Date(`${t.date}T12:00:00Z`).getUTCDay()] += t.amount
    })
  const day = totals.indexOf(Math.max(...totals))
  return { en: WEEKDAYS_EN[day], sw: WEEKDAYS_SW[day] }
}

export function buildSavingsPlan(profile, transactions) {
  const { credit, series } = profile
  if (!credit) return null
  const peakIndex = series.moneyIn.indexOf(Math.max(...series.moneyIn))
  const lowIndex = series.moneyIn.indexOf(Math.min(...series.moneyIn))
  const day = bestSalesDay(transactions)
  const weekly = credit.savings.weekly
  const peakExtra = roundDown((series.moneyIn[peakIndex] - credit.kpis.avgIn) * 0.3, 5000)
  return {
    weekly,
    monthly: credit.savings.monthly,
    day,
    peakMonth: series.months[peakIndex],
    lowMonth: series.months[lowIndex],
    peakExtra,
    goals: [
      { id: 'emergency', title: 'Emergency fund', target: credit.savings.emergencyTarget, note: 'Two months of business costs, for a slow month or a broken machine.' },
      { id: 'deposit', title: 'Loan deposit', target: roundDown(credit.indicativeLoan * 0.1, 10000), note: 'Ten percent of your indicative loan. A deposit lowers what you borrow.' },
    ],
    tips: [
      {
        en: `Save ${weekly.toLocaleString('en-US')} shillings every ${day.en}. It is your busiest day, so the money is there.`,
        sw: `Weka akiba ya shilingi ${weekly.toLocaleString('en-US')} kila ${day.sw}. Ndiyo siku yako yenye mauzo mengi.`,
      },
      {
        en: `In ${series.months[peakIndex]} your sales were highest. In a month like that, put an extra ${peakExtra.toLocaleString('en-US')} aside for ${series.months[lowIndex]}, your slowest month.`,
        sw: `Mwezi wa ${series.months[peakIndex]} mauzo yalikuwa juu zaidi. Katika mwezi kama huo, weka ziada ya ${peakExtra.toLocaleString('en-US')} kwa ajili ya mwezi wenye mauzo machache.`,
      },
      profile.mixedMoney
        ? {
            en: 'Household payments such as school fees come out of the same account as the shop. Pay yourself a fixed amount each month instead.',
            sw: 'Malipo ya nyumbani kama ada ya shule yanatoka kwenye akaunti ya biashara. Jilipe kiasi maalum kila mwezi badala yake.',
          }
        : {
            en: 'Your business and household money are separate. Keep it that way.',
            sw: 'Pesa za biashara na za nyumbani zimetenganishwa. Endelea hivyo.',
          },
    ],
  }
}

export const LOAN_RATES = { 1: null, 2: 0.02, 3: 0.016, 4: 0.013 }

export function monthlyPayment(principal, monthlyRate, months) {
  if (!principal || !months) return 0
  if (!monthlyRate) return principal / months
  return (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months)
}

export function planLoan({ amount, months, credit }) {
  const rate = LOAN_RATES[credit.level.id]
  if (!rate) return { eligible: false }
  const payment = monthlyPayment(amount, rate, months)
  const capacity = credit.kpis.surplus * 0.35
  const maxByCapacity = capacity > 0 ? (capacity * (1 - (1 + rate) ** -months)) / rate : 0
  const maxAmount = Math.max(0, roundDown(Math.min(credit.level.cap, maxByCapacity), 50000))
  let balance = amount
  const schedule = Array.from({ length: months }, (_, i) => {
    const interest = balance * rate
    const principal = payment - interest
    balance = Math.max(0, balance - principal)
    return { month: i + 1, payment, interest, principal, balance }
  })
  const totalInterest = schedule.reduce((s, r) => s + r.interest, 0)
  return {
    eligible: true,
    rate,
    payment,
    capacity,
    maxAmount,
    affordable: payment <= capacity,
    share: capacity > 0 ? payment / (credit.kpis.surplus || 1) : 1,
    totalInterest,
    totalPaid: amount + totalInterest,
    schedule,
  }
}

export function findDuplicate(row, existing) {
  const day = new Date(`${row.date}T12:00:00Z`).getTime()
  return existing.find(
    (t) =>
      t.id !== row.id &&
      t.status === 'confirmed' &&
      t.amount === row.amount &&
      t.direction === row.direction &&
      t.source !== row.source &&
      Math.abs(new Date(`${t.date}T12:00:00Z`).getTime() - day) <= 86400000,
  )
}
