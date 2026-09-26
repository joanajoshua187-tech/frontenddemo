import { useAppState } from '../../hooks/useAppState'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ActivityLog } from '../../components/ActivityLog'

export default function LenderActivity() {
  useDocumentTitle('Lender activity log')
  const { state } = useAppState()
  return <ActivityLog log={state.lend.log} title="Every decision made on this desk" />
}
