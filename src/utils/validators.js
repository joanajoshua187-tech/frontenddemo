const NAME_PATTERN = /^[\p{L}\p{N} .,'&()-]+$/u

export function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '')
}

export function validateBusiness(form) {
  const errors = {}
  const name = String(form.businessName || '').trim()
  if (name.length < 2 || name.length > 80) errors.businessName = 'Enter the name exactly as it appears on your BRELA certificate.'
  else if (!NAME_PATTERN.test(name)) errors.businessName = 'Use letters, numbers and simple punctuation only.'

  if (digitsOnly(form.tin).length !== 9) errors.tin = 'A TIN has 9 digits, for example 148-392-715.'
  if (digitsOnly(form.nida).length !== 20) errors.nida = 'A NIDA number has 20 digits. You will find it on your national ID card.'

  const licence = String(form.licence || '').trim()
  if (!/^[A-Za-z0-9/.-]{4,30}$/.test(licence)) errors.licence = 'Enter the licence number from your business licence, 4 to 30 characters.'

  if (!form.sector) errors.sector = 'Choose the sector closest to what you sell.'
  if (!form.region) errors.region = 'Choose the region where the business operates.'
  if (!form.consent) errors.consent = 'We need your consent to run the checks.'
  return errors
}

export function validateInvestor(form) {
  const errors = {}
  const name = String(form.displayName || '').trim()
  if (name.length < 2 || name.length > 40) errors.displayName = 'Enter a name between 2 and 40 characters.'
  else if (!NAME_PATTERN.test(name)) errors.displayName = 'Use letters, numbers and simple punctuation only.'
  if (!form.experience) errors.experience = 'Choose the option closest to your experience.'
  if (!form.goal) errors.goal = 'Choose what you want to learn first.'
  if (!form.consent) errors.consent = 'Confirm that you understand this account uses demo money.'
  return errors
}

export function validateAmount({ amount, minimum, balance }) {
  const value = Number(amount)
  if (!Number.isFinite(value) || value <= 0) return 'Enter an amount in Tanzanian shillings.'
  if (value < minimum) return `The minimum for this business is TSh ${minimum.toLocaleString('en-US')}.`
  if (value > balance) return 'That is more than the demo money left in your wallet.'
  if (value % 1000 !== 0) return 'Use whole thousands, for example 75,000.'
  return ''
}
