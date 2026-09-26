import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAssistant } from '../hooks/useAssistant'
import { Icon } from '../components/Icon'
import { LogoMark } from '../components/Logo'

export default function Welcome() {
  useDocumentTitle('')
  const { openAssistant } = useAssistant()

  return (
    <section className="welcome">
      <div className="welcome__note">
        <LogoMark size={56} />
        <p className="welcome__greeting" lang="sw">Karibu Onekana.</p>
        <h1 className="welcome__title">Your business works every day. Now let it be seen.</h1>
        <p className="welcome__about">
          <em lang="sw">Onekana</em> means “be seen”. Across Tanzania, small businesses sell every day, yet lenders, insurers and
          investors cannot see them, because the proof lives in a daftari and on a phone. Onekana brings that proof together,
          with your permission, and turns it into a financial profile anyone can understand.
        </p>
        <dl className="welcome__pillars">
          <div>
            <dt>For entrepreneurs</dt>
            <dd>Turning invisible businesses into bankable businesses. Verify your registration, connect mobile money and bank records, and see your credit readiness score, trust level, loan plan and savings advice.</dd>
          </div>
          <div>
            <dt>For investors</dt>
            <dd>Democratising trusted local investment. Explore verified businesses, farms, infrastructure and approved digital assets with demo money, and read every risk in plain words.</dd>
          </div>
        </dl>
        <p className="welcome__promise">Every record is kept, every number is explained, and nothing is shared until you say so.</p>
      </div>

      <div className="welcome__paths">
        <h2 className="welcome__ask">How would you like to start?</h2>
        <Link to="/entrepreneur" className="path-card">
          <span className="path-card__who">Entrepreneur</span>
          <span className="path-card__title">I own a registered business</span>
          <span className="path-card__body">Business name, TIN, NIDA and licence. Then your records, your profile and a loan you can actually repay.</span>
          <span className="path-card__go">Start as an entrepreneur <Icon name="arrow" size={16} /></span>
        </Link>
        <Link to="/investor" className="path-card path-card--tint">
          <span className="path-card__who">Investor</span>
          <span className="path-card__title">I want to learn to invest</span>
          <span className="path-card__body">A demo wallet with TSh 1,000,000, fractional units in verified opportunities, and short lessons before real money.</span>
          <span className="path-card__go">Start as an investor <Icon name="arrow" size={16} /></span>
        </Link>
        <div className="welcome__more">
          <button type="button" className="btn btn--secondary" onClick={openAssistant}>
            <Icon name="mic" /> Ask the voice assistant
          </button>
          <Link to="/about" className="text-link">Learn more about Onekana <Icon name="arrow" size={16} /></Link>
        </div>
      </div>
    </section>
  )
}
