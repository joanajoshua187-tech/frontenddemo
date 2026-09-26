import { useState } from 'react'
import { useAppState } from '../../hooks/useAppState'
import { useApplicants } from '../../hooks/useApplicants'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useToast } from '../../hooks/useToast'
import { CashflowChart } from '../../components/CashflowChart'
import { Icon } from '../../components/Icon'
import { derive, recommendation } from '../../utils/applicant'
import { monthlyPaymentAnnual } from '../../data/lender'
import { tsh, roundDown } from '../../utils/format'

const TERMS = [6, 9, 12, 18, 24]

function statusOf(decision) {
  if (!decision) return { label: 'Waiting', cls: 'tag--warn' }
  if (decision.decision === 'offer') return { label: 'Offer sent', cls: 'tag--good' }
  if (decision.decision === 'info') return { label: 'More info asked', cls: '' }
  return { label: 'Declined', cls: 'tag--brand' }
}

export default function Applications() {
  useDocumentTitle('Lender applications')
  const { state } = useAppState()
  const applicants = useApplicants()
  const [selected, setSelected] = useState(() => applicants.find((a) => !state.lend.decisions[a.id])?.id ?? applicants[0].id)
  const current = applicants.find((a) => a.id === selected) ?? applicants[0]

  return (
    <div className="lender">
      <ul className="lender__queue" aria-label="Shared profiles">
        {applicants.map((a) => {
          const st = statusOf(state.lend.decisions[a.id])
          return (
            <li key={a.id}>
              <button type="button" className={`applicant ${a.id === current.id ? 'is-active' : ''}`} onClick={() => setSelected(a.id)} aria-pressed={a.id === current.id}>
                <span className="applicant__top">
                  <span className="applicant__name">{a.business}</span>
                  {a.live && <span className="live-dot">Live</span>}
                </span>
                <span className="applicant__meta">{a.sector} · {a.region}</span>
                <span className="applicant__row">
                  <span className="num">Score {a.score}</span>
                  <span>Trust {a.trust.level}</span>
                  <span className={`tag ${st.cls}`}>{st.label}</span>
                </span>
                <span className="applicant__ask num">Asks {tsh(a.request.amount)} · {a.request.months} mo</span>
              </button>
            </li>
          )
        })}
      </ul>
      <Detail key={current.id} app={current} />
    </div>
  )
}

function Detail({ app }) {
  const { state, dispatch } = useAppState()
  const notify = useToast()
  const d = derive(app)
  const rec = recommendation(app, d)
  const decision = state.lend.decisions[app.id]
  const maxOffer = d.rate ? roundDown((d.capacity * (1 - (1 + d.rate / 12) ** -12)) / (d.rate / 12), 50000) : 0
  const [mode, setMode] = useState(rec.kind)
  const [amount, setAmount] = useState(Math.max(100000, Math.min(app.request.amount, maxOffer || app.request.amount)))
  const [months, setMonths] = useState(TERMS.includes(app.request.months) ? app.request.months : 12)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const instalment = d.rate ? monthlyPaymentAnnual(amount, d.rate, months) : 0
  const load = d.capacity ? instalment / d.capacity : 1

  function submit(event) {
    event.preventDefault()
    if (mode !== 'offer' && !note.trim()) return setError('Write a short note so the owner knows what to do next.')
    if (mode === 'offer' && (!d.rate || amount < 100000)) return setError('This profile is below the lending threshold.')
    setError('')
    dispatch({ type: 'lend/decide', id: app.id, business: app.business, decision: mode, offer: mode === 'offer' ? { amount, months, rate: d.rate, instalment } : null, note: note.trim() })
    notify(mode === 'offer' ? `Offer sent to ${app.business}.` : mode === 'info' ? `Request sent to ${app.business}.` : `${app.business} declined with a note.`, mode === 'offer' ? 'good' : 'info')
  }

  return (
    <section className="lender__detail" aria-labelledby="app-title">
      <header className="lender__head">
        <div>
          <p className="eyebrow">{app.live ? 'Shared from the entrepreneur workspace just now' : `Shared ${new Date(app.sharedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}</p>
          <h2 id="app-title" className="h-section">{app.business}</h2>
          <p className="muted">{app.sector} · {app.region} · owner {app.owner}</p>
        </div>
        <div className="lender__chips">
          <span className="tag tag--good"><Icon name="check" size={14} /> BRELA, TRA, licence, NIDA passed</span>
        </div>
      </header>

      <dl className="metric-grid">
        <div><dt>Credit readiness</dt><dd className="num">{app.score}<small>/100</small></dd><span>{app.level}</span></div>
        <div><dt>Trust level</dt><dd>{app.trust.level}</dd><span className="num">{app.trust.score}/100 · {app.trust.streak}-week streak</span></div>
        <div><dt>Kept each month</dt><dd className="num">{tsh(d.surplus)}</dd><span className="num">of {tsh(d.avgIn)} sales</span></div>
        <div><dt>Repayment capacity</dt><dd className="num">{tsh(d.capacity)}</dd><span>35% of what the business keeps</span></div>
        <div><dt>Verified at source</dt><dd className="num">{Math.round(app.verifiedShare * 100)}%</dd><span>of sales, by bank or telco</span></div>
        <div><dt>Open flags</dt><dd className={`num ${app.openFlags ? 'is-loss' : ''}`}>{app.openFlags}</dd><span>{app.openFlags ? 'Waiting for the owner' : 'All answered'}</span></div>
      </dl>

      <div className="card-block">
        <h3 className="h-sub">Money in and out, {app.months[0]} to {app.months[app.months.length - 1]}</h3>
        <CashflowChart months={app.months} moneyIn={app.moneyIn} moneyOut={app.moneyOut} />
      </div>

      {app.factors && (
        <div className="two-col">
          <div className="card-block">
            <h3 className="h-sub">Why the score is {app.score}</h3>
            <ul className="factor-list">
              {app.factors.map((f) => (
                <li key={f.label} className={f.kind === 'base' ? 'is-base' : f.points >= 0 ? 'is-plus' : 'is-minus'}>
                  <span>{f.label}</span><span className="num">{f.kind === 'base' ? f.points : f.points >= 0 ? `+${f.points}` : `−${Math.abs(f.points)}`}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-block">
            <h3 className="h-sub">Why trust is {app.trust.level}</h3>
            <ul className="factor-list">
              {app.trustParts.map((p) => <li key={p.label}><span>{p.label}</span><span className="num">{p.points}/{p.max}</span></li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="request">
        <p><strong>The owner asks for {tsh(app.request.amount)} over {app.request.months} months.</strong> {app.request.purpose}.</p>
      </div>

      <div className={`suggest suggest--${rec.kind}`}>
        <span className="ai-dot" aria-hidden="true" />
        <p><strong>Onekana suggests:</strong> {rec.text} <span className="muted">This follows fixed rules. Your credit team decides.</span></p>
      </div>

      {decision ? (
        <div className="decision-done">
          <p>
            <strong>{statusOf(decision).label}.</strong>{' '}
            {decision.offer ? `${tsh(decision.offer.amount)} over ${decision.offer.months} months at ${Math.round(decision.offer.rate * 100)}% a year, ${tsh(decision.offer.instalment)} a month.` : decision.note}
          </p>
          <p className="muted">{app.live ? 'The owner sees this in their workspace now.' : 'The owner is notified in their workspace.'}</p>
          <button type="button" className="btn btn--ghost btn--small" onClick={() => dispatch({ type: 'lend/undo', id: app.id, business: app.business })}>Reopen decision</button>
        </div>
      ) : (
        <form className="decide" onSubmit={submit} noValidate>
          <div className="segmented" role="radiogroup" aria-label="Decision">
            <div className="segmented__options">
              {[['offer', 'Make an offer'], ['info', 'Ask for more'], ['decline', 'Decline']].map(([v, l]) => (
                <label key={v} className={`segmented__option ${mode === v ? 'is-selected' : ''}`}>
                  <input type="radio" name="decision" value={v} checked={mode === v} onChange={() => { setMode(v); setError('') }} />
                  {l}
                </label>
              ))}
            </div>
          </div>

          {mode === 'offer' && (
            <div className="offer-builder">
              {!d.rate ? (
                <p className="field__error">This score is below the lending threshold, so no offer can be made.</p>
              ) : (
                <>
                  <div className="slider">
                    <div className="slider__top"><label htmlFor="offer-amt">Amount</label><output htmlFor="offer-amt" className="slider__value num">{tsh(amount)}</output></div>
                    <input id="offer-amt" type="range" min="100000" max={Math.max(200000, roundDown(app.request.amount * 1.5, 50000))} step="50000" value={amount} onChange={(e) => setAmount(Number(e.target.value))} style={{ '--fill': `${((amount - 100000) / Math.max(1, roundDown(app.request.amount * 1.5, 50000) - 100000)) * 100}%` }} />
                  </div>
                  <div className="chip-row" role="group" aria-label="Term">
                    {TERMS.map((t) => <button key={t} type="button" className={`chip-button ${months === t ? 'is-selected' : ''}`} aria-pressed={months === t} onClick={() => setMonths(t)}>{t} months</button>)}
                  </div>
                  <dl className="offer-sum">
                    <div><dt>Rate for this level</dt><dd className="num">{Math.round(d.rate * 100)}% a year</dd></div>
                    <div><dt>Monthly instalment</dt><dd className="num">{tsh(instalment)}</dd></div>
                    <div><dt>Share of capacity</dt><dd className={`num ${load > 1 ? 'is-loss' : 'is-in'}`}>{Math.round(load * 100)}%</dd></div>
                  </dl>
                  {load > 1 && <p className="field__error">This instalment is above what the business can carry. Lower the amount or lengthen the term.</p>}
                  <p className="note">Illustrative rates. Your bank applies its own pricing and checks, including a credit bureau report.</p>
                </>
              )}
            </div>
          )}

          <div className="field">
            <label htmlFor="lender-note">{mode === 'offer' ? 'Note to the owner (optional)' : 'Note to the owner'}</label>
            <textarea id="lender-note" rows="3" value={note} onChange={(e) => { setNote(e.target.value); setError('') }} placeholder={mode === 'info' ? 'For example: please connect your M-Pesa account and answer the open flag.' : mode === 'decline' ? 'For example: build three more months of records and reapply.' : 'For example: visit our Kariakoo branch to sign.'} />
          </div>
          {error && <p className="field__error" role="alert">{error}</p>}
          <button type="submit" className="btn btn--primary">{mode === 'offer' ? 'Send offer' : mode === 'info' ? 'Send request' : 'Decline with note'}</button>
        </form>
      )}
    </section>
  )
}
