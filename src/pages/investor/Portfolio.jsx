import { Link } from 'react-router-dom'
import { useAppState } from '../../hooks/useAppState'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useToast } from '../../hooks/useToast'
import { findListing, CATEGORIES } from '../../data/listings'
import { suggestionsFor } from '../../data/lessons'
import { portfolioValue } from '../../utils/portfolio'
import { tsh, signedPercent } from '../../utils/format'
import { CountUpMoney } from '../../components/ScoreDial'

const CATEGORY_SHADES = ['#c8102e', '#e25a6e', '#f09aa6', '#f7cbd1']

export default function Portfolio() {
  useDocumentTitle('Portfolio and wallet')
  const { state, dispatch } = useAppState()
  const notify = useToast()
  const inv = state.inv
  const invested = inv.holdings.reduce((s, h) => s + h.cost, 0)
  const value = portfolioValue(inv)
  const gain = value - invested
  const tips = suggestionsFor({ holdings: inv.holdings, wallet: inv.wallet, simulated: inv.simulated, profile: inv.investor, listingsById: findListing })

  const byCategory = CATEGORIES.map((c, i) => ({
    category: c,
    colour: CATEGORY_SHADES[i],
    amount: inv.holdings.filter((h) => findListing(h.listingId)?.category === c).reduce((s, h) => s + h.cost, 0),
  })).filter((c) => c.amount > 0)

  return (
    <div className="stack">
      <section className="wallet">
        <div className="wallet__main">
          <p className="wallet__label">Demo wallet</p>
          <p className="wallet__balance num"><CountUpMoney value={inv.wallet.balance} /></p>
          <p className="wallet__note">Available to invest. No cash value.</p>
        </div>
        <dl className="wallet__stats">
          <div><dt>Invested</dt><dd className="num">{tsh(invested)}</dd></div>
          <div><dt>{inv.simulated ? 'Value after 6 months' : 'Current value'}</dt><dd className="num">{tsh(value)}</dd></div>
          <div>
            <dt>Gain or loss</dt>
            <dd className={`num ${gain > 0 ? 'is-in' : gain < 0 ? 'is-loss' : ''}`}>{Math.round(gain) === 0 ? tsh(0) : `${gain > 0 ? '+' : '−'}${tsh(Math.abs(gain))}`}</dd>
          </div>
        </dl>
      </section>

      <div className="two-col">
        <section className="card-block" aria-labelledby="alloc-title">
          <h2 id="alloc-title" className="h-section">Where your money sits</h2>
          {byCategory.length === 0 ? (
            <p className="muted">Nothing invested yet.</p>
          ) : (
            <>
              <div className="alloc-bar" role="img" aria-label={byCategory.map((c) => `${c.category} ${Math.round((c.amount / invested) * 100)}%`).join(', ')}>
                {byCategory.map((c) => <span key={c.category} style={{ width: `${(c.amount / invested) * 100}%`, background: c.colour }} />)}
              </div>
              <ul className="alloc-legend">
                {byCategory.map((c) => (
                  <li key={c.category}><i style={{ background: c.colour }} />{c.category}<span className="num">{Math.round((c.amount / invested) * 100)}%</span></li>
                ))}
              </ul>
            </>
          )}
        </section>
        <section className="card-block" aria-labelledby="tips-title">
          <h2 id="tips-title" className="h-section">Suggestions for you</h2>
          <ul className="tip-list">
            {tips.map((t) => <li key={t.text} className={`tip tip--${t.tone}`}>{t.text}</li>)}
          </ul>
        </section>
      </div>

      <section aria-labelledby="holdings-title">
        <div className="section-block__head">
          <h2 id="holdings-title" className="h-section">Your holdings</h2>
          {inv.holdings.length > 0 && !inv.simulated && (
            <button type="button" className="btn btn--secondary btn--small" onClick={() => { dispatch({ type: 'inv/simulate' }); notify('Six months have passed. See how each opportunity did.', 'info') }}>
              Move time forward 6 months
            </button>
          )}
        </div>
        {inv.holdings.length === 0 ? (
          <p className="empty">You have not bought any units yet. <Link to="/investor/app">Browse the marketplace</Link>.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th scope="col">Opportunity</th><th scope="col">Category</th><th scope="col" className="num-col">Units</th><th scope="col" className="num-col">Paid</th><th scope="col">Locked until</th><th scope="col" className="num-col">6-month change</th><th scope="col">What happened</th></tr>
              </thead>
              <tbody>
                {inv.holdings.map((h) => {
                  const l = findListing(h.listingId)
                  const until = new Date(h.at)
                  until.setMonth(until.getMonth() + l.lockMonths)
                  return (
                    <tr key={h.listingId}>
                      <th scope="row"><Link to={`/investor/app/listing/${l.id}`}>{l.name}</Link></th>
                      <td>{l.category}</td>
                      <td className="num-col num">{h.units}</td>
                      <td className="num-col num">{tsh(h.cost)}</td>
                      <td className="num nowrap">{until.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</td>
                      <td className={`num-col num ${inv.simulated ? (l.sixMonthChange >= 0 ? 'is-in' : 'is-loss') : ''}`}>{inv.simulated ? signedPercent(l.sixMonthChange) : 'Not yet'}</td>
                      <td>{inv.simulated ? l.story : 'Move time forward to find out'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="note">Every purchase is written to your <Link to="/investor/app/activity">activity log</Link> with a fingerprint, so the record cannot be changed quietly.</p>
      </section>
    </div>
  )
}
