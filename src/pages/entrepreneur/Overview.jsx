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
import { SHARE_PARTNERS, BANK_SEES, BANK_NEVER_SEES, LENDER } from '../../data/lender'

const LINKS = { finance: '/entrepreneur/app/loan', savings: '/entrepreneur/app/savings', insurance: '/entrepreneur/app/savings', investment: '/entrepreneur/app/credit' }

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
  const [partnerId, setPartnerId] = useState(SHARE_PARTNERS[0].id)
  const partner = SHARE_PARTNERS.find((p) => p.id === partnerId)
  const [agree, setAgree] = useState(false)
  const ent = state.ent
  const offer = state.lend.decisions.self

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

      <section className="card-block share" aria-labelledby="share-title">
        <h2 id="share-title" className="h-section">Get seen by a lender</h2>
        {ent.shared ? (
          <>
            <p className="ok-box"><Icon name="check" /> Shared with {ent.sharedWith}. They can read your profile for 30 days, never your NIDA number or original photos.</p>
            {offer ? (
              <div className={`offer offer--${offer.decision}`}>
                <p className="offer__from"><Icon name="bank" size={18} /> {LENDER.name} replied</p>
                {offer.decision === 'offer' ? (
                  <>
                    <p className="offer__amount num">{tsh(offer.offer.amount)}</p>
                    <p>over {offer.offer.months} months at {Math.round(offer.offer.rate * 100)}% a year, <strong className="num">{tsh(offer.offer.instalment)}</strong> a month.</p>
                    {credit && <p className="muted">That is {Math.round((offer.offer.instalment / Math.max(1, credit.kpis.surplus)) * 100)}% of what your business keeps each month.</p>}
                  </>
                ) : (
                  <p><strong>{offer.decision === 'info' ? 'They need a little more.' : 'Not this time.'}</strong> {offer.note}</p>
                )}
                {offer.decision === 'offer' && offer.note && <p className="muted">“{offer.note}”</p>}
              </div>
            ) : ent.sharedKind === 'bank' ? (
              <p className="muted">Waiting for {LENDER.name}. <Link to="/lender/app">See how your profile looks on the bank’s side</Link>.</p>
            ) : null}
            <button type="button" className="btn btn--ghost btn--small" onClick={() => { dispatch({ type: 'ent/unshare' }); notify('Consent withdrawn. The partner can no longer see your profile.', 'info') }}>Withdraw consent</button>
          </>
        ) : (
          <div className="share-form">
            <p className="muted">Banks cannot lend to what they cannot see. Share your profile with one partner and they receive your verified cash flow, score and trust level.</p>
            <div className="field">
              <label htmlFor="partner">Share with</label>
              <select id="partner" value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
                {SHARE_PARTNERS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <details className="sees">
              <summary>What they will and will not see</summary>
              <div className="two-col">
                <ul className="plain-list">{BANK_SEES.map((t) => <li key={t}>{t}</li>)}</ul>
                <ul className="plain-list">{BANK_NEVER_SEES.map((t) => <li key={t}>Never: {t.charAt(0).toLowerCase() + t.slice(1)}</li>)}</ul>
              </div>
            </details>
            <label className="check" htmlFor="share-agree">
              <input id="share-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>I agree to share my financial profile with {partner.label.toLowerCase()} for 30 days. I can withdraw this at any time.</span>
            </label>
            <button type="button" className="btn btn--primary" disabled={!agree} onClick={() => { dispatch({ type: 'ent/share', with: partner.label, kind: partner.kind }); notify(`Profile shared with ${partner.label}.`) }}>
              Share profile
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
