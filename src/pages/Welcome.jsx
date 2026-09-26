import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAssistant } from '../hooks/useAssistant'
import { Icon } from '../components/Icon'
import { LogoMark } from '../components/Logo'

const STEPS = [
  { icon: 'records', title: 'Your everyday records', body: 'Mobile money, bank statements and the pages of your daftari, brought together with your permission.' },
  { icon: 'shield', title: 'Checked and explained', body: 'Registration verified, duplicates caught, and a score and trust level where every point has a reason.' },
  { icon: 'eye', title: 'Seen by those who can help', body: 'Share your profile with a bank, an insurer or community investors, and see their answer in one place.' },
]

function SeenCard() {
  return (
    <figure className="seen-card" aria-label="Example of a business profile as a bank sees it">
      <div className="seen-card__head">
        <span className="seen-card__avatar">AT</span>
        <div>
          <p className="seen-card__name">Amina Tailoring</p>
          <p className="seen-card__meta">Kariakoo · registered and verified</p>
        </div>
        <span className="seen-card__badge"><Icon name="eye" size={14} /> Seen</span>
      </div>
      <div className="seen-card__score">
        <div className="seen-card__ring" style={{ '--p': 79 }}><span className="num">79</span></div>
        <dl>
          <div><dt>Credit readiness</dt><dd>Level 4, Established</dd></div>
          <div><dt>Trust level</dt><dd>Strong, 10-week streak</dd></div>
          <div><dt>Verified at source</dt><dd className="num">71% of sales</dd></div>
        </dl>
      </div>
      <div className="seen-card__bars" aria-hidden="true">
        {[62, 70, 66, 74, 88, 81].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
      </div>
      <div className="seen-card__foot">
        <span><Icon name="bank" size={14} /> Partner Bank</span>
        <span className="seen-card__offer num">Offer: TSh 1,800,000 · 12 months</span>
      </div>
      <figcaption className="visually-hidden">Demo business. Figures are examples.</figcaption>
    </figure>
  )
}

export default function Welcome() {
  useDocumentTitle('')
  const { openAssistant } = useAssistant()

  return (
    <>
      <section className="landing">
        <div className="landing__copy">
          <p className="landing__kicker"><LogoMark size={22} /> <span lang="sw">Onekana</span> means “be seen”</p>
          <h1 className="landing__title">Karibu Onekana, where we see you</h1>
          <p className="landing__lede">
            Small businesses in Tanzania sell every day, yet banks cannot see them. Onekana turns your records into a
            financial profile that lenders, insurers and investors can trust, and that you can understand.
          </p>
          <div className="landing__actions">
            <Link to="/start" className="btn btn--primary btn--large">Get started <Icon name="arrow" /></Link>
            <button type="button" className="btn btn--ghost btn--large" onClick={openAssistant}><Icon name="mic" /> Ask in Swahili or English</button>
          </div>
          <p className="landing__fine">For registered businesses, learning investors and banks. Demo data, no real money.</p>
        </div>
        <div className="landing__visual">
          <SeenCard />
        </div>
      </section>

      <section className="band" aria-labelledby="how-title">
        <h2 id="how-title" className="band__title">How Onekana sees you</h2>
        <ol className="see-steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="see-steps__icon"><Icon name={s.icon} size={22} /></span>
              <span className="see-steps__num num">0{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bank-band" aria-labelledby="bank-title">
        <div className="bank-band__copy">
          <p className="eyebrow">For banks</p>
          <h2 id="bank-title">Lend to businesses you could not see before</h2>
          <p>With the owner’s consent, your credit team receives verified monthly cash flow, a readiness score with every factor, a trust level built from months of weekly record keeping, and the loan the owner has planned. You decide, and your answer goes straight back to the owner.</p>
          <Link to="/lender/app" className="btn btn--secondary">Open the lender console <Icon name="arrow" size={16} /></Link>
        </div>
        <ul className="bank-band__points">
          <li><Icon name="shield" /> Read-only, one bank at a time, ends after 30 days</li>
          <li><Icon name="check" /> Figures trace back to verified records</li>
          <li><Icon name="lock" /> Never the NIDA number or original photos</li>
          <li><Icon name="clock" /> Every view and decision is logged</li>
        </ul>
      </section>

      <section className="closing-cta">
        <LogoMark size={48} />
        <h2>Ready to be seen?</h2>
        <Link to="/start" className="btn btn--primary btn--large">Get started <Icon name="arrow" /></Link>
      </section>
    </>
  )
}
