import { Navigate } from 'react-router-dom'
import { useAppState } from '../hooks/useAppState'

export function RequireVerified({ children }) {
  const { state } = useAppState()
  if (state.verification?.status !== 'verified') return <Navigate to="/entrepreneur" replace />
  return children
}

export function RequireReport({ children }) {
  const { state } = useAppState()
  if (state.verification?.status !== 'verified') return <Navigate to="/entrepreneur" replace />
  if (!state.confirmed) return <Navigate to="/entrepreneur/records" replace />
  return children
}

export function RequireInvestor({ children }) {
  const { state } = useAppState()
  if (!state.investor) return <Navigate to="/investor" replace />
  return children
}
