import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { useAppState } from '../hooks/useAppState'
import { tsh } from '../utils/format'

const TABS = [
  { to: '/investor/app', label: 'Marketplace', end: true },
  { to: '/investor/app/portfolio', label: 'Portfolio and wallet' },
  { to: '/investor/app/learn', label: 'Learn' },
  { to: '/investor/app/activity', label: 'Activity log' },
]

export function InvestorLayout() {
  const { state } = useAppState()
  const inv = state.inv
  if (!inv.investor) return <Navigate to="/investor" replace />
  const invested = inv.holdings.reduce((s, h) => s + h.cost, 0)

  return (
    <div className="workspace">
      <header className="workspace__head">
        <div className="workspace__who">
          <p className="eyebrow">Investor workspace · demo money only</p>
          <h1 className="workspace__title">Karibu, {inv.investor.displayName}</h1>
          <p className="workspace__meta">
            <span className="tag tag--brand">{inv.investor.riskProfile} profile</span>
            <span>Up to {Math.round(inv.investor.maxShare * 100)}% of your wallet in one opportunity</span>
          </p>
        </div>
        <dl className="workspace__stats">
          <div><dt>Demo wallet</dt><dd className="num">{tsh(inv.wallet.balance)}</dd></div>
          <div><dt>Invested</dt><dd className="num">{tsh(invested)}</dd></div>
          <div><dt>Lessons done</dt><dd className="num">{inv.lessonsDone.length}<small>/5</small></dd></div>
        </dl>
      </header>

      <nav className="tabs" aria-label="Investor workspace">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tabs__link ${isActive ? 'is-active' : ''}`}>
            {t.label}
          </NavLink>
        ))}
      </nav>

      <div className="workspace__body">
        <Outlet />
      </div>
    </div>
  )
}
