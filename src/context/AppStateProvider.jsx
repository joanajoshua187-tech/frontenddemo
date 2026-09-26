import { useMemo, useReducer } from 'react'
import { STARTING_BALANCE } from '../data/listings'
import { AppStateContext } from './appStateContext'

const initialState = {
  business: null,
  verification: null,
  records: [],
  extraction: null,
  confirmed: false,
  shared: false,
  investor: null,
  wallet: { balance: STARTING_BALANCE, starting: STARTING_BALANCE },
  holdings: [],
  simulated: false,
  loanPlan: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'business/verified':
      return { ...state, business: action.business, verification: action.verification, records: [], extraction: null, confirmed: false, shared: false, loanPlan: null }
    case 'records/set':
      return { ...state, records: action.records }
    case 'records/extracted':
      return { ...state, extraction: action.extraction, confirmed: false }
    case 'records/confirmed':
      return { ...state, extraction: action.extraction, confirmed: true }
    case 'loan/planned':
      return { ...state, loanPlan: action.plan }
    case 'report/shared':
      return { ...state, shared: true }
    case 'business/reset':
      return { ...state, business: null, verification: null, records: [], extraction: null, confirmed: false, shared: false, loanPlan: null }
    case 'investor/created':
      return { ...state, investor: action.investor, wallet: { balance: STARTING_BALANCE, starting: STARTING_BALANCE }, holdings: [], simulated: false }
    case 'investor/invested': {
      const existing = state.holdings.find((h) => h.listingId === action.listingId)
      const holdings = existing
        ? state.holdings.map((h) => (h.listingId === action.listingId ? { ...h, amount: h.amount + action.amount } : h))
        : [...state.holdings, { listingId: action.listingId, amount: action.amount, at: action.at }]
      return { ...state, holdings, wallet: { ...state.wallet, balance: state.wallet.balance - action.amount } }
    }
    case 'investor/simulated':
      return { ...state, simulated: true }
    case 'investor/reset':
      return { ...state, investor: null, wallet: { balance: STARTING_BALANCE, starting: STARTING_BALANCE }, holdings: [], simulated: false }
    default:
      return state
  }
}

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
