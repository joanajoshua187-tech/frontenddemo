import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppState } from '../hooks/useAppState'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useToast } from '../hooks/useToast'
import { findListing, CONCENTRATION_LIMIT } from '../data/listings'
import { validateAmount } from '../utils/validators'
import { tsh, plain } from '../utils/format'
import { Icon } from '../components/Icon'
import NotFound from './NotFound'

const QUICK = [50000, 100000, 250000]

export default function InvestorListing() {
  const { id } = useParams()
  const listing = findListing(id)
  useDocumentTitle(listing ? listing.name : 'Listing not found')
  if (!listing) return <NotFound />
  return <ListingView listing={listing} />
}

function ListingView({ listing }) {
  const { state, dispatch } = useAppState()
  const notify = useToast()
  const navigate = useNavigate()
  const [amount, setAmount] = useState(String(listing.minimum))
  const [error, setError] = useState('')
  const [answer, setAnswer] = useState('')
  const [ackConcentration, setAckConcentration] = useState(false)
  const [reviewing, setReviewing] = useState(false)

  const held = state.holdings.find((h) => h.listingId === listing.id)?.amount ?? 0
  const share = (held + Number(amount || 0)) / state.wallet.starting
  const concentrated = share > CONCENTRATION_LIMIT
  const understood = answer === 'no'
  const [low, high] = (listing.returnRange.match(/\d+/g) || [0, 0]).map(Number)
  const sliderMax = Math.max(listing.minimum, Math.min(state.wallet.balance, 500000))
  const numeric = Number(amount) || 0
  const years = listing.lockMonths / 12
  const lowBack = numeric * (1 + (low / 100) * years)
  const highBack = numeric * (1 + (high / 100) * years)

  function review(event) {
    event.preventDefault()
    const problem = validateAmount({ amount, minimum: listing.minimum, balance: state.wallet.balance })
    setError(problem)
    if (problem) return
    if (!understood) {
      setError('Answer the lock-up question correctly before you continue.')
      return
    }
    if (concentrated && !ackConcentration) {
      setError('Confirm that you understand how much of your money this puts in one business.')
      return
    }
    setReviewing(true)
  }

  function confirm() {
    dispatch({ type: 'investor/invested', listingId: listing.id, amount: Number(amount), at: new Date().toISOString() })
    notify(`You invested ${tsh(amount)} of demo money in ${listing.name}.`)
    navigate('/investor/dashboard')
  }

  return (
    <section className="page">
      <Link to="/investor/dashboard" className="back-link">Back to the dashboard</Link>
      <div className="flow">
        <div className="flow__main">
          <p className="report-head__kicker">{listing.sector} · {listing.place}</p>
          <h1 className="page__title">{listing.name}</h1>
          <p className="page__lede">{listing.purpose}</p>

          <dl className="kpi-row kpi-row--four">
            <div><dt>Raising</dt><dd className="num">{tsh(listing.raising)}</dd></div>
            <div><dt>Raised so far</dt><dd className="num">{tsh(listing.raised)}</dd></div>
            <div><dt>Money locked for</dt><dd className="num">{listing.lockMonths} months</dd></div>
            <div><dt>Readiness score</dt><dd className="num">{listing.score} / 100</dd></div>
          </dl>

          <section className="detail-block">
            <h2>What was verified</h2>
            <ul className="check-list">
              {listing.verifiedBy.map((v) => (
                <li key={v}><span className="check-list__icon"><Icon name="check" label="Verified" /></span><span>{v}</span></li>
              ))}
            </ul>
          </section>

          <section className="detail-block">
            <h2>What could go wrong</h2>
            <ul className="plain-list">
              {listing.risks.map((r) => <li key={r}>{r}</li>)}
            </ul>
            <blockquote className="swahili" lang="sw">{listing.swahili}</blockquote>
            <p className="note">Similar businesses have returned {listing.returnRange}. That is a range from the past, not a promise. You could get back less than you put in.</p>
          </section>
        </div>

        <aside className="flow__aside invest-box" aria-labelledby="invest-title">
          <h2 id="invest-title">Practise investing</h2>
          <p className="note">Demo wallet: <strong className="num">{tsh(state.wallet.balance)}</strong></p>
          {reviewing ? (
            <div className="invest-review">
              <p>You are putting <strong className="num">{tsh(amount)}</strong> of demo money into <strong>{listing.name}</strong> for {listing.lockMonths} months.</p>
              <div className="actions actions--stack">
                <button type="button" className="btn btn--primary" onClick={confirm}>Confirm investment</button>
                <button type="button" className="btn btn--ghost" onClick={() => setReviewing(false)}>Change the amount</button>
              </div>
            </div>
          ) : (
            <form onSubmit={review} noValidate className="form form--compact">
              <div className="field">
                <label htmlFor="amount">Amount in TSh</label>
                <p className="field__hint" id="amount-hint">Minimum {plain(listing.minimum)}, in whole thousands</p>
                <input id="amount" type="number" inputMode="numeric" step="1000" min={listing.minimum} value={amount} aria-describedby="amount-hint" onChange={(e) => { setAmount(e.target.value); setError('') }} />
              </div>
              <div className="quick-amounts">
                {QUICK.filter((q) => q >= listing.minimum).map((q) => (
                  <button key={q} type="button" className={`chip-button ${Number(amount) === q ? 'is-selected' : ''}`} onClick={() => { setAmount(String(q)); setError('') }}>{plain(q)}</button>
                ))}
              </div>

              <div className="slider">
                <label htmlFor="amount-slider" className="visually-hidden">Choose an amount</label>
                <input
                  id="amount-slider"
                  type="range"
                  min={listing.minimum}
                  max={sliderMax}
                  step={5000}
                  value={Math.min(Math.max(numeric, listing.minimum), sliderMax)}
                  onChange={(e) => { setAmount(e.target.value); setError('') }}
                  style={{ '--fill': `${((Math.min(Math.max(numeric, listing.minimum), sliderMax) - listing.minimum) / Math.max(1, sliderMax - listing.minimum)) * 100}%` }}
                />
              </div>

              {numeric >= listing.minimum && (
                <div className="projection" aria-live="polite">
                  <p className="projection__title">After {listing.lockMonths} months, if this business does as well as similar ones</p>
                  <div className="projection__bars">
                    <div><span>Lower end</span><strong className="num">{tsh(lowBack)}</strong></div>
                    <div><span>Higher end</span><strong className="num">{tsh(highBack)}</strong></div>
                  </div>
                  <p className="projection__warn">It could also be less than {tsh(numeric)}, or nothing if the business fails.</p>
                </div>
              )}

              <fieldset className="choice-group">
                <legend>Can you take this money out before {listing.lockMonths} months?</legend>
                <div className="choice-group__options choice-group__options--row">
                  {[['yes', 'Yes'], ['no', 'No']].map(([v, l]) => (
                    <label key={v} className={`choice choice--small ${answer === v ? 'is-selected' : ''}`}>
                      <input type="radio" name="lockup" value={v} checked={answer === v} onChange={() => setAnswer(v)} />
                      <span className="choice__title">{l}</span>
                    </label>
                  ))}
                </div>
                {answer === 'yes' && <p className="field__error">Not quite. The money is locked for {listing.lockMonths} months.</p>}
                {answer === 'no' && <p className="field__ok">Correct.</p>}
              </fieldset>

              {concentrated && (
                <label className="check check--warn" htmlFor="ack">
                  <input id="ack" type="checkbox" checked={ackConcentration} onChange={(e) => setAckConcentration(e.target.checked)} />
                  <span>This puts {Math.round(share * 100)}% of your starting money in one business. I understand that is more than the 25% most careful investors use.</span>
                </label>
              )}

              {error && <p className="field__error" role="alert">{error}</p>}
              <button type="submit" className="btn btn--primary btn--block">Review investment</button>
            </form>
          )}
        </aside>
      </div>
    </section>
  )
}
