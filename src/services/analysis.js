import { env } from '../config/env'
import { apiRequest, wait } from './apiClient'
import { sampleExtraction } from '../data/sampleBusiness'

export async function analyseRecords(files, onStage) {
  if (!env.demoMode) {
    const form = new FormData()
    files.forEach((f) => form.append('records', f.file, f.safeName))
    return apiRequest('/records/analyse', { method: 'POST', body: form })
  }
  const stages = ['Reading mobile money screenshots', 'Reading handwriting in ledger pages', 'Matching both sources and checking for duplicates']
  for (const stage of stages) {
    onStage?.(stage)
    await wait(900)
  }
  return structuredClone(sampleExtraction)
}
