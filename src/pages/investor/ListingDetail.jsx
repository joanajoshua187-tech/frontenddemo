import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppState } from '../../hooks/useAppState'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useToast } from '../../hooks/useToast'
import { useSpeak } from '../../hooks/useSpeak'
import { findListing } from '../../data/listings'
import { lessons } from '../../data/lessons'
import { explainRisk, fitFor, requiredLessons } from '../../utils/risk'
import { tsh, plain } from '../../utils/format'
import { Icon } from '../../components/Icon'
import NotFound from '../NotFound'

export default function ListingDetail() {
  const { id } = useParams()
  const listing = findListing(id)
  useDocumentTitle(listing ? listing.name : 'Not found')
  if (!listing) return <NotFound />
  return <Detail key={listing.id} listing={listing} />
}

function Detail({ listing }) {
  const { state, dispatch } = useAppState()
  const notify = useToast()
  const speak = useSpeak()
  const navigate = useNavigate()
  const inv = state.inv
  const [lang, setLang] = useState('en')
  const [units, setUnits] = useState(Math.max(1, Math.round(50000 / listing.unitPrice)))
  const [answer, setAnswer] = useState('')
  const [ack, setAck] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [error, setError] = useState('')

  const fit = fitFor(listing, inv.investor)
  const gates = requiredLessons(listing).filter((g) => !inv.lessonsDone.includes(g))
  const left = listing.units - listing.unitsSold
  const maxUnits = Math.max(1, Math.min(left, Math.floor(inv.wallet.balance / listing.unitPrice)))
  const cost = units * listing.unitPrice
  const held = inv.holdings.find((h) => h.listingId === listing.id)?.cost ?? 0
  const share = (held + cost) / inv.wallet.starting
  const overLimit = share > inv.investor.maxShare
  const years = listing.lockMonths / 12
  const text = explainRisk(listing, inv.investor, lang)

  function review(event) {
    event.preventDefault()
    if (!Number.isInteger(units) || units < 1) return setError('Choose at least one unit.')
    if (cost > inv.wallet.balance) return setError('That costs more than the demo money in your wallet.')
    if (units > left) return setError(`Only ${left} units are left.`)
    if (answer !== 'no') return setError('Answer the lock-up question correctly first.')
    if (overLimit && !ack) return setError('Confirm that you understand this is above your profile limit.')
    setError('')
    setReviewing(true)
  }

  function confirm() {
    dispatch({ type: 'inv/buy', listingId: listing.id, units })
    notify(`You bought ${units} units of ${listing.name} for ${tsh(cost)} of demo money.`)
    navigate('/investor/app/portfolio')
  }

  return (
    <div className="stack">
      <Link to="/investor/app/market" className="back-link">Back to verified businesses</Link>
      <div className="flow flow--tight">
        <div className="flow__main">
          <p className="eyebrow">{listing.category} · {listing.place}{listing.sandbox ? ' · regulatory sandbox' : ''}</p>
          <h2 className="page__title">{listing.name}</h2>
          <p className="page__lede">{listing.purpose}</p>

          <dl className="kpi-row kpi-row--four">
            <div><dt>One unit</dt><dd className="num">{tsh(listing.unitPrice)}</dd></div>
            <div><dt>Units left</dt><dd className="num">{plain(left)} of {plain(listing.units)}</dd></div>
            <div><dt>Money locked for</dt><dd className="num">{listing.lockMonths} months</dd></div>
            <div><dt>{listing.score ? 'Readiness score' : 'Trust'}</dt><dd className="num">{listing.score ? `${listing.score} / 100` : listing.trust}</dd></div>
          </dl>

          <section className="ai-explain" aria-labelledby="risk-ai">
            <div className="ai-explain__head">
              <h3 id="risk-ai"><span className="ai-dot" aria-hidden="true" /> Risk in plain words</h3>
              <div className="row-actions">
                <div className="lang-switch" role="group" aria-label="Language">
                  <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
                  <button type="button" aria-pressed={lang === 'sw'} onClick={() => setLang('sw')}>SW</button>
                </div>
                <button type="button" className="btn btn--ghost btn--small" onClick={() => speak(text, lang)}><Icon name="speaker" size={16} /> Listen</button>
              </div>
            </div>
            <p lang={lang}>{text}</p>
            <div className="risk-gauge" aria-label={`Risk score ${listing.riskScore} out of 100`}>
              <div className="risk-gauge__bar"><span style={{ left: `${listing.riskScore}%` }} /></div>
              <div className="risk-gauge__labels"><span>Lower</span><span>Medium</span><span>Higher</span></div>
            </div>
            <p className="note">Written from this listing’s verified data with fixed rules. It explains; it does not recommend.</p>
          </section>

          <section className="detail-block">
            <h3>What could go wrong</h3>
            <ul className="risk-list">
              {listing.riskFactors.map((r) => (
                <li key={r.label}>
                  <span className={`risk-pill risk-pill--${r.level.toLowerCase()}`}>{r.level}</span>
                  <span><strong>{r.label}.</strong> {r.explain}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="detail-block">
            <h3>What was verified</h3>
            <ul className="check-list">
              {listing.verifiedBy.map((v) => (
                <li key={v}><span className="check-list__icon"><Icon name="check" label="Verified" /></span><span>{v}</span></li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="flow__aside invest-box" aria-labelledby="buy-title">
          <h3 id="buy-title">Buy units with demo money</h3>
          <p className="note">Wallet: <strong className="num">{tsh(inv.wallet.balance)}</strong></p>

          {gates.length > 0 ? (
            <div className="locked">
              <p><Icon name="lock" size={16} /> <strong>Locked until you finish {gates.length === 1 ? 'this lesson' : 'these lessons'}</strong></p>
              <ul className="plain-list">
                {gates.map((g) => <li key={g}>{lessons.find((l) => l.id === g)?.title}</li>)}
              </ul>
              <p className="note">{listing.sandbox ? 'Digital assets work differently from a business. Learn the basics first.' : 'Higher-risk opportunities need these lessons first.'}</p>
              <Link to="/investor/app/learn" className="btn btn--primary btn--block">Go to lessons</Link>
            </div>
          ) : reviewing ? (
            <div className="invest-review">
              <p>You are buying <strong className="num">{units}</strong> units of <strong>{listing.name}</strong> for <strong className="num">{tsh(cost)}</strong> of demo money, locked for {listing.lockMonths} months.</p>
              <div className="actions actions--stack">
                <button type="button" className="btn btn--primary" onClick={confirm}>Confirm purchase</button>
                <button type="button" className="btn btn--ghost" onClick={() => setReviewing(false)}>Change</button>
              </div>
            </div>
          ) : (
            <form className="form form--compact" onSubmit={review} noValidate>
              <div className="stepper-input">
                <button type="button" aria-label="One unit fewer" onClick={() => setUnits((u) => Math.max(1, u - 1))}>−</button>
                <label htmlFor="units" className="visually-hidden">Units</label>
                <input id="units" type="number" inputMode="numeric" min="1" max={maxUnits} value={units} onChange={(e) => { setUnits(Math.max(1, Math.floor(Number(e.target.value) || 1))); setError('') }} />
                <button type="button" aria-label="One unit more" onClick={() => setUnits((u) => Math.min(maxUnits, u + 1))}>+</button>
                <span className="stepper-input__unit">units</span>
              </div>
              <input
                type="range"
                aria-label="Units"
                min="1"
                max={maxUnits}
                value={Math.min(units, maxUnits)}
                onChange={(e) => { setUnits(Number(e.target.value)); setError('') }}
                style={{ '--fill': `${((Math.min(units, maxUnits) - 1) / Math.max(1, maxUnits - 1)) * 100}%` }}
              />
              <p className="cost-line">Cost <strong className="num">{tsh(cost)}</strong> <span className="muted">· {Math.round(share * 100)}% of your wallet</span></p>

              <div className="projection" aria-live="polite">
                <p className="projection__title">After {listing.lockMonths} months, if it does as well as similar ones</p>
                <div className="projection__bars">
                  <div><span>Lower end</span><strong className="num">{tsh(cost * (1 + (listing.returnLow / 100) * years))}</strong></div>
                  <div><span>Higher end</span><strong className="num">{tsh(cost * (1 + (listing.returnHigh / 100) * years))}</strong></div>
                </div>
                <p className="projection__warn">You could also get back less than {tsh(cost)}, or nothing.</p>
              </div>

              {!fit.fits && <p className="fit fit--no"><Icon name="alert" size={14} /> Outside your profile: {fit.reasons.join('; ')}.</p>}

              <fieldset className="choice-group">
                <legend>Can you take this money out before {listing.lockMonths} months?</legend>
                <div className="choice-group__options choice-group__options--row">
                  {[['yes', 'Yes'], ['no', 'No']].map(([v, l]) => (
                    <label key={v} className={`choice choice--small ${answer === v ? 'is-selected' : ''}`}>
                      <input type="radio" name="lockup" value={v} checked={answer === v} onChange={() => { setAnswer(v); setError('') }} />
                      <span className="choice__title">{l}</span>
                    </label>
                  ))}
                </div>
                {answer === 'yes' && <p className="field__error">Not quite. The money is locked for {listing.lockMonths} months.</p>}
                {answer === 'no' && <p className="field__ok">Correct.</p>}
              </fieldset>

              {overLimit && (
                <label className="check check--warn" htmlFor="ack">
                  <input id="ack" type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
                  <span>This puts {Math.round(share * 100)}% of your wallet in one opportunity. Your {inv.investor.riskProfile.toLowerCase()} profile suggests at most {Math.round(inv.investor.maxShare * 100)}%. I understand.</span>
                </label>
              )}
              {error && <p className="field__error" role="alert">{error}</p>}
              <button type="submit" className="btn btn--primary btn--block">Review purchase</button>
            </form>
          )}
        </aside>
      </div>
    </div>
  )
}
