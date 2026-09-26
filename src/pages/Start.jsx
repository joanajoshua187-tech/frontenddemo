import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Icon } from '../components/Icon'

const DOORS = [
  {
    to: '/entrepreneur',
    icon: 'store',
    who: 'Entrepreneur',
    title: 'I own a registered business',
    body: 'Verify your business, bring your records together and see your credit readiness, trust level, loan plan and savings advice.',
    need: 'Business name, TIN, owner’s NIDA number, business licence',
    cta: 'Continue as an entrepreneur',
  },
  {
    to: '/investor',
    icon: 'wallet',
    who: 'Investor',
    title: 'I want to learn to invest',
    body: 'Open a demo account with a TSh 1,000,000 wallet, pick from verified local businesses and learn step by step.',
    need: 'A name and three questions about risk',
    cta: 'Continue as an investor',
  },
  {
    to: '/lender/app',
    icon: 'bank',
    who: 'Bank or lender',
    title: 'I assess small businesses for credit',
    body: 'See how consented Onekana profiles reach your credit team, review the evidence and send an offer.',
    need: 'Nothing for the demo. A real desk signs in with two-step verification.',
    cta: 'Open the lender console',
  },
]

export default function Start() {
  useDocumentTitle('Get started')
  return (
    <section className="start">
      <div className="start__head">
        <p className="eyebrow">Get started</p>
        <h1 className="start__title">Who are you today?</h1>
        <p className="start__lede">Choose one. You can come back and try the others.</p>
      </div>
      <ul className="door-grid">
        {DOORS.map((d, i) => (
          <li key={d.to}>
            <Link to={d.to} className={`door-card ${i === 1 ? 'door-card--tint' : ''}`}>
              <span className="door-card__icon"><Icon name={d.icon} size={24} /></span>
              <span className="door-card__who">{d.who}</span>
              <span className="door-card__title">{d.title}</span>
              <span className="door-card__body">{d.body}</span>
              <span className="door-card__need"><strong>You need:</strong> {d.need}</span>
              <span className="door-card__go">{d.cta} <Icon name="arrow" size={16} /></span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
