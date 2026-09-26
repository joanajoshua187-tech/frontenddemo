import { seededRandom } from '../utils/ledger'

export const SOURCES = {
  mpesa: { id: 'mpesa', name: 'M-Pesa', owner: 'Vodacom Tanzania', kind: 'Mobile money' },
  airtel: { id: 'airtel', name: 'Airtel Money', owner: 'Airtel Tanzania', kind: 'Mobile money' },
  mixx: { id: 'mixx', name: 'Mixx by Yas', owner: 'Yas Tanzania', kind: 'Mobile money' },
  halopesa: { id: 'halopesa', name: 'HaloPesa', owner: 'Halotel', kind: 'Mobile money' },
  bank: { id: 'bank', name: 'Business bank account', owner: 'Partner bank', kind: 'Bank' },
  ledger: { id: 'ledger', name: 'Ledger photo', owner: 'Uploaded by you', kind: 'Upload' },
}

export const TELCO_BANK_SOURCES = ['mpesa', 'airtel', 'mixx', 'halopesa', 'bank']

export const demoBusiness = {
  businessName: 'Amina Tailoring',
  owner: 'Amina Hassan',
  tinMasked: '•••••••715',
  licence: 'DSM/ILA/2024/0417',
  sector: 'Manufacturing and tailoring',
  region: 'Dar es Salaam',
  since: '2022',
}

const MONTHS = [
  { key: '2026-04', label: 'Apr', sales: 1180000, costs: 820000 },
  { key: '2026-05', label: 'May', sales: 1320000, costs: 910000 },
  { key: '2026-06', label: 'Jun', sales: 1250000, costs: 880000 },
  { key: '2026-07', label: 'Jul', sales: 1410000, costs: 960000 },
  { key: '2026-08', label: 'Aug', sales: 1640000, costs: 1100000 },
  { key: '2026-09', label: 'Sep', sales: 1520000, costs: 1010000 },
]

const CUSTOMERS = ['Mama Salma', 'J. Mushi', 'Neema K.', 'Baraka School', 'Rehema', 'Mzee Juma', 'Tumaini Choir', 'Halima', 'Kassim', 'Upendo Shop']
const ITEMS = ['2 dresses', 'school uniforms', 'kitenge shirt', 'wedding outfit', 'alterations', 'choir robes', '3 skirts', 'kanzu']

function round(v, step = 500) {
  return Math.round(v / step) * step
}

export function buildDemoTransactions() {
  const rand = seededRandom(20260926)
  const rows = []
  let n = 0
  const add = (row) => {
    n += 1
    rows.push({ id: `t${String(n).padStart(4, '0')}`, status: 'confirmed', flag: null, ...row })
  }

  MONTHS.forEach((m) => {
    const salesCount = 12
    const weights = Array.from({ length: salesCount }, () => 0.6 + rand())
    const total = weights.reduce((a, b) => a + b, 0)
    weights.forEach((w, i) => {
      const day = Math.min(28, 1 + Math.floor((i * 28) / salesCount + rand() * 2))
      const r = rand()
      const source = r < 0.6 ? 'mpesa' : r < 0.72 ? 'airtel' : r < 0.9 ? 'ledger' : 'bank'
      const customer = CUSTOMERS[Math.floor(rand() * CUSTOMERS.length)]
      const item = ITEMS[Math.floor(rand() * ITEMS.length)]
      add({
        date: `${m.key}-${String(day).padStart(2, '0')}`,
        description: source === 'ledger' ? `Cash sale: ${item}, ${customer}` : `Payment from ${customer}, ${item}`,
        direction: 'in',
        category: 'Sales',
        amount: round((m.sales * w) / total),
        source,
        verified: source !== 'ledger',
      })
    })
    add({ date: `${m.key}-05`, description: 'Shop rent', direction: 'out', category: 'Rent', amount: 120000, source: 'bank', verified: true })
    add({ date: `${m.key}-07`, description: 'LUKU electricity token', direction: 'out', category: 'Power', amount: 20000, source: 'mpesa', verified: true })
    add({ date: `${m.key}-21`, description: 'LUKU electricity token', direction: 'out', category: 'Power', amount: 20000, source: 'mpesa', verified: true })
    const fabric = m.costs - 160000
    ;[0.45, 0.35, 0.2].forEach((share, i) => {
      add({
        date: `${m.key}-${String(3 + i * 9).padStart(2, '0')}`,
        description: i === 1 ? 'Thread and buttons, Kariakoo' : 'Fabric, Kariakoo wholesaler',
        direction: 'out',
        category: 'Stock',
        amount: round(fabric * share),
        source: i === 2 ? 'ledger' : 'mpesa',
        verified: i !== 2,
      })
    })
    add({ date: `${m.key}-15`, description: 'School fees, household', direction: 'out', category: 'Personal', amount: 60000, source: 'mpesa', verified: true })
  })

  add({ date: '2026-09-24', description: 'Payment from Neema K., kitenge shirt', direction: 'in', category: 'Sales', amount: 45000, source: 'mpesa', verified: true })
  add({ date: '2026-09-24', description: 'Neema K. 45,000', direction: 'in', category: 'Sales', amount: 45000, source: 'ledger', verified: false, status: 'pending', flag: 'duplicate', duplicateOf: `t${String(n).padStart(4, '0')}` })
  add({ date: '2026-09-25', description: 'Cash sale: 5 school uniforms', direction: 'in', category: 'Sales', amount: 150000, source: 'ledger', verified: false, status: 'pending', flag: 'unclear', confidence: 0.71 })

  return rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

export function buildDemoUploads() {
  const missed = new Set([4, 16])
  const start = new Date('2026-04-03T09:00:00Z')
  return Array.from({ length: 26 }, (_, week) => {
    const d = new Date(start)
    d.setUTCDate(d.getUTCDate() + week * 7)
    return { week, date: d.toISOString().slice(0, 10), uploaded: !missed.has(week), lines: missed.has(week) ? 0 : 7 + (week % 4) }
  })
}

export const DEMO_CONNECTIONS = { mpesa: 'connected', airtel: 'connected', bank: 'connected', mixx: 'available', halopesa: 'available' }
