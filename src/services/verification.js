import { env } from '../config/env'
import { apiRequest, wait } from './apiClient'
import { digitsOnly } from '../utils/validators'

export async function verifyBusiness(form) {
  const payload = {
    businessName: form.businessName.trim(),
    tin: digitsOnly(form.tin),
    nida: digitsOnly(form.nida),
    licence: form.licence.trim(),
    sector: form.sector,
    region: form.region,
  }
  if (!env.demoMode) return apiRequest('/businesses/verify', { method: 'POST', body: payload })

  await wait(1600)
  return {
    status: 'verified',
    checkedAt: new Date().toISOString(),
    checks: [
      { id: 'brela', label: 'Business name registered with BRELA', passed: true },
      { id: 'tra', label: 'TIN active with TRA', passed: true },
      { id: 'licence', label: 'Business licence valid', passed: true },
      { id: 'nida', label: 'Owner identity matches NIDA', passed: true, note: 'NIDA number deleted after the check' },
    ],
  }
}
