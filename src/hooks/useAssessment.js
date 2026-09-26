import { useMemo } from 'react'
import { useAppState } from './useAppState'
import { assessBusiness } from '../utils/scoring'
import { sampleMonths, sampleMoneyIn, sampleMoneyOut } from '../data/sampleBusiness'

export function useAssessment() {
  const { state } = useAppState()
  return useMemo(() => {
    if (!state.extraction || !state.confirmed) return null
    return {
      months: sampleMonths,
      moneyIn: sampleMoneyIn,
      moneyOut: sampleMoneyOut,
      ...assessBusiness({
        months: sampleMonths,
        moneyIn: sampleMoneyIn,
        moneyOut: sampleMoneyOut,
        verifiedShare: state.extraction.verifiedShare,
        registered: state.verification?.status === 'verified',
        mixedMoney: state.extraction.mixedMoney,
        savingsFound: state.extraction.savingsFound,
      }),
    }
  }, [state.extraction, state.confirmed, state.verification])
}
