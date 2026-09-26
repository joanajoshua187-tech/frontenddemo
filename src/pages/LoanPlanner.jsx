import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../hooks/useAppState'
import { useAssessment } from '../hooks/useAssessment'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useToast } from '../hooks/useToast'
import { CountUpMoney } from '../components/ScoreDial'
import { SCORE_LEVELS } from '../utils/scoring'
import { LOAN_TERMS, LOAN_PURPOSES, ILLUSTRATIVE_RATES, monthlyInstalment, schedule, affordability } from '../utils/loan'
import { tsh, plain, roundDown } from '../utils/format'

export default function LoanPlanner() {
  useDocumentTitle('Plan a loan')
  const { state, dispatch } = useAppState()
  const notify = useToast()
  const report = useAssessment()
  const { level, kpis, monthlyRepayment, indicativeLoan, score } = report
  const rate = ILLUSTRATIVE_RATES[level.id]
  const nextLevel = SCORE_LEVELS.find((l) => l.min > score)

  const maxAmount = Math.max(100000, roundDown(Math.max(indicativeLoan * 1.5, level.cap), 50000))
  const [amount, setAmount] = useState(state.loanPlan?.amount ?? Math.max(100000, indicativeLoan))
  const [term, setTerm] = useState(state.loanPlan?.term ?? 12)
  const [purpose, setPurpose] = useState(state.loanPlan?.purpose ?? LOAN_PURPOSES[0])
  const [showSchedule, setShowSchedule] = useState(false)

  if (!rate) {
    return (
      <section className="page page--narrow">
        <Link to="/entrepreneur/report" className="back-link">Back to your report</Link>
        <h1 className="page__title">Build first, then borrow</h1>
        <p className="page__lede">
          Your score of {score} puts you at {level.name}. Borrowing now could put the business under pressure.
          Reach {SCORE_LEVELS[1].min} to unlock loan planning.
        </p>
        <ul className="plain-list">
          <li>Save {tsh(report.savings.weekly)} every week.</li>
          <li>Keep business money in its own account.</li>
          <li>Add three more months of records.</li>
        </ul>
      </section>
    )
  }

  const instalment = monthlyInstalment(amount, rate, term)
  const rows = schedule(amount, rate, term)
  const totalPaid = rows.reduce((s, r) => s + r.payment, 0)
  const totalInterest = totalPaid - amount
  const fit = affordability(instalment, monthlyRepayment, kpis.surplus)
  const shareOfProfit = Math.min(1.5, instalment / kpis.surplus)
  const slowIndex = report.moneyIn.indexOf(Math.min(...report.moneyIn))
  const slowSurplus = report.moneyIn[slowIndex] - report.moneyOut[slowIndex]

  const shorter = LOAN_TERMS.filter((t) => t < term).pop()
  const longer = LOAN_TERMS.find((t) => t > term)
  const tips = []
  if (fit.tone !== 'good' && longer) {
    const alt = monthlyInstalment(amount, rate, longer)
    tips.push(`Over ${longer} months the instalment drops to ${tsh(alt)}.`)
  }
  if (fit.tone === 'good' && shorter) {
    const altRows = schedule(amount, rate, shorter)
    const altInterest = altRows.reduce((s, r) => s + r.payment, 0) - amount
    if (monthlyInstalment(amount, rate, shorter) <= monthlyRepayment) {
      tips.push(`You could afford ${shorter} months instead and save ${tsh(totalInterest - altInterest)} in interest.`)
    }
  }
  if (nextLevel && ILLUSTRATIVE_RATES[nextLevel.id]) {
    tips.push(`Reach a score of ${nextLevel.min} (${nextLevel.min - score} points away) and lenders may offer rates closer to ${Math.round(ILLUSTRATIVE_RATES[nextLevel.id] * 100)}% a year.`)
  }
  tips.push(`Your slowest month was ${report.months[slowIndex]}, when the business kept ${tsh(slowSurplus)}. Keep at least one instalment saved before you borrow.`)

  function save() {
    dispatch({ type: 'loan/planned', plan: { amount, term, purpose, rate, instalment, totalInterest } })
    notify('Loan plan saved to your report.')
  }

  return (
    <section className="page">
      <Link to="/entrepreneur/report" className="back-link">Back to your report</Link>
      <header className="report-head">
        <div>
          <p className="report-head__kicker">Loan planner · {state.business.businessName}</p>
          <h1 className="page__title">Plan a loan you can repay</h1>
          <p className="page__lede">
            Your score of <strong>{score}</strong> puts you at <strong>{level.name}, {level.label}</strong>.
            We suggest borrowing up to <strong className="num">{tsh(indicativeLoan)}</strong> with instalments under <strong className="num">{tsh(monthlyRepayment)}</strong> a month.
          </p>
        </div>
      </header>

      <div className="planner">
        <div className="planner__inputs">
          <div className="slider">
            <div className="slider__top">
              <label htmlFor="loan-amount">How much do you want to borrow?</label>
              <output htmlFor="loan-amount" className="slider__value num">{tsh(amount)}</output>
            </div>
            <input
              id="loan-amount"
              type="range"
              min={100000}
              max={maxAmount}
              step={50000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{ '--fill': `${((amount - 100000) / (maxAmount - 100000)) * 100}%` }}
            />
            <div className="slider__marks num">
              <span>{plain(100000)}</span>
              <span className="slider__suggested" style={{ left: `${((indicativeLoan - 100000) / (maxAmount - 100000)) * 100}%` }}>Suggested</span>
              <span>{plain(maxAmount)}</span>
            </div>
          </div>

          <fieldset className="segmented">
            <legend>Repay over</legend>
            <div className="segmented__options segmented__options--five">
              {LOAN_TERMS.map((t) => (
                <label key={t} className={`segmented__option ${term === t ? 'is-selected' : ''}`}>
                  <input type="radio" name="loan-term" value={t} checked={term === t} onChange={() => setTerm(t)} />
                  {t} months
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field">
            <label htmlFor="loan-purpose">What is the loan for?</label>
            <select id="loan-purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              {LOAN_PURPOSES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div className="planner__tips">
            <h2>Ways to make this plan stronger</h2>
            <ul className="plain-list">
              {tips.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
        </div>

        <div className={`planner__result planner__result--${fit.tone}`} aria-live="polite">
          <p className="planner__label">Monthly instalment</p>
          <p className="planner__big num"><CountUpMoney value={instalment} /></p>
          <p className={`fit fit--${fit.tone}`}>{fit.label}</p>
          <p className="planner__fit-text">{fit.text}</p>

          <div className="share-meter" aria-hidden="true">
            <span className="share-meter__fill" style={{ width: `${Math.min(100, (shareOfProfit / 1.5) * 100)}%` }} />
            <span className="share-meter__safe" style={{ left: `${(0.35 / 1.5) * 100}%` }} />
          </div>
          <p className="note">Uses {Math.round((instalment / kpis.surplus) * 100)}% of the {tsh(kpis.surplus)} the business keeps each month. The line marks 35%.</p>

          <dl className="planner__facts">
            <div><dt>Total you repay</dt><dd className="num">{tsh(totalPaid)}</dd></div>
            <div><dt>Total interest</dt><dd className="num">{tsh(totalInterest)}</dd></div>
            <div><dt>Illustrative rate</dt><dd className="num">{Math.round(rate * 100)}% a year</dd></div>
          </dl>
          <div className="actions actions--stack">
            <button type="button" className="btn btn--primary" onClick={save}>Save this plan to my report</button>
            <button type="button" className="btn btn--ghost" onClick={() => setShowSchedule((v) => !v)} aria-expanded={showSchedule} aria-controls="loan-schedule">
              {showSchedule ? 'Hide' : 'Show'} month-by-month schedule
            </button>
          </div>
        </div>
      </div>

      {showSchedule && (
        <div className="table-wrap" id="loan-schedule">
          <table className="data-table">
            <thead>
              <tr><th scope="col">Month</th><th scope="col" className="num-col">Instalment</th><th scope="col" className="num-col">Interest</th><th scope="col" className="num-col">Towards the loan</th><th scope="col" className="num-col">Still owed</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.month}>
                  <th scope="row" className="num">{r.month}</th>
                  <td className="num-col num">{plain(r.payment)}</td>
                  <td className="num-col num">{plain(r.interest)}</td>
                  <td className="num-col num">{plain(r.principal)}</td>
                  <td className="num-col num">{plain(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="note report-disclaimer">
        Rates here are illustrative, chosen to show how your level can change the cost of borrowing. Each lender sets its own rate and fees and makes its own decision.
      </p>
    </section>
  )
}
