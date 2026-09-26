import { useMemo } from 'react'
import { useAppState } from './useAppState'
import { buildProfile, buildSavingsPlan } from '../utils/profile'

export function useProfile() {
  const { state } = useAppState()
  const ent = state.ent
  return useMemo(() => {
    const profile = buildProfile(ent)
    return { ...profile, savingsPlan: buildSavingsPlan(profile, ent.transactions) }
  }, [ent])
}
