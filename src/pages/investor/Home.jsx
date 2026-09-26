import { Link } from 'react-router-dom'
import { useAppState } from '../../hooks/useAppState'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { listings, findListing, CATEGORIES } from '../../data/listings'
import { fitFor } from '../../utils/risk'
import { portfolioValue } from '../../utils/portfolio'
import { tsh } from '../../utils/format'
import { Icon } from '../../components/Icon'
import { CountUpMoney } from '../../components/ScoreDial'
import { LogoMark } from '../../components/Logo'

function pathSteps(inv) {
  const categories = new Set(inv.holdings.map((h) => findListing(h.listingId)?.category))
  return [
    { id: 'learn', title: 'Learn the basics', body: 'Five one-minute lessons: lock-ups, spreading risk, and why no return is promised.', done: inv.lessonsDone.length >= 2, to: '/investor/app/learn', cta: 'Open lessons' },
    { id: 'pick', title: 'Pick a verified business', body: 'Compare businesses side by side and read each risk in plain words.', done: inv.holdings.length > 0, to: '/investor/app/market', cta: 'Browse businesses' },
    { id: 'buy', title: 'Buy a few units', body: 'Start small. A unit costs from TSh 1,000. The money comes from your demo wallet.', done: inv.holdings.length > 0, to: '/investor/app/market', cta: 'Choose units' },
    { id: 'watch', title: 'Watch six months pass', body: 'Move time forward and see what really happened to each business, including losses.', done: inv.simulated, to: '/investor/app/portfolio', cta: 'Open portfolio' },
    { id: 'spread', title: 'Spread and review', body: 'Hold at least two categories and finish every lesson. That is how careful investors work.', done: categories.size >= 2 && inv.lessonsDone.length >= 5, to: '/investor/app/portfolio', cta: 'Review portfolio' },
  ]
}

export default function InvestorHome() {
  useDocumentTitle('Investor home')
  const { state } = useAppState()
  const inv = state.inv
  const steps = pathSteps(inv)
  const next = steps.find((s) => !s.done)
  const doneCount = steps.filter((s) => s.done).length
  const value = portfolioValue(inv)
  const picks = CATEGORIES.map((c) => listings.filter((l) => l.category === c)).flatMap((group) => group.slice(0, c2(group)))

  return (
    <div className="stack">
      <div className="inv-top">
        <section className="wallet-card" aria-labelledby="wallet-title">
          <div className="wallet-card__row">
            <span className="wallet-card__brand"><LogoMark size={26} /> Onekana wallet</span>
            <span className="wallet-card__chip">DEMO</span>
          </div>
          <p id="wallet-title" className="wallet-card__label">Available balance</p>
          <p className="wallet-card__balance num"><CountUpMoney value={inv.wallet.balance} /></p>
          <div className="wallet-card__row wallet-card__foot">
            <span>{inv.investor.displayName}</span>
            <span className="num">Invested {tsh(inv.holdings.reduce((s, h) => s + h.cost, 0))} · worth {tsh(value)}</span>
          </div>
        </section>

        <section className="card-block" aria-labelledby="tx-title">
          <div className="section-block__head">
            <h2 id="tx-title" className="h-section">Wallet history</h2>
            <Link to="/investor/app/portfolio" className="text-link">Portfolio <Icon name="arrow" size={14} /></Link>
          </div>
          <ul className="tx-list">
            {[...inv.walletTx].reverse().slice(0, 5).map((t) => (
              <li key={t.id}>
                <span className={`tx-list__icon ${t.amount > 0 ? 'is-in' : 'is-out'}`}><Icon name={t.amount > 0 ? 'plus' : 'minus'} size={14} /></span>
                <span className="tx-list__label">{t.label}<small>{new Date(t.at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></span>
                <span className={`num tx-list__amt ${t.amount > 0 ? 'is-in' : ''}`}>{t.amount > 0 ? '+' : '−'}{tsh(Math.abs(t.amount))}</span>
              </li>
            ))}
          </ul>
          <p className="note">Demo money has no cash value and cannot be withdrawn.</p>
        </section>
      </div>

      <section className="card-block path" aria-labelledby="path-title">
        <div className="section-block__head">
          <div>
            <h2 id="path-title" className="h-section">Your path to investing</h2>
            <p className="muted">{doneCount} of {steps.length} steps done. {next ? `Next: ${next.title.toLowerCase()}.` : 'You have finished the path. Keep practising before using real savings.'}</p>
          </div>
          {next && <Link to={next.to} className="btn btn--primary btn--small">{next.cta} <Icon name="arrow" size={16} /></Link>}
        </div>
        <ol className="path__steps">
          {steps.map((s, i) => (
            <li key={s.id} className={`path__step ${s.done ? 'is-done' : next?.id === s.id ? 'is-next' : ''}`}>
              <span className="path__num">{s.done ? <Icon name="check" size={16} /> : i + 1}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="picks-title">
        <div className="section-block__head">
          <div>
            <h2 id="picks-title" className="h-section">Verified businesses you can learn from</h2>
            <p className="muted">A shop, a pharmacy, farms, a fishing cooperative, water and solar projects, and a sandbox digital asset. Every one passed registration checks.</p>
          </div>
          <Link to="/investor/app/market" className="btn btn--secondary btn--small">See all {listings.length}</Link>
        </div>
        <ul className="pick-grid">
          {picks.map((l) => {
            const fit = fitFor(l, inv.investor)
            return (
              <li key={l.id}>
                <Link to={`/investor/app/listing/${l.id}`} className="pick">
                  <span className="pick__top"><span className="tag">{l.category}</span><span className={`risk risk--${l.risk.toLowerCase()}`}>{l.risk}</span></span>
                  <span className="pick__name">{l.name}</span>
                  <span className="pick__place">{l.place}</span>
                  <span className="pick__facts num">From {tsh(l.unitPrice)} · {l.lockMonths} months · {l.returnLow}–{l.returnHigh}% past range</span>
                  <span className={`fit ${fit.fits ? 'fit--yes' : 'fit--no'}`}><Icon name={fit.fits ? 'check' : 'alert'} size={13} /> {fit.fits ? 'Fits your profile' : 'Outside your profile'}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

function c2(group) {
  return group[0]?.category === 'SMEs' ? 3 : 2
}
