import { useMemo, useReducer } from 'react'
import { AppStateContext } from './appStateContext'
import { STARTING_BALANCE, RISK_PROFILES, findListing } from '../data/listings'
import { buildDemoTransactions, buildDemoUploads, DEMO_CONNECTIONS, SOURCES } from '../data/demoBusiness'
import { appendEntry } from '../utils/ledger'
import { findDuplicate } from '../utils/profile'

const EMPTY_CONNECTIONS = { mpesa: 'available', airtel: 'available', mixx: 'available', halopesa: 'available', bank: 'available' }

const emptyEnt = { business: null, verification: null, demo: false, transactions: [], uploads: [], imageHashes: [], connections: EMPTY_CONNECTIONS, loanPlan: null, shared: false, log: [] }
const emptyInv = { investor: null, wallet: { balance: STARTING_BALANCE, starting: STARTING_BALANCE }, walletTx: [], holdings: [], simulated: false, lessonsDone: [], log: [] }
const emptyLend = { decisions: {}, log: [] }

const initialState = { ent: emptyEnt, inv: emptyInv, lend: emptyLend }

let counter = 0
function nextId(prefix) {
  counter += 1
  return `${prefix}${Date.now().toString(36)}${counter}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function sourceRows(source) {
  return buildDemoTransactions().filter((t) => t.source === source && t.status === 'confirmed')
}

function freshTelcoRows(source) {
  const base = { mixx: ['Payment from Halima, kanzu', 38000], halopesa: ['Payment from Kassim, alterations', 22000], airtel: ['Payment from Rehema, 2 dresses', 54000], mpesa: ['Payment from Mzee Juma, kitenge shirt', 40000], bank: ['Transfer from Upendo Shop, uniforms', 210000] }
  const [description, amount] = base[source]
  return [
    { id: nextId('t'), date: '2026-09-20', description, direction: 'in', category: 'Sales', amount, source, verified: true, status: 'confirmed', flag: null },
    { id: nextId('t'), date: '2026-09-23', description: description.replace(/,.*/, ', repeat order'), direction: 'in', category: 'Sales', amount: Math.round(amount * 0.8), source, verified: true, status: 'confirmed', flag: null },
  ]
}

function entReducer(ent, action) {
  switch (action.type) {
    case 'ent/verified': {
      const demo = Boolean(action.demo)
      let log = appendEntry([], { action: 'Business verified', detail: `${action.business.businessName}: BRELA, TRA, licence and NIDA checks passed` })
      if (demo) log = appendEntry(log, { action: 'Demo data loaded', detail: '6 months of transactions, 24 weekly uploads, 3 connected sources' })
      return {
        ...emptyEnt,
        business: action.business,
        verification: action.verification,
        demo,
        transactions: demo ? buildDemoTransactions() : [],
        uploads: demo ? buildDemoUploads() : [],
        connections: demo ? { ...EMPTY_CONNECTIONS, ...DEMO_CONNECTIONS } : EMPTY_CONNECTIONS,
        log,
      }
    }
    case 'ent/connect': {
      const { source } = action
      const hasHistory = ent.transactions.some((t) => t.source === source)
      const incoming = hasHistory || ent.demo ? freshTelcoRows(source) : sourceRows(source).map((t) => ({ ...t, id: nextId('t') }))
      const rows = incoming.map((r) => {
        const dup = findDuplicate(r, ent.transactions)
        return dup ? { ...r, status: 'pending', flag: 'duplicate', duplicateOf: dup.id } : r
      })
      return {
        ...ent,
        connections: { ...ent.connections, [source]: 'connected' },
        transactions: [...ent.transactions, ...rows].sort((a, b) => (a.date < b.date ? -1 : 1)),
        log: appendEntry(ent.log, { action: `${SOURCES[source].name} connected`, detail: `${rows.length} transactions imported and verified by ${SOURCES[source].owner}` }),
      }
    }
    case 'ent/disconnect':
      return {
        ...ent,
        connections: { ...ent.connections, [action.source]: 'available' },
        log: appendEntry(ent.log, { action: `${SOURCES[action.source].name} disconnected`, detail: 'Consent withdrawn. Past records stay in your ledger.' }),
      }
    case 'ent/upload': {
      let rows
      const hasLedger = ent.transactions.some((t) => t.source === 'ledger')
      if (!hasLedger && !ent.demo) {
        rows = buildDemoTransactions().filter((t) => t.source === 'ledger').map((t) => ({ ...t, id: nextId('t') }))
      } else {
        const lastMobile = [...ent.transactions].reverse().find((t) => t.source !== 'ledger' && t.direction === 'in' && t.status === 'confirmed')
        rows = [
          { id: nextId('t'), date: today(), description: 'Cash sale: alterations, walk-in customer', direction: 'in', category: 'Sales', amount: 15000, source: 'ledger', verified: false, status: 'confirmed', flag: null },
          { id: nextId('t'), date: today(), description: 'Cash sale: 2 skirts, Halima', direction: 'in', category: 'Sales', amount: 48000, source: 'ledger', verified: false, status: 'confirmed', flag: null },
          { id: nextId('t'), date: today(), description: 'Thread and needles', direction: 'out', category: 'Stock', amount: 12000, source: 'ledger', verified: false, status: 'confirmed', flag: null },
        ]
        if (lastMobile) {
          rows.push({ id: nextId('t'), date: lastMobile.date, description: `${lastMobile.description.replace('Payment from ', '')} (written in ledger)`, direction: 'in', category: 'Sales', amount: lastMobile.amount, source: 'ledger', verified: false, status: 'confirmed', flag: null })
        }
      }
      rows = rows.map((r) => {
        if (r.flag === 'unclear') return r
        const dup = findDuplicate(r, ent.transactions)
        return dup ? { ...r, status: 'pending', flag: 'duplicate', duplicateOf: dup.id } : { ...r, status: 'confirmed', flag: null, duplicateOf: undefined }
      })
      const flagged = rows.filter((r) => r.status === 'pending').length
      const upload = { week: ent.uploads.length, date: today(), uploaded: true, lines: rows.length, files: action.files }
      return {
        ...ent,
        transactions: [...ent.transactions, ...rows].sort((a, b) => (a.date < b.date ? -1 : 1)),
        uploads: [...ent.uploads, upload],
        imageHashes: [...ent.imageHashes, ...(action.hashes ?? []).map((h) => ({ ...h, date: today() }))],
        log: appendEntry(ent.log, { action: 'Records uploaded', detail: `${action.files} ${action.files === 1 ? 'image' : 'images'} read, ${rows.length} lines added, ${flagged} flagged for review` }),
      }
    }
    case 'ent/resolve': {
      const row = ent.transactions.find((t) => t.id === action.id)
      if (!row) return ent
      let transactions
      let detail
      if (action.decision === 'remove') {
        transactions = ent.transactions.map((t) => (t.id === action.id ? { ...t, status: 'removed', resolved: true } : t))
        detail = `Duplicate of ${row.duplicateOf} removed by owner: ${row.description}, ${row.amount.toLocaleString('en-US')}`
      } else if (action.decision === 'amount') {
        transactions = ent.transactions.map((t) => (t.id === action.id ? { ...t, amount: action.amount, status: 'confirmed', flag: null, resolved: true, confidence: 1 } : t))
        detail = `Amount confirmed by owner: ${row.description}, ${action.amount.toLocaleString('en-US')}`
      } else {
        transactions = ent.transactions.map((t) => (t.id === action.id ? { ...t, status: 'confirmed', flag: null, resolved: true } : t))
        detail = `Kept as a separate sale by owner: ${row.description}, ${row.amount.toLocaleString('en-US')}`
      }
      return { ...ent, transactions, log: appendEntry(ent.log, { action: 'Flag answered', detail }) }
    }
    case 'ent/loanPlan':
      return { ...ent, loanPlan: action.plan, log: appendEntry(ent.log, { action: 'Loan plan saved', detail: `${action.plan.amount.toLocaleString('en-US')} over ${action.plan.months} months, ${Math.round(action.plan.payment).toLocaleString('en-US')} a month` }) }
    case 'ent/share':
      return {
        ...ent,
        shared: true,
        sharedWith: action.with,
        sharedKind: action.kind ?? 'bank',
        sharedAt: new Date().toISOString(),
        log: appendEntry(ent.log, { action: 'Profile shared', detail: `Shared with ${action.with} after owner consent. Read-only access for 30 days.` }),
      }
    case 'ent/unshare':
      return { ...ent, shared: false, log: appendEntry(ent.log, { action: 'Consent withdrawn', detail: `${ent.sharedWith} can no longer see the profile` }) }
    case 'ent/saving':
      return {
        ...ent,
        transactions: [...ent.transactions, { id: nextId('t'), date: today(), description: 'Moved to savings', direction: 'out', category: 'Savings', amount: action.amount, source: 'bank', verified: true, status: 'confirmed', flag: null }],
        log: appendEntry(ent.log, { action: 'Savings recorded', detail: `${action.amount.toLocaleString('en-US')} moved to savings` }),
      }
    case 'ent/reset':
      return emptyEnt
    default:
      return ent
  }
}

function invReducer(inv, action) {
  switch (action.type) {
    case 'inv/created': {
      const profile = RISK_PROFILES[action.investor.riskProfile]
      return {
        ...emptyInv,
        investor: { ...action.investor, maxShare: profile.maxShare },
        walletTx: [{ id: 'w1', at: new Date().toISOString(), label: 'Demo money received', amount: STARTING_BALANCE, balance: STARTING_BALANCE }],
        log: appendEntry([], { action: 'Demo account opened', detail: `${action.investor.displayName}, ${action.investor.riskProfile} profile, TSh ${STARTING_BALANCE.toLocaleString('en-US')} demo wallet` }),
      }
    }
    case 'inv/buy': {
      const listing = findListing(action.listingId)
      const cost = action.units * listing.unitPrice
      const existing = inv.holdings.find((h) => h.listingId === action.listingId)
      const holdings = existing
        ? inv.holdings.map((h) => (h.listingId === action.listingId ? { ...h, units: h.units + action.units, cost: h.cost + cost } : h))
        : [...inv.holdings, { listingId: action.listingId, units: action.units, cost, at: new Date().toISOString() }]
      return {
        ...inv,
        holdings,
        wallet: { ...inv.wallet, balance: inv.wallet.balance - cost },
        walletTx: [...inv.walletTx, { id: `w${inv.walletTx.length + 1}`, at: new Date().toISOString(), label: `${action.units} units of ${listing.name}`, amount: -cost, balance: inv.wallet.balance - cost }],
        log: appendEntry(inv.log, { action: 'Units bought', detail: `${action.units} units of ${listing.name} for TSh ${cost.toLocaleString('en-US')}` }),
      }
    }
    case 'inv/simulate':
      return { ...inv, simulated: true, log: appendEntry(inv.log, { action: 'Time moved forward', detail: 'Six months simulated for every holding' }) }
    case 'inv/lesson':
      if (inv.lessonsDone.includes(action.id)) return inv
      return { ...inv, lessonsDone: [...inv.lessonsDone, action.id], log: appendEntry(inv.log, { action: 'Lesson completed', detail: action.title }) }
    case 'inv/reset':
      return emptyInv
    default:
      return inv
  }
}

function lendReducer(lend, action) {
  switch (action.type) {
    case 'lend/decide':
      return {
        decisions: { ...lend.decisions, [action.id]: { decision: action.decision, offer: action.offer ?? null, note: action.note ?? '', at: new Date().toISOString() } },
        log: appendEntry(lend.log, { action: action.decision === 'offer' ? 'Offer made' : action.decision === 'info' ? 'More information requested' : 'Application declined', detail: `${action.business}${action.offer ? `: TSh ${action.offer.amount.toLocaleString('en-US')} over ${action.offer.months} months` : ''}${action.note ? `. Note: ${action.note}` : ''}` }),
      }
    case 'lend/viewed':
      if (lend.log.some((e) => e.action === 'Profile opened' && e.detail === action.business)) return lend
      return { ...lend, log: appendEntry(lend.log, { action: 'Profile opened', detail: action.business }) }
    case 'lend/undo': {
      const decisions = { ...lend.decisions }
      delete decisions[action.id]
      return { decisions, log: appendEntry(lend.log, { action: 'Decision reopened', detail: action.business }) }
    }
    default:
      return lend
  }
}

function reducer(state, action) {
  if (action.type.startsWith('lend/')) return { ...state, lend: lendReducer(state.lend, action) }
  if (action.type === 'ent/reset' || action.type === 'ent/unshare') {
    const decisions = { ...state.lend.decisions }
    delete decisions.self
    return { ...state, ent: entReducer(state.ent, action), lend: { ...state.lend, decisions } }
  }
  if (action.type.startsWith('ent/')) return { ...state, ent: entReducer(state.ent, action) }
  if (action.type.startsWith('inv/')) return { ...state, inv: invReducer(state.inv, action) }
  return state
}

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
