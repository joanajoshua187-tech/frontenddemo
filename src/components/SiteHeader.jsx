import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Logo } from './Logo'
import { Icon } from './Icon'

const NAV = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/about', label: 'About' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__brand" aria-label="Onekana home">
          <Logo />
        </Link>
        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'close' : 'menu'} size={22} />
          <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
        <nav id="primary-nav" className={`site-nav ${open ? 'is-open' : ''}`} aria-label="Main" onClick={(e) => { if (e.target.closest('a')) setOpen(false) }}>
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
          <Link to="/start" className="btn btn--primary btn--small">Get started <Icon name="arrow" size={16} /></Link>
        </nav>
      </div>
    </header>
  )
}
