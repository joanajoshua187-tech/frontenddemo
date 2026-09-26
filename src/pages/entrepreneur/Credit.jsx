import { useAppState } from '../../hooks/useAppState'
import { useProfile } from '../../hooks/useProfile'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ScoreDial } from '../../components/ScoreDial'
import { WhatIf } from '../../components/WhatIf'
import { Link } from 'react-router-dom'

export default function Credit() {
  useDocumentTitle('Score and trust')
  const { state } = useAppState()
  const profile = useProfile()
  const { credit, trust, series } = profile
  const uploads = state.ent.uploads.slice(-26)

  return (
    <div className="stack">
      <div className="two-col">
        <section className="card-block" aria-labelledby="score-title">
          <h2 id="score-title" className="h-section">Credit readiness score</h2>
          {credit ? (
            <>
              <ScoreDial score={credit.score} caption={`${credit.level.name}, ${credit.level.label}`} />
              <ul className="factor-list">
                {credit.factors.map((f) => (
                  <li key={f.label} className={f.kind === 'base' ? 'is-base' : f.points >= 0 ? 'is-plus' : 'is-minus'}>
                    <span>{f.label}</span>
                    <span className="num">{f.kind === 'base' ? f.points : f.points >= 0 ? `+${f.points}` : `−${Math.abs(f.points)}`}</span>
                  </li>
                ))}
                <li className="is-total"><span>Score</span><span className="num">{credit.score}</span></li>
              </ul>
              <p className="note">Fixed rules, shown in full on <Link to="/how-it-works">How it works</Link>. Gender, age, religion and location are never used.</p>
            </>
          ) : (
            <p className="empty">Add at least one month of records to get a score.</p>
          )}
        </section>

        <section className="card-block" aria-labelledby="trust-title">
          <h2 id="trust-title" className="h-section">Trust level</h2>
          <div className="trust-meter">
            <div className="trust-meter__bar" aria-hidden="true"><span style={{ width: `${trust.score}%` }} /></div>
            <p className="trust-meter__label"><strong>{trust.level}</strong> <span className="num">{trust.score} / 100</span></p>
            <ol className="trust-meter__steps" aria-hidden="true"><li>Building</li><li>Growing</li><li>Strong</li></ol>
          </div>
          <p className="muted">Trust grows when you upload records every week, connect verified sources and answer flagged lines quickly. Lenders see this alongside your score.</p>
          <ul className="factor-list">
            {trust.parts.map((p) => (
              <li key={p.label} className={p.points === p.max ? 'is-plus' : p.points === 0 ? 'is-minus' : ''}>
                <span>{p.label}</span><span className="num">{p.points}/{p.max}</span>
              </li>
            ))}
          </ul>
          <div className="upload-calendar">
            <p className="upload-calendar__title">Weekly uploads, last {uploads.length} weeks <span className="muted">· current streak <strong className="num">{trust.streak}</strong> {trust.streak === 1 ? 'week' : 'weeks'}</span></p>
            <ol className="upload-calendar__grid">
              {uploads.map((u) => (
                <li key={`${u.week}-${u.date}`} className={u.uploaded ? 'is-on' : 'is-off'} title={`Week of ${u.date}: ${u.uploaded ? `${u.lines} lines uploaded` : 'no upload'}`}>
                  <span className="visually-hidden">Week of {u.date}: {u.uploaded ? 'uploaded' : 'missed'}</span>
                </li>
              ))}
            </ol>
            <p className="legend-inline"><i className="dot dot--on" /> Uploaded <i className="dot dot--off" /> Missed</p>
          </div>
        </section>
      </div>

      {credit && (
        <WhatIf
          base={credit}
          inputs={{
            months: series.months,
            moneyIn: series.moneyIn,
            moneyOut: series.moneyOut,
            verifiedShare: profile.share,
            registered: true,
            mixedMoney: profile.mixedMoney,
            savingsFound: profile.saved > 0,
          }}
        />
      )}
    </div>
  )
}
