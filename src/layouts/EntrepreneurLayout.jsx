import { Link, Navigate, Outlet } from 'react-router-dom'
import { useAppState } from '../hooks/useAppState'
import { useProfile } from '../hooks/useProfile'
import { Icon } from '../components/Icon'
import { WorkspaceShell } from '../components/WorkspaceShell'

export function EntrepreneurLayout() {
  const { state } = useAppState()
  const profile = useProfile()
  const ent = state.ent
  if (!ent.business) return <Navigate to="/entrepreneur" replace />
  const pending = ent.transactions.filter((t) => t.status === 'pending').length
  const offer = state.lend.decisions.self

  const nav = [
    { to: '/entrepreneur/app', label: 'Profile', icon: 'home', end: true, badge: offer && ent.shared ? 1 : 0 },
    { to: '/entrepreneur/app/records', label: 'Records and sources', icon: 'records', badge: pending },
    { to: '/entrepreneur/app/credit', label: 'Score and trust', icon: 'gauge' },
    { to: '/entrepreneur/app/loan', label: 'Loan planner', icon: 'coin' },
    { to: '/entrepreneur/app/savings', label: 'Savings advice', icon: 'piggy' },
    { to: '/entrepreneur/app/activity', label: 'Activity log', icon: 'clock' },
  ]

  return (
    <WorkspaceShell
      eyebrow={`Entrepreneur workspace${ent.demo ? ' · demo data' : ''}`}
      title={ent.business.businessName}
      meta={
        <>
          <span className="tag tag--good"><Icon name="check" size={14} /> Registered and verified</span>
          <span>{ent.business.sector}</span>
          <span>{ent.business.region}</span>
        </>
      }
      stats={[
        { label: 'Credit readiness', value: profile.credit ? `${profile.credit.score}/100` : '–', mono: true },
        { label: 'Trust level', value: profile.trust.level },
        { label: 'Records kept', value: ent.transactions.filter((t) => t.status !== 'removed').length, mono: true },
      ]}
      nav={nav}
      alert={
        pending > 0 ? (
          <Link to="/entrepreneur/app/records#review" className="alert-strip">
            <Icon name="alert" size={18} />
            <span>{pending} {pending === 1 ? 'line needs' : 'lines need'} your answer. Possible duplicates and unclear amounts are not counted until you decide.</span>
            <span className="alert-strip__go">Review <Icon name="arrow" size={16} /></span>
          </Link>
        ) : null
      }
    >
      <Outlet />
    </WorkspaceShell>
  )
}
