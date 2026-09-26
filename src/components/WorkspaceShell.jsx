import { NavLink } from 'react-router-dom'
import { Icon } from './Icon'

export function WorkspaceShell({ eyebrow, title, meta, stats = [], nav, alert, children }) {
  return (
    <div className="shell">
      <aside className="shell__side" aria-label="Workspace menu">
        <nav className="shell__nav">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `shell__link ${isActive ? 'is-active' : ''}`}>
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
              {item.badge ? <span className="shell__badge">{item.badge}</span> : null}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="shell__main">
        <header className="shell__head">
          <div className="shell__who">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="shell__title">{title}</h1>
            {meta && <div className="shell__meta">{meta}</div>}
          </div>
          {stats.length > 0 && (
            <dl className="shell__stats">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd className={s.mono ? 'num' : ''}>{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </header>
        {alert}
        <div className="shell__body">{children}</div>
      </div>
    </div>
  )
}
