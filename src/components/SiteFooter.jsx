import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { brand } from '../config/brand'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Logo />
          <p>{brand.tagline} We judge a business by its records, not by who it knows.</p>
        </div>
        <nav className="site-footer__cols" aria-label="Footer">
          <div>
            <h2>Use Africa Credit OS</h2>
            <Link to="/entrepreneur">Get a business report</Link>
            <Link to="/investor">Practise investing</Link>
            <Link to="/how-it-works">How the score works</Link>
          </div>
          <div>
            <h2>Legal</h2>
            <Link to="/privacy">Privacy policy</Link>
            <Link to="/terms">Terms and conditions</Link>
            <Link to="/cookies">Cookie policy</Link>
          </div>
          <div>
            <h2>Contact</h2>
            <p className="selectable">{brand.contactEmail}</p>
            <p>{brand.address}</p>
          </div>
        </nav>
      </div>
      <p className="site-footer__legal">
        © 2026 {brand.legalName}. Africa Credit OS is not a lender and does not give financial advice. Investor practice uses demo money only.
      </p>
    </footer>
  )
}
