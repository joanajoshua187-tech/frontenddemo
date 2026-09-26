import { useAppState } from '../../hooks/useAppState'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ActivityLog } from '../../components/ActivityLog'

export default function EntrepreneurActivity() {
  useDocumentTitle('Activity log')
  const { state } = useAppState()
  return <ActivityLog log={state.ent.log} title="Everything that happened in this workspace" />
}
