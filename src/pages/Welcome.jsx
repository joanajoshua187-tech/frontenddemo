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
        <LogoMark size={52} />
        <p className="welcome__greeting" lang="sw">Karibu.</p>
        <h1 className="welcome__title">Welcome to Africa Credit OS</h1>
        <p className="welcome__about">
          Many good businesses are turned away by lenders because their records live in a notebook and a phone.
          Africa Credit OS reads those records, checks that the business is registered, and turns them into a
          credit readiness score, a loan you can actually repay and a savings plan. For people who want to invest,
          it is a safe place to practise with demo money before using real savings.
        </p>
        <ul className="welcome__facts">
          <li><span className="num">4</span> registry checks before any record is read</li>
          <li><span className="num">0 to 100</span> score with every point explained</li>
          <li><span className="num">TSh 1,000,000</span> in demo money for new investors</li>
        </ul>
      </div>

      <div className="welcome__paths">
        <h2 className="welcome__ask">How would you like to start?</h2>
        <Link to="/entrepreneur" className="path-card">
          <span className="path-card__who">Entrepreneur</span>
          <span className="path-card__title">I own a registered business</span>
          <span className="path-card__body">Verify your business, upload your ledger and mobile money records, see your score and plan a loan.</span>
          <span className="path-card__go">Start as an entrepreneur <Icon name="arrow" size={16} /></span>
        </Link>
        <Link to="/investor" className="path-card path-card--tint">
          <span className="path-card__who">Investor</span>
          <span className="path-card__title">I want to learn to invest</span>
          <span className="path-card__body">Open a demo account, compare verified local businesses and practise with demo money.</span>
          <span className="path-card__go">Start as an investor <Icon name="arrow" size={16} /></span>
        </Link>
        <div className="welcome__more">
          <button type="button" className="btn btn--secondary" onClick={openAssistant}>
            <Icon name="mic" /> Ask the voice assistant
          </button>
          <Link to="/about" className="text-link">Learn more about how it works <Icon name="arrow" size={16} /></Link>
        </div>
      </div>
    </section>
  )
}
