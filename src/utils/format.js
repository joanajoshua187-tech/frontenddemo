export function tsh(value) {
  return `TSh ${Math.round(Number(value) || 0).toLocaleString('en-US')}`
}

export function plain(value) {
  return Math.round(Number(value) || 0).toLocaleString('en-US')
}

export function percent(value, digits = 0) {
  return `${(Number(value) * 100).toFixed(digits)}%`
}

export function signedPercent(value) {
  const rounded = Math.round(value)
  return `${rounded > 0 ? '+' : rounded < 0 ? '−' : ''}${Math.abs(rounded)}%`
}

export function maskTail(value, visible = 4) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''
  return `${'•'.repeat(Math.max(0, digits.length - visible))}${digits.slice(-visible)}`
}

export function roundDown(value, step) {
  return Math.floor(value / step) * step
}
