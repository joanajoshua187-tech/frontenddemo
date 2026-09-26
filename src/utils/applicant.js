import { LENDER_RATES } from '../data/lender'

export function selfApplicant(ent, profile) {
  if (!ent.business || !ent.shared || ent.sharedKind !== 'bank' || !profile.credit) return null
  const credit = profile.credit
  const request = ent.loanPlan
    ? { amount: ent.loanPlan.amount, months: ent.loanPlan.months ?? ent.loanPlan.term, purpose: ent.loanPlan.purpose }
    : { amount: credit.indicativeLoan, months: 12, purpose: 'Working capital (no plan saved yet)' }
  return {
    id: 'self',
    live: true,
    business: ent.business.businessName,
    owner: ent.business.owner ?? 'Owner',
    sector: ent.business.sector,
    region: ent.business.region,
    months: profile.series.months,
    moneyIn: profile.series.moneyIn,
    moneyOut: profile.series.moneyOut,
    score: credit.score,
    level: `${credit.level.name}, ${credit.level.label}`,
    levelId: credit.level.id,
    factors: credit.factors,
    trust: { score: profile.trust.score, level: profile.trust.level, streak: profile.trust.streak },
    trustParts: profile.trust.parts,
    verifiedShare: profile.share,
    openFlags: ent.transactions.filter((t) => t.status === 'pending').length,
    request,
    readiness: profile.readiness,
    sharedAt: ent.sharedAt,
  }
}

export function derive(app) {
  const avgIn = app.moneyIn.reduce((s, v) => s + v, 0) / app.moneyIn.length
  const avgOut = app.moneyOut.reduce((s, v) => s + v, 0) / app.moneyOut.length
  const surplus = avgIn - avgOut
  const capacity = Math.max(0, surplus * 0.35)
  const levelId = app.levelId ?? (app.score >= 75 ? 4 : app.score >= 60 ? 3 : app.score >= 45 ? 2 : 1)
  const rate = LENDER_RATES[levelId] ?? null
  return { avgIn, avgOut, surplus, capacity, levelId, rate }
}

export function recommendation(app, d) {
  if (!d.rate) return { kind: 'decline', text: 'Score is below the lending threshold. Suggest a savings product and a review in three months.' }
  if (app.openFlags > 0) return { kind: 'info', text: `${app.openFlags} flagged ${app.openFlags === 1 ? 'line is' : 'lines are'} still open. Ask the owner to answer before deciding.` }
  if (app.trust.score < 40) return { kind: 'info', text: 'Trust is still Building. Ask for four more weeks of uploads or a connected mobile money account.' }
  return { kind: 'offer', text: 'Records are verified and consistent. An offer sized to the repayment capacity is reasonable.' }
}
