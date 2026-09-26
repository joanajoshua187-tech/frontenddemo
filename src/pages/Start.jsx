import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Icon } from '../components/Icon'

export default function Start() {
  useDocumentTitle('Get started')
  return (
    <section className="page page--narrow">
      <h1 className="page__title">How do you want to use Africa Credit OS?</h1>
      <p className="page__lede">Pick one. You can come back and try the other later.</p>
      <div className="start-grid">
        <Link to="/entrepreneur" className="start-card">
          <span className="start-card__who">Entrepreneur</span>
          <span className="start-card__title">I own a registered business</span>
          <span className="start-card__body">Verify the business, upload your records and get a report with a score, a loan level and savings advice.</span>
          <span className="start-card__go">Verify my business <Icon name="arrow" size={16} /></span>
        </Link>
        <Link to="/investor" className="start-card start-card--accent">
          <span className="start-card__who">Investor</span>
          <span className="start-card__title">I want to learn to invest</span>
          <span className="start-card__body">Open a demo account with TSh 1,000,000 in practice money and invest in verified local businesses.</span>
          <span className="start-card__go">Open a demo account <Icon name="arrow" size={16} /></span>
        </Link>
      </div>
    </section>
  )
}
