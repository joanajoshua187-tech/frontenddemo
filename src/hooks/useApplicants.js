import { useAppState } from './useAppState'
import { useProfile } from './useProfile'
import { demoApplicants } from '../data/lender'
import { selfApplicant } from '../utils/applicant'

export function useApplicants() {
  const { state } = useAppState()
  const profile = useProfile()
  const self = selfApplicant(state.ent, profile)
  return self ? [self, ...demoApplicants] : demoApplicants
}
