import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { useAppState } from '../hooks/useAppState'
import { useProfile } from '../hooks/useProfile'
import { Icon } from '../components/Icon'

const TABS = [
  { to: '/entrepreneur/app', label: 'Profile', end: true },
  { to: '/entrepreneur/app/records', label: 'Records and sources' },
  { to: '/entrepreneur/app/credit', label: 'Score and trust' },
  { to: '/entrepreneur/app/loan', label: 'Loan planner' },
  { to: '/entrepreneur/app/savings', label: 'Savings advice' },
  { to: '/entrepreneur/app/activity', label: 'Activity log' },
]

export function EntrepreneurLayout() {
  const { state } = useAppState()
  const profile = useProfile()
  const ent = state.ent
  if (!ent.business) return <Navigate to="/entrepreneur" replace />
  const pending = ent.transactions.filter((t) => t.status === 'pending').length

  return (
    <div className="workspace">
      <header className="workspace__head">
        <div className="workspace__who">
          <p className="eyebrow">Entrepreneur workspace{ent.demo ? ' · demo data' : ''}</p>
          <h1 className="workspace__title">{ent.business.businessName}</h1>
          <p className="workspace__meta">
            <span className="tag tag--good"><Icon name="check" size={14} /> Registered and verified</span>
            <span>{ent.business.sector}</span>
            <span>{ent.business.region}</span>
          </p>
        </div>
        <dl className="workspace__stats">
          <div><dt>Credit readiness</dt><dd className="num">{profile.credit ? profile.credit.score : '–'}<small>/100</small></dd></div>
          <div><dt>Trust level</dt><dd>{profile.trust.level}<small className="num"> {profile.trust.score}</small></dd></div>
          <div><dt>Records kept</dt><dd className="num">{ent.transactions.filter((t) => t.status !== 'removed').length}</dd></div>
        </dl>
      </header>

      {pending > 0 && (
        <NavLink to="/entrepreneur/app/records#review" className="alert-strip">
          <Icon name="alert" size={18} />
          <span>{pending} {pending === 1 ? 'line needs' : 'lines need'} your answer. Possible duplicates and unclear amounts are not counted until you decide.</span>
          <span className="alert-strip__go">Review <Icon name="arrow" size={16} /></span>
        </NavLink>
      )}

      <nav className="tabs" aria-label="Workspace">
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
