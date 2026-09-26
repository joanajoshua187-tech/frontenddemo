const PROFILE_HORIZON = { Cautious: 12, Balanced: 24, Growth: 36 }

export const LESSON_GATES = {
  sandbox: ['units', 'lock-up'],
  Higher: ['verification', 'no-promises'],
}

export function requiredLessons(listing) {
  const gates = new Set()
  if (listing.sandbox) LESSON_GATES.sandbox.forEach((g) => gates.add(g))
  if (listing.risk === 'Higher') LESSON_GATES.Higher.forEach((g) => gates.add(g))
  return [...gates]
}

export function fitFor(listing, investor) {
  if (!investor) return { fits: true, reasons: [] }
  const reasons = []
  const allowed = {
    Cautious: ['Lower', 'Medium'],
    Balanced: ['Lower', 'Medium', 'Higher'],
    Growth: ['Lower', 'Medium', 'Higher'],
  }[investor.riskProfile]
  if (!allowed.includes(listing.risk)) reasons.push(`${listing.risk.toLowerCase()} risk is above a ${investor.riskProfile.toLowerCase()} profile`)
  if (listing.lockMonths > PROFILE_HORIZON[investor.riskProfile]) reasons.push(`money is locked for ${listing.lockMonths} months, longer than your profile suggests`)
  return { fits: reasons.length === 0, reasons }
}

const BAND = [
  { max: 35, en: 'lower than most opportunities here', sw: 'ndogo kuliko nyingi hapa' },
  { max: 60, en: 'in the middle', sw: 'ya kati' },
  { max: 101, en: 'higher than most opportunities here', sw: 'kubwa kuliko nyingi hapa' },
]

export function explainRisk(listing, investor, lang = 'en') {
  const band = BAND.find((b) => listing.riskScore < b.max)
  const top = [...listing.riskFactors].sort((a, b) => weight(b.level) - weight(a.level))[0]
  const fit = fitFor(listing, investor)
  if (lang === 'sw') {
    return [
      `Hatari ya ${listing.name} ni ${band.sw}, alama ${listing.riskScore} kati ya 100.`,
      `Hatari kubwa zaidi: ${top.label.toLowerCase()}.`,
      `Pesa itakaa miezi ${listing.lockMonths}. Faida ya zamani ya fursa kama hii ni asilimia ${listing.returnLow} hadi ${listing.returnHigh} kwa mwaka, lakini haijaahidiwa.`,
      fit.fits ? 'Inaendana na wasifu wako wa hatari.' : 'Haiendani kikamilifu na wasifu wako wa hatari. Soma sababu kabla ya kuwekeza.',
    ].join(' ')
  }
  return [
    `${listing.name} carries risk ${band.en}, scoring ${listing.riskScore} out of 100.`,
    `The biggest risk is ${top.label.toLowerCase()}: ${lowerFirst(top.explain)}`,
    `Your money stays in for ${listing.lockMonths} months. Similar opportunities have returned ${listing.returnLow} to ${listing.returnHigh}% a year in the past, which is not a promise.`,
    fit.fits ? 'It fits your risk profile.' : `It does not fully fit your profile: ${fit.reasons.join(', and ')}.`,
  ].join(' ')
}

function weight(level) {
  return level === 'High' ? 3 : level === 'Medium' ? 2 : 1
}

function lowerFirst(text) {
  return text.charAt(0).toLowerCase() + text.slice(1)
}
