import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../hooks/useAppState'
import { useAssessment } from '../hooks/useAssessment'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useToast } from '../hooks/useToast'
import { Stepper } from '../components/Stepper'
import { ScoreDial } from '../components/ScoreDial'
import { CashflowChart } from '../components/CashflowChart'
import { RichText } from '../components/RichText'
import { Icon } from '../components/Icon'
import { WhatIf } from '../components/WhatIf'
import { FLOW_STEPS } from '../data/flow'
import { tsh, percent } from '../utils/format'

export default function EntrepreneurReport() {
  useDocumentTitle('Business report')
  const { state, dispatch } = useAppState()
  const notify = useToast()
  const report = useAssessment()
  const [sharing, setSharing] = useState(false)
  const [agree, setAgree] = useState(false)

  const { kpis, level, savings, trust } = report
  const advice = [
    `<b>Keep business money separate.</b> Open a business account and pay every sale into it. This removes the biggest minus in your score.`,
    `<b>Save ${tsh(savings.weekly)} every week.</b> That is 20% of what the business keeps. In ${savings.monthsToTarget} months you will have ${tsh(savings.emergencyTarget)}, two months of costs.`,
    `<b>Plan stock for July.</b> Your best month was August, when parents buy uniforms. Buying fabric early avoids paying peak prices.`,
    `<b>Borrow no more than ${tsh(report.monthlyRepayment)} a month in repayments.</b> Above that, one slow month could leave you short.`,
  ]

  return (
    <section className="page">
      <Stepper steps={FLOW_STEPS} current={3} />
      <header className="report-head">
        <div>
          <p className="report-head__kicker">Business report · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <h1 className="page__title">{state.business.businessName}</h1>
          <p className="report-head__meta">{state.business.sector} · {state.business.region} · <span className="tag tag--good">Registered and verified</span></p>
        </div>
        <Link to="/entrepreneur/records" className="btn btn--ghost btn--small">Add more records</Link>
      </header>

      <div className="report-grid">
        <section className="report-card report-card--score" aria-labelledby="score-title">
          <h2 id="score-title" className="report-card__title">Credit readiness score</h2>
          <ScoreDial score={report.score} caption={`${level.name}, ${level.label}`} />
          <ul className="factor-list">
            {report.factors.map((f) => (
              <li key={f.label} className={f.kind === 'base' ? 'is-base' : f.points >= 0 ? 'is-plus' : 'is-minus'}>
                <span>{f.label}</span>
                <span className="num">{f.kind === 'base' ? f.points : f.points >= 0 ? `+${f.points}` : `−${Math.abs(f.points)}`}</span>
              </li>
            ))}
            <li className="is-total"><span>Score</span><span className="num">{report.score}</span></li>
          </ul>
        </section>

        <section className="report-card" aria-labelledby="loan-title">
          <h2 id="loan-title" className="report-card__title">Loan level</h2>
          <p className="big-figure num">{tsh(report.indicativeLoan)}</p>
          <p className="report-card__sub">Indicative amount at {level.name}, {level.label}</p>
          <dl className="mini-facts mini-facts--stack">
            <div><dt>Monthly repayment you can carry</dt><dd className="num">{tsh(report.monthlyRepayment)}</dd></div>
            <div><dt>How we worked it out</dt><dd>35% of {tsh(kpis.surplus)} kept each month, times 12, capped at {tsh(level.cap)}</dd></div>
          </dl>
          <p className="note">{level.note} This is not a loan offer. A lender decides.</p>
        </section>

        <section className="report-card" aria-labelledby="save-title">
          <h2 id="save-title" className="report-card__title">Savings plan</h2>
          <p className="big-figure num">{tsh(savings.weekly)}<span> a week</span></p>
          <p className="report-card__sub">{tsh(savings.monthly)} a month, 20% of what the business keeps</p>
          <div className="goal">
            <div className="goal__bar" aria-hidden="true"><span style={{ width: `${Math.min(100, 100 / savings.monthsToTarget)}%` }} /></div>
            <p>First goal: an emergency fund of <strong className="num">{tsh(savings.emergencyTarget)}</strong>, two months of costs, reached in about {savings.monthsToTarget} months.</p>
          </div>
        </section>

        <section className="report-card report-card--span2" aria-labelledby="trust-title">
          <h2 id="trust-title" className="report-card__title">Records trust</h2>
          <p className="big-figure">{trust.label}</p>
          <p className="report-card__sub">{percent(trust.share)} of figures confirmed by mobile money records</p>
          <ul className="plain-list">
            <li>Registration, TIN and licence verified</li>
            <li>Owner identity matched with NIDA</li>
            <li>Every flagged line checked by the owner</li>
          </ul>
        </section>

        <section className="report-card report-card--wide" aria-labelledby="cash-title">
          <h2 id="cash-title" className="report-card__title">Money in and out, {report.months[0]} to {report.months[report.months.length - 1]}</h2>
          <dl className="kpi-row">
            <div><dt>Average sales a month</dt><dd className="num">{tsh(kpis.avgIn)}</dd></div>
            <div><dt>Average costs a month</dt><dd className="num">{tsh(kpis.avgOut)}</dd></div>
            <div><dt>Kept each month</dt><dd className="num">{tsh(kpis.surplus)}</dd></div>
            <div><dt>Kept from each 100 sold</dt><dd className="num">{Math.round(kpis.margin * 100)}</dd></div>
          </dl>
          <CashflowChart months={report.months} moneyIn={report.moneyIn} moneyOut={report.moneyOut} />
        </section>

        <section className="report-card report-card--wide" aria-labelledby="advice-title">
          <h2 id="advice-title" className="report-card__title">Advice for the next three months</h2>
          <ol className="advice-list">
            {advice.map((a) => <li key={a}><RichText html={a} as="p" /></li>)}
          </ol>
        </section>
      </div>

      <WhatIf
        base={report}
        inputs={{
          months: report.months,
          moneyIn: report.moneyIn,
          moneyOut: report.moneyOut,
          verifiedShare: state.extraction.verifiedShare,
          registered: state.verification?.status === 'verified',
          mixedMoney: state.extraction.mixedMoney,
          savingsFound: state.extraction.savingsFound,
        }}
      />

      <section className="share-panel" aria-labelledby="share-title">
        <h2 id="share-title">Share with a lender</h2>
        {state.shared ? (
          <p className="ok-box" role="status"><Icon name="check" /> Report shared. The lender sees this report and the checks that passed, not your NIDA number or photos.</p>
        ) : sharing ? (
          <div className="share-panel__confirm">
            <label className="check" htmlFor="share-consent">
              <input id="share-consent" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>I agree to share this report with the lender I choose. I can withdraw this at any time.</span>
            </label>
            <div className="actions">
              <button type="button" className="btn btn--primary" disabled={!agree} onClick={() => { dispatch({ type: 'report/shared' }); notify('Report shared with the lender.') }}>Share report</button>
              <button type="button" className="btn btn--ghost" onClick={() => setSharing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="actions">
            <p>Nothing leaves your account until you choose to share it.</p>
            <button type="button" className="btn btn--secondary" onClick={() => setSharing(true)}>Share this report</button>
          </div>
        )}
      </section>

      <p className="note report-disclaimer">
        The score and loan level come from the fixed rules on the <Link to="/how-it-works">How it works</Link> page, applied to the records you confirmed.
        They are not a credit bureau report or a loan offer.
      </p>
    </section>
  )
}
