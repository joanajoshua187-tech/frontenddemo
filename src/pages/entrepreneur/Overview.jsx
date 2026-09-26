import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../../hooks/useAppState'
import { useProfile } from '../../hooks/useProfile'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useToast } from '../../hooks/useToast'
import { CashflowChart } from '../../components/CashflowChart'
import { useSpeak } from '../../hooks/useSpeak'
import { Icon } from '../../components/Icon'
import { tsh } from '../../utils/format'

const LINKS = { finance: '/entrepreneur/app/loan', savings: '/entrepreneur/app/savings', insurance: '/entrepreneur/app/savings', investment: '/entrepreneur/app/credit' }
const PARTNERS = ['A partner bank', 'A microfinance institution', 'An insurer', 'The community investment marketplace']

function explain(profile, business, lang) {
  const c = profile.credit
  const best = profile.series.months[profile.series.moneyIn.indexOf(Math.max(...profile.series.moneyIn))]
  if (lang === 'sw') {
    return `${business.businessName} ina kumbukumbu za miezi ${profile.series.months.length}. Mauzo ya wastani ni ${tsh(c.kpis.avgIn)} kwa mwezi, na biashara inabaki na ${tsh(c.kpis.surplus)}. Mwezi bora ulikuwa ${best}. Asilimia ${Math.round(profile.share * 100)} ya mauzo imethibitishwa na benki au kampuni za simu. Alama ya utayari ni ${c.score} kati ya 100 na kiwango cha uaminifu ni ${profile.trust.level}.`
  }
  return `${business.businessName} has ${profile.series.months.length} months of records. Sales average ${tsh(c.kpis.avgIn)} a month and the business keeps ${tsh(c.kpis.surplus)} after costs. The best month was ${best}. ${Math.round(profile.share * 100)}% of sales are confirmed by a bank or mobile money provider. That gives a credit readiness score of ${c.score} out of 100 and a ${profile.trust.level.toLowerCase()} trust level. The biggest thing holding the score back is ${profile.mixedMoney ? 'household spending from the business account' : 'the lack of a regular savings habit'}.`
}

export default function Overview() {
  useDocumentTitle('Financial profile')
  const { state, dispatch } = useAppState()
  const profile = useProfile()
  const notify = useToast()
  const speak = useSpeak()
  const [lang, setLang] = useState('en')
  const [partner, setPartner] = useState(PARTNERS[0])
  const [agree, setAgree] = useState(false)
  const ent = state.ent

  if (!profile.credit) {
    return (
      <div className="empty-state">
        <h2>Your profile starts with your records</h2>
        <p>Connect a mobile money or bank account, or upload photos of your ledger. Your financial profile appears as soon as there is a month of sales.</p>
        <Link to="/entrepreneur/app/records" className="btn btn--primary">Add records <Icon name="arrow" /></Link>
      </div>
    )
  }

  const { credit, series, readiness } = profile
  const text = explain(profile, ent.business, lang)

  return (
    <div className="stack">
      <section className="profile-hero">
        <div>
          <h2 className="h-section">Your explainable financial profile</h2>
          <p className="muted">Built from {ent.transactions.filter((t) => t.status === 'confirmed').length} confirmed records you agreed to share. Every number below links back to them.</p>
        </div>
        <dl className="kpi-row">
          <div><dt>Average sales a month</dt><dd className="num">{tsh(credit.kpis.avgIn)}</dd></div>
          <div><dt>Average costs a month</dt><dd className="num">{tsh(credit.kpis.avgOut)}</dd></div>
          <div><dt>Kept each month</dt><dd className="num">{tsh(credit.kpis.surplus)}</dd></div>
          <div><dt>Verified by provider</dt><dd className="num">{Math.round(profile.share * 100)}%</dd></div>
        </dl>
      </section>

      <section className="ai-explain" aria-labelledby="explain-title">
        <div className="ai-explain__head">
          <h2 id="explain-title"><span className="ai-dot" aria-hidden="true" /> AI summary of your business health</h2>
          <div className="row-actions">
            <div className="lang-switch" role="group" aria-label="Language">
              <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
              <button type="button" aria-pressed={lang === 'sw'} onClick={() => setLang('sw')}>SW</button>
            </div>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => speak(text, lang)}><Icon name="speaker" size={16} /> Listen</button>
          </div>
        </div>
        <p lang={lang}>{text}</p>
        <p className="note">Written from your confirmed records with fixed rules. It never guesses figures that are not in your records.</p>
      </section>

      <section aria-labelledby="ready-title">
        <h2 id="ready-title" className="h-section">What you are ready for</h2>
        <div className="ready-grid">
          {readiness.map((r) => (
            <Link key={r.id} to={LINKS[r.id]} className={`ready-card ready-card--${r.status === 'Ready' ? 'yes' : r.status === 'Almost' ? 'almost' : 'no'}`}>
              <span className="ready-card__top">
                <span className="ready-card__title">{r.title}</span>
                <span className="ready-card__status">{r.status}</span>
              </span>
              <span className="ready-card__text">{r.text}</span>
              <span className="ready-card__go">Open <Icon name="arrow" size={14} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="card-block" aria-labelledby="cash-title">
        <h2 id="cash-title" className="h-section">Money in and out, {series.months[0]} to {series.months[series.months.length - 1]}</h2>
        <CashflowChart months={series.months} moneyIn={series.moneyIn} moneyOut={series.moneyOut} />
      </section>

      <section className="card-block" aria-labelledby="share-title">
        <h2 id="share-title" className="h-section">Share your profile</h2>
        {ent.shared ? (
          <p className="ok-box"><Icon name="check" /> Shared. The partner sees your profile, score and the checks that passed. Never your NIDA number or original photos.</p>
        ) : (
          <div className="share-form">
            <div className="field">
              <label htmlFor="partner">Share with</label>
              <select id="partner" value={partner} onChange={(e) => setPartner(e.target.value)}>
                {PARTNERS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <label className="check" htmlFor="share-agree">
              <input id="share-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>I agree to share my financial profile with {partner.toLowerCase()}. I can withdraw this at any time.</span>
            </label>
            <button type="button" className="btn btn--primary" disabled={!agree} onClick={() => { dispatch({ type: 'ent/share', with: partner }); notify(`Profile shared with ${partner.toLowerCase()}.`) }}>
              Share profile
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
