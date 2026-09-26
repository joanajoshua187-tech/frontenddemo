export const LENDER = { name: 'Partner Bank', short: 'PB', product: 'SME working capital loan' }

export const LENDER_RATES = { 2: 0.28, 3: 0.22, 4: 0.18 }

export const SHARE_PARTNERS = [
  { id: 'bank', label: 'Partner Bank, SME desk', kind: 'bank' },
  { id: 'mfi', label: 'A microfinance institution', kind: 'mfi' },
  { id: 'insurer', label: 'An insurer', kind: 'insurer' },
  { id: 'market', label: 'The community investment marketplace', kind: 'market' },
]

export const BANK_SEES = [
  'Business name, sector, region and the registration checks that passed',
  'Monthly money in and out, built from verified and owner-confirmed records',
  'Credit readiness score with every factor, and the trust level with its parts',
  'Share of sales confirmed by a bank or mobile money provider',
  'Open flags, such as unanswered possible duplicates',
  'The loan plan the owner asked for, if any',
]

export const BANK_NEVER_SEES = [
  'The owner’s NIDA number',
  'Original ledger photos and mobile money screenshots',
  'Individual customer names from transactions',
  'Anything after the owner withdraws consent',
]

export const demoApplicants = [
  {
    id: 'app-pendo',
    business: 'Pendo Grocery',
    owner: 'Pendo M.',
    sector: 'Retail shop',
    region: 'Mwanza',
    months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    moneyIn: [2100000, 2250000, 2180000, 2320000, 2400000, 2360000],
    moneyOut: [1720000, 1810000, 1790000, 1860000, 1930000, 1900000],
    score: 81,
    level: 'Level 4, Established',
    trust: { score: 86, level: 'Strong', streak: 22 },
    verifiedShare: 0.82,
    openFlags: 0,
    request: { amount: 2500000, months: 12, purpose: 'Bulk stock before the festive season' },
    sharedAt: '2026-09-24T10:12:00+03:00',
  },
  {
    id: 'app-baraka',
    business: 'Baraka Boda Repairs',
    owner: 'Baraka J.',
    sector: 'Transport and logistics',
    region: 'Dodoma',
    months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    moneyIn: [640000, 700000, 520000, 760000, 810000, 690000],
    moneyOut: [480000, 520000, 470000, 560000, 590000, 530000],
    score: 58,
    level: 'Level 2, Starter',
    trust: { score: 55, level: 'Growing', streak: 4 },
    verifiedShare: 0.51,
    openFlags: 1,
    request: { amount: 800000, months: 9, purpose: 'A second set of workshop tools' },
    sharedAt: '2026-09-25T15:40:00+03:00',
  },
  {
    id: 'app-neema',
    business: 'Neema Salon and Spa',
    owner: 'Neema K.',
    sector: 'Beauty and personal care',
    region: 'Arusha',
    months: ['Jun', 'Jul', 'Aug', 'Sep'],
    moneyIn: [540000, 610000, 580000, 660000],
    moneyOut: [470000, 500000, 510000, 540000],
    score: 47,
    level: 'Level 2, Starter',
    trust: { score: 38, level: 'Building', streak: 2 },
    verifiedShare: 0.34,
    openFlags: 0,
    request: { amount: 1500000, months: 12, purpose: 'Two new salon chairs' },
    sharedAt: '2026-09-26T08:05:00+03:00',
  },
]

export function monthlyPaymentAnnual(principal, annualRate, months) {
  const r = annualRate / 12
  if (!principal || !months) return 0
  return (principal * r) / (1 - (1 + r) ** -months)
}
