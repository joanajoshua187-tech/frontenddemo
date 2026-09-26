import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { BANK_SEES, BANK_NEVER_SEES } from '../../data/lender'
import { Icon } from '../../components/Icon'

const FLOW = [
  { who: 'Owner', title: 'Builds records', body: 'Connects mobile money and bank accounts, uploads ledger photos every week, answers flags.' },
  { who: 'Onekana', title: 'Verifies and explains', body: 'Checks registration, matches lines across sources, removes duplicates, and scores readiness and trust with fixed rules.' },
  { who: 'Owner', title: 'Gives consent', body: 'Chooses one bank and presses Share. Access is read-only and ends after 30 days or when the owner withdraws it.' },
  { who: 'Bank', title: 'Receives the profile', body: 'The profile arrives here and, through the API, in your loan origination system. No paperwork to retype.' },
  { who: 'Bank', title: 'Decides', body: 'Your credit team makes an offer, asks for more, or declines with a reason. Your own checks, such as the credit bureau, still apply.' },
  { who: 'Owner', title: 'Sees the answer', body: 'The decision appears in the owner’s workspace. Repayments made on time later raise their trust level.' },
]

const SAMPLE = `GET /v1/profiles/{consent_id}
Authorization: Bearer <token scoped to one consent, 30 days>

{
  "business": { "name": "Amina Tailoring", "sector": "Manufacturing and tailoring",
                "region": "Dar es Salaam", "checks": ["BRELA", "TRA", "LICENCE", "NIDA"] },
  "cash_flow": [{ "month": "2026-09", "in": 1520000, "out": 1010000, "verified_share": 0.71 }],
  "score": { "value": 79, "level": 4, "factors": [...] },
  "trust": { "value": 82, "level": "Strong", "weekly_uploads_12w": 10 },
  "open_flags": 0,
  "request": { "amount": 1800000, "months": 12, "purpose": "Two sewing machines" }
}`

export default function HowDataReachesYou() {
  useDocumentTitle('How data reaches your bank')
  return (
    <div className="stack">
      <section className="card-block">
        <h2 className="h-section">How a small business becomes visible to your bank</h2>
        <p className="muted">Most micro and small businesses have no audited accounts, so they look invisible to a credit team. Onekana turns their everyday records into evidence you can check, and shares it only with the owner’s consent.</p>
        <ol className="flow-steps">
          {FLOW.map((s, i) => (
            <li key={s.title} className={`flow-steps__item flow-steps__item--${s.who.toLowerCase()}`}>
              <span className="flow-steps__num num">{i + 1}</span>
              <span className="flow-steps__who">{s.who}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="two-col">
        <section className="card-block">
          <h2 className="h-section"><Icon name="eye" /> What your bank sees</h2>
          <ul className="check-list">
            {BANK_SEES.map((t) => <li key={t}><span className="check-list__icon"><Icon name="check" size={16} /></span><span>{t}</span></li>)}
          </ul>
        </section>
        <section className="card-block">
          <h2 className="h-section"><Icon name="lock" /> What your bank never sees</h2>
          <ul className="check-list check-list--no">
            {BANK_NEVER_SEES.map((t) => <li key={t}><span className="check-list__icon"><Icon name="close" size={16} /></span><span>{t}</span></li>)}
          </ul>
        </section>
      </div>

      <section className="card-block">
        <h2 className="h-section">Why it helps the bank</h2>
        <div className="benefit-grid">
          <div><strong>Lower cost to assess.</strong> Cash flow is already built and verified at source, so a loan officer reviews instead of collecting.</div>
          <div><strong>Evidence you can audit.</strong> Every figure traces to a record, and every change is in a fingerprinted log.</div>
          <div><strong>Behaviour, not just a snapshot.</strong> The trust level shows months of weekly record keeping, a signal of discipline.</div>
          <div><strong>New customers.</strong> Businesses that could never show accounts arrive ready for a small first loan.</div>
        </div>
      </section>

      <section className="card-block">
        <h2 className="h-section">Connecting your systems</h2>
        <p className="muted">Banks read profiles through a consent-scoped API and write decisions back. Mobile money and bank feeds reach Onekana through each provider’s official channel under the owner’s consent. In this demo every connection is simulated.</p>
        <pre className="code"><code>{SAMPLE}</code></pre>
        <p className="note">Illustrative interface. A production integration also needs a data-sharing agreement, security review and compliance with the Personal Data Protection Act, 2022 and Bank of Tanzania rules.</p>
      </section>
    </div>
  )
}
