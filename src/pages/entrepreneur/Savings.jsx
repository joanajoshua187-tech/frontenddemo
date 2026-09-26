import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../../hooks/useAppState'
import { useProfile } from '../../hooks/useProfile'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useToast } from '../../hooks/useToast'
import { useSpeak } from '../../hooks/useSpeak'
import { Icon } from '../../components/Icon'
import { tsh } from '../../utils/format'
import { INSURANCE_RATE } from '../../utils/profile'

export default function Savings() {
  useDocumentTitle('Savings advice')
  const { dispatch } = useAppState()
  const profile = useProfile()
  const notify = useToast()
  const speak = useSpeak()
  const [lang, setLang] = useState('en')
  const plan = profile.savingsPlan

  if (!plan) {
    return (
      <div className="empty-state">
        <h2>Savings advice needs your records</h2>
        <p>Once there is a month of sales, the AI works out how much you can save each week without hurting the business.</p>
        <Link to="/entrepreneur/app/records" className="btn btn--primary">Add records</Link>
      </div>
    )
  }

  const saved = profile.saved
  const hadSavings = saved > 0
  const stock = profile.credit.kpis.avgOut * 0.6

  return (
    <div className="stack">
      <section className="save-hero">
        <div>
          <p className="eyebrow">AI savings advice</p>
          <h2 className="save-hero__amount num">{tsh(plan.weekly)} <span>a week</span></h2>
          <p>That is 20% of what your business keeps. Your busiest day is <strong>{plan.day.en}</strong>, so save then.</p>
        </div>
        <div className="save-hero__action">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              dispatch({ type: 'ent/saving', amount: plan.weekly })
              notify(hadSavings ? `Saved ${tsh(plan.weekly)}. Keep the habit going.` : `Saved ${tsh(plan.weekly)}. Your score just went up because you now have a savings habit.`)
            }}
          >
            I saved {tsh(plan.weekly)} this week
          </button>
          <p className="note">Recorded as a savings entry in your ledger.</p>
        </div>
      </section>

      <section className="card-block" aria-labelledby="goals-title">
        <h2 id="goals-title" className="h-section">Your goals</h2>
        <ul className="goal-list">
          {plan.goals.map((g, i) => {
            const have = i === 0 ? saved : Math.max(0, saved - plan.goals[0].target)
            const pct = g.target ? Math.min(100, (have / g.target) * 100) : 0
            const weeks = plan.weekly ? Math.ceil(Math.max(0, g.target - have) / plan.weekly) : null
            return (
              <li key={g.id} className="goal-item">
                <div className="goal-item__top"><strong>{g.title}</strong><span className="num">{tsh(have)} of {tsh(g.target)}</span></div>
                <div className="goal__bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
                <p className="muted">{g.note} {weeks !== null && `About ${weeks} weeks at ${tsh(plan.weekly)} a week.`}</p>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="ai-explain" aria-labelledby="tips-title">
        <div className="ai-explain__head">
          <h2 id="tips-title"><span className="ai-dot" aria-hidden="true" /> Advice from your records</h2>
          <div className="row-actions">
            <div className="lang-switch" role="group" aria-label="Language">
              <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
              <button type="button" aria-pressed={lang === 'sw'} onClick={() => setLang('sw')}>SW</button>
            </div>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => speak(plan.tips.map((t) => t[lang]).join(' '), lang)}><Icon name="speaker" size={16} /> Listen</button>
          </div>
        </div>
        <ol className="advice-list" lang={lang}>
          {plan.tips.map((t) => <li key={t.en}><p>{t[lang]}</p></li>)}
        </ol>
      </section>

      <section className="card-block" aria-labelledby="protect-title">
        <h2 id="protect-title" className="h-section">Protect what you save</h2>
        <p className="muted">
          You buy about {tsh(stock)} of fabric and thread a month. Stock and fire cover for roughly {tsh(stock * 2)} of stock would cost about
          <strong className="num"> {tsh(Math.round((stock * 2 * INSURANCE_RATE) / 500) * 500)}</strong> a month. A fire or theft would otherwise wipe out months of savings.
        </p>
        <p className="note">Illustrative premium. An insurer sets the real price after its own check.</p>
      </section>
    </div>
  )
}
