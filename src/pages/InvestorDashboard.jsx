import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../hooks/useAppState'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { listings, findListing, SECTOR_FILTERS, RISK_LEVELS } from '../data/listings'
import { lessons, suggestionsFor } from '../data/lessons'
import { tsh, signedPercent } from '../utils/format'
import { Icon } from '../components/Icon'

export default function InvestorDashboard() {
  useDocumentTitle('Investor dashboard')
  const { state, dispatch } = useAppState()
  const [sector, setSector] = useState('All sectors')
  const [risk, setRisk] = useState('Any risk')

  const invested = state.holdings.reduce((sum, h) => sum + h.amount, 0)
  const value = state.holdings.reduce((sum, h) => {
    const change = state.simulated ? (findListing(h.listingId)?.sixMonthChange ?? 0) / 100 : 0
    return sum + h.amount * (1 + change)
  }, 0)
  const gain = value - invested

  const tips = suggestionsFor({
    holdings: state.holdings,
    balance: state.wallet.balance,
    startingBalance: state.wallet.starting,
    simulated: state.simulated,
    listingsById: findListing,
  })

  const shown = useMemo(
    () => listings.filter((l) => (sector === 'All sectors' || l.sector === sector) && (risk === 'Any risk' || l.risk === risk)),
    [sector, risk],
  )

  return (
    <section className="page">
      <header className="dash-head">
        <div>
          <p className="report-head__kicker">Demo investor account</p>
          <h1 className="page__title">Karibu, {state.investor.displayName}</h1>
        </div>
        <button type="button" className="btn btn--ghost btn--small" onClick={() => dispatch({ type: 'investor/reset' })}>Start again with a fresh wallet</button>
      </header>

      <div className="wallet">
        <div className="wallet__main">
          <p className="wallet__label">Demo wallet</p>
          <p className="wallet__balance num">{tsh(state.wallet.balance)}</p>
          <p className="wallet__note">Available to invest. No cash value.</p>
        </div>
        <dl className="wallet__stats">
          <div><dt>Invested</dt><dd className="num">{tsh(invested)}</dd></div>
          <div><dt>{state.simulated ? 'Value after 6 months' : 'Current value'}</dt><dd className="num">{tsh(value)}</dd></div>
          <div>
            <dt>Gain or loss</dt>
            <dd className={`num ${gain > 0 ? 'is-in' : gain < 0 ? 'is-loss' : ''}`}>{gain === 0 ? tsh(0) : `${gain > 0 ? '+' : '−'}${tsh(Math.abs(gain))}`}</dd>
          </div>
        </dl>
      </div>

      <div className="dash-grid">
        <section className="dash-card" aria-labelledby="tips-title">
          <h2 id="tips-title" className="dash-card__title">Suggestions for you</h2>
          <ul className="tip-list">
            {tips.map((t) => <li key={t.text} className={`tip tip--${t.tone}`}>{t.text}</li>)}
          </ul>
        </section>
        <section className="dash-card" aria-labelledby="lessons-title">
          <h2 id="lessons-title" className="dash-card__title">Four things to learn here</h2>
          <ol className="lesson-list">
            {lessons.map((l) => (
              <li key={l.id}><strong>{l.title}.</strong> {l.body}</li>
            ))}
          </ol>
        </section>
      </div>

      <section className="section-block" aria-labelledby="holdings-title">
        <div className="section-block__head">
          <h2 id="holdings-title">Your investments</h2>
          {state.holdings.length > 0 && !state.simulated && (
            <button type="button" className="btn btn--dark btn--small" onClick={() => dispatch({ type: 'investor/simulated' })}>Move time forward 6 months</button>
          )}
        </div>
        {state.holdings.length === 0 ? (
          <p className="empty">You have not invested yet. Pick a business below to start with a small amount.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th scope="col">Business</th><th scope="col">Sector</th><th scope="col" className="num-col">Invested</th><th scope="col">Locked until</th><th scope="col" className="num-col">6-month change</th><th scope="col">What happened</th></tr>
              </thead>
              <tbody>
                {state.holdings.map((h) => {
                  const l = findListing(h.listingId)
                  const unlock = new Date(h.at)
                  unlock.setMonth(unlock.getMonth() + l.lockMonths)
                  return (
                    <tr key={h.listingId}>
                      <th scope="row"><Link to={`/investor/listings/${l.id}`}>{l.name}</Link></th>
                      <td>{l.sector}</td>
                      <td className="num-col num">{tsh(h.amount)}</td>
                      <td className="num">{unlock.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</td>
                      <td className={`num-col num ${state.simulated ? (l.sixMonthChange >= 0 ? 'is-in' : 'is-loss') : ''}`}>{state.simulated ? signedPercent(l.sixMonthChange) : 'Not yet'}</td>
                      <td>{state.simulated ? l.story : 'Move time forward to find out'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="section-block" aria-labelledby="listings-title">
        <div className="section-block__head">
          <h2 id="listings-title">Verified businesses</h2>
          <div className="filters">
            <label htmlFor="sector-filter" className="visually-hidden">Sector</label>
            <select id="sector-filter" value={sector} onChange={(e) => setSector(e.target.value)}>
              {SECTOR_FILTERS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <label htmlFor="risk-filter" className="visually-hidden">Risk</label>
            <select id="risk-filter" value={risk} onChange={(e) => setRisk(e.target.value)}>
              {['Any risk', ...RISK_LEVELS].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        {shown.length === 0 ? (
          <p className="empty">No businesses match both filters. Try another sector or risk level.</p>
        ) : (
          <ul className="listing-grid">
            {shown.map((l) => (
              <li key={l.id}>
                <Link to={`/investor/listings/${l.id}`} className="listing-card">
                  <div className="listing-card__top">
                    <span className="tag">{l.sector}</span>
                    <span className={`risk risk--${l.risk.toLowerCase()}`}>{l.risk} risk</span>
                  </div>
                  <h3>{l.name}</h3>
                  <p className="listing-card__place">{l.place}</p>
                  <p className="listing-card__purpose">{l.purpose}</p>
                  <div className="meter" aria-hidden="true"><span style={{ width: `${(l.raised / l.raising) * 100}%` }} /></div>
                  <p className="listing-card__raised num">{tsh(l.raised)} of {tsh(l.raising)}</p>
                  <dl className="listing-card__facts">
                    <div><dt>Minimum</dt><dd className="num">{tsh(l.minimum)}</dd></div>
                    <div><dt>Locked</dt><dd className="num">{l.lockMonths} months</dd></div>
                    <div><dt>Score</dt><dd className="num">{l.score}</dd></div>
                  </dl>
                  <span className="listing-card__go">Read the details <Icon name="arrow" size={16} /></span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}
