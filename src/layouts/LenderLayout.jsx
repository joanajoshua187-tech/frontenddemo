import { Outlet } from 'react-router-dom'
import { useAppState } from '../hooks/useAppState'
import { WorkspaceShell } from '../components/WorkspaceShell'
import { LENDER } from '../data/lender'
import { useApplicants } from '../hooks/useApplicants'

export function LenderLayout() {
  const { state } = useAppState()
  const applicants = useApplicants()
  const decided = Object.keys(state.lend.decisions).filter((id) => applicants.some((a) => a.id === id)).length
  const waiting = applicants.length - decided

  return (
    <WorkspaceShell
      eyebrow="Lender console · demo"
      title={`${LENDER.name}, SME desk`}
      meta={<><span className="tag tag--brand">Read-only access, granted by each owner</span><span>Access ends after 30 days or when the owner withdraws it</span></>}
      stats={[
        { label: 'Profiles shared', value: applicants.length, mono: true },
        { label: 'Waiting for you', value: waiting, mono: true },
        { label: 'Decided', value: decided, mono: true },
      ]}
      nav={[
        { to: '/lender/app', label: 'Applications', icon: 'records', end: true, badge: waiting },
        { to: '/lender/app/how', label: 'How data reaches you', icon: 'shield' },
        { to: '/lender/app/activity', label: 'Activity log', icon: 'clock' },
      ]}
    >
      <Outlet />
    </WorkspaceShell>
  )
}
