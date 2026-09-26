import { useAppState } from '../../hooks/useAppState'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ActivityLog } from '../../components/ActivityLog'

export default function InvestorActivity() {
  useDocumentTitle('Investor activity log')
  const { state } = useAppState()
  return <ActivityLog log={state.inv.log} title="Every move in your demo account" />
}
