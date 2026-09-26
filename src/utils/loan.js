export const LOAN_TERMS = [3, 6, 9, 12, 18]

export const LOAN_PURPOSES = [
  'Stock and raw materials',
  'Equipment or machines',
  'Bigger or better premises',
  'Transport for deliveries',
  'Something else',
]

export const ILLUSTRATIVE_RATES = { 1: null, 2: 0.28, 3: 0.22, 4: 0.18 }

export function monthlyInstalment(principal, annualRate, months) {
  if (principal <= 0 || months <= 0) return 0
  const r = annualRate / 12
  if (r === 0) return principal / months
  return (principal * r) / (1 - (1 + r) ** -months)
}

export function schedule(principal, annualRate, months) {
  const r = annualRate / 12
  const payment = monthlyInstalment(principal, annualRate, months)
  const rows = []
  let balance = principal
  for (let m = 1; m <= months; m += 1) {
    const interest = balance * r
    const toPrincipal = m === months ? balance : payment - interest
    const paid = m === months ? balance + interest : payment
    balance = Math.max(0, balance - toPrincipal)
    rows.push({ month: m, payment: paid, interest, principal: toPrincipal, balance })
  }
  return rows
}

export function affordability(instalment, capacity, surplus) {
  if (instalment <= capacity) {
    return { tone: 'good', label: 'Comfortable', text: 'The instalment fits inside the 35% of monthly profit we treat as safe.' }
  }
  if (instalment <= capacity * 1.25) {
    return { tone: 'warn', label: 'A stretch', text: 'You can pay this in a normal month, but a slow month would be tight. A longer term or smaller amount would help.' }
  }
  if (instalment < surplus) {
    return { tone: 'bad', label: 'Risky', text: 'This takes most of what the business keeps each month. One bad month could mean a missed payment.' }
  }
  return { tone: 'bad', label: 'Not affordable', text: 'The instalment is more than the business keeps in an average month.' }
}
