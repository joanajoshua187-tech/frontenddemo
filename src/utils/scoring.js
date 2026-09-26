import { roundDown } from './format'

export const SCORE_LEVELS = [
  { min: 0, id: 1, name: 'Level 1', label: 'Build first', cap: 0, note: 'Focus on savings and three more months of records before borrowing.' },
  { min: 45, id: 2, name: 'Level 2', label: 'Starter', cap: 1000000, note: 'Small working capital loans with short terms.' },
  { min: 60, id: 3, name: 'Level 3', label: 'Growth', cap: 3000000, note: 'Working capital or equipment finance sized to your surplus.' },
  { min: 75, id: 4, name: 'Level 4', label: 'Established', cap: 8000000, note: 'Larger facilities, usually with a full lender review.' },
]

const REPAYMENT_SHARE = 0.35
const SAVINGS_SHARE = 0.2

function mean(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function coefficientOfVariation(values) {
  const m = mean(values)
  const variance = mean(values.map((v) => (v - m) ** 2))
  return Math.sqrt(variance) / m
}

export function assessBusiness({ months, moneyIn, moneyOut, verifiedShare, registered, mixedMoney, savingsFound }) {
  const avgIn = mean(moneyIn)
  const avgOut = mean(moneyOut)
  const surplus = avgIn - avgOut
  const margin = surplus / avgIn
  const cv = coefficientOfVariation(moneyIn)

  const factors = [{ label: 'Starting point for every business', points: 25, kind: 'base' }]
  const steadiness = cv < 0.1 ? 20 : cv < 0.2 ? 14 : cv < 0.3 ? 8 : 0
  factors.push({ label: `Sales steadiness: monthly sales vary by about ${Math.round(cv * 100)}%`, points: steadiness })
  const marginPoints = margin > 0.3 ? 15 : margin > 0.2 ? 10 : margin > 0.1 ? 5 : 0
  factors.push({ label: `You keep about ${Math.round(margin * 100)} shillings of every 100 you sell`, points: marginPoints })
  const history = months.length >= 6 ? 10 : months.length >= 3 ? 5 : 0
  factors.push({ label: `${months.length} months of records`, points: history })
  factors.push({ label: `${Math.round(verifiedShare * 100)}% of figures confirmed by mobile money records`, points: verifiedShare >= 0.6 ? 10 : 5 })
  if (registered) factors.push({ label: 'Business registration and TIN verified', points: 10 })
  if (mixedMoney) factors.push({ label: 'Business and household money are mixed', points: -5 })
  if (!savingsFound) factors.push({ label: 'No regular savings found in the records', points: -5 })

  const score = Math.max(0, Math.min(100, factors.reduce((sum, f) => sum + f.points, 0)))
  const level = [...SCORE_LEVELS].reverse().find((l) => score >= l.min)
  const monthlyRepayment = Math.max(0, roundDown(surplus * REPAYMENT_SHARE, 1000))
  const indicativeLoan = Math.max(0, Math.min(level.cap, roundDown(monthlyRepayment * 12, 50000)))

  const monthlySaving = Math.max(0, roundDown(surplus * SAVINGS_SHARE, 5000))
  const emergencyTarget = roundDown(avgOut * 2, 50000)

  const trust = verifiedShare >= 0.6 ? 'High' : verifiedShare >= 0.3 ? 'Medium' : 'Low'

  return {
    score,
    factors,
    level,
    indicativeLoan,
    monthlyRepayment,
    savings: {
      monthly: monthlySaving,
      weekly: roundDown(monthlySaving / 4.33, 500),
      emergencyTarget,
      monthsToTarget: monthlySaving > 0 ? Math.ceil(emergencyTarget / monthlySaving) : null,
    },
    trust: { label: trust, share: verifiedShare },
    kpis: { avgIn, avgOut, surplus, margin, cv },
  }
}

export const STEADINESS = {
  steady: { label: 'Steady', spread: 0.08 },
  mixed: { label: 'Some ups and downs', spread: 0.16 },
  uneven: { label: 'Very uneven', spread: 0.32 },
}

export function estimateFromTotals({ sales, costs, months, steadiness, registered, mobileShare, separate, saves }) {
  const spread = STEADINESS[steadiness]?.spread ?? 0.16
  const labels = Array.from({ length: months }, (_, i) => `M${i + 1}`)
  const moneyIn = labels.map((_, i) => Math.max(1, sales * (1 + (i % 2 === 0 ? -spread : spread))))
  const moneyOut = labels.map(() => costs)
  return assessBusiness({
    months: labels,
    moneyIn,
    moneyOut,
    verifiedShare: mobileShare,
    registered,
    mixedMoney: !separate,
    savingsFound: saves,
  })
}
