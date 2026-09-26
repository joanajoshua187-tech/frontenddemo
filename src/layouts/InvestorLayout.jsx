import { Navigate, Outlet } from 'react-router-dom'
import { useAppState } from '../hooks/useAppState'
import { WorkspaceShell } from '../components/WorkspaceShell'
import { tsh } from '../utils/format'

export function InvestorLayout() {
  const { state } = useAppState()
  const inv = state.inv
  if (!inv.investor) return <Navigate to="/investor" replace />
  const invested = inv.holdings.reduce((s, h) => s + h.cost, 0)

  const nav = [
    { to: '/investor/app', label: 'Start here', icon: 'home', end: true },
    { to: '/investor/app/market', label: 'Verified businesses', icon: 'store' },
    { to: '/investor/app/portfolio', label: 'Wallet and portfolio', icon: 'wallet' },
    { to: '/investor/app/learn', label: 'Learn', icon: 'book', badge: 5 - inv.lessonsDone.length },
    { to: '/investor/app/activity', label: 'Activity log', icon: 'clock' },
  ]

  return (
    <WorkspaceShell
      eyebrow="Investor workspace · demo money only"
      title={`Karibu, ${inv.investor.displayName}`}
      meta={
        <>
          <span className="tag tag--brand">{inv.investor.riskProfile} profile</span>
          <span>Up to {Math.round(inv.investor.maxShare * 100)}% of your wallet in one opportunity</span>
        </>
      }
      stats={[
        { label: 'Demo wallet', value: tsh(inv.wallet.balance), mono: true },
        { label: 'Invested', value: tsh(invested), mono: true },
        { label: 'Lessons', value: `${inv.lessonsDone.length}/5`, mono: true },
      ]}
      nav={nav}
    >
      <Outlet />
    </WorkspaceShell>
  )
}
