import { useState } from 'react'

const LINES = [
  {
    date: '02/09',
    text: 'Magauni 3, Mama Salma',
    amount: '95,000',
    read: 'Sale',
    value: 'TSh 95,000',
    source: 'Ledger, confirmed',
    how: 'Written as “Magauni 3”, three dresses. No matching mobile money payment, so it counts as a cash sale the owner confirmed.',
  },
  {
    date: '04/09',
    text: 'Vitambaa Kariakoo',
    amount: '180,000',
    read: 'Stock',
    value: 'TSh 180,000',
    source: 'Matches mobile money',
    how: 'Fabric bought in Kariakoo. The same amount left the owner’s mobile money wallet that day, so the line is confirmed twice.',
  },
  {
    date: '06/09',
    text: 'Sare za shule 5',
    amount: '150,000',
    read: 'Sale',
    value: 'TSh 150,000',
    source: 'Owner checked the smudge',
    how: 'One digit was smudged. The AI read 150,000 but was only 71% sure, so it asked the owner, who confirmed the amount.',
  },
  {
    date: '12/09',
    text: 'Kodi ya fremu',
    amount: '120,000',
    read: 'Rent',
    value: 'TSh 120,000',
    source: 'Matches mobile money',
    how: 'Shop rent. Recognised from the word “kodi” and matched to a payment to the same landlord every month.',
  },
]

export function LedgerPage() {
  const [active, setActive] = useState(0)
  const current = LINES[active]
  return (
    <figure className="ledger" aria-label="A ledger page. Choose a line to see how Africa Credit OS read it.">
      <div className="ledger__page">
        <p className="ledger__head">
          <span>Tarehe</span>
          <span>Maelezo</span>
          <span>Kiasi</span>
        </p>
        {LINES.map((line, i) => (
          <button
            type="button"
            className={`ledger__row ${i === active ? 'is-active' : ''}`}
            key={line.date + line.text}
            style={{ '--i': i }}
            aria-pressed={i === active}
            onClick={() => setActive(i)}
          >
            <span className="ledger__hand">
              <span className="num">{line.date}</span>
              <span>{line.text}</span>
              <span className="num">{line.amount}</span>
            </span>
            <span className="ledger__read">
              <span className="ledger__tag">{line.read}</span>
              <span className="num">{line.value}</span>
              <span className="ledger__source">{line.source}</span>
            </span>
          </button>
        ))}
      </div>
      <figcaption className="ledger__explain" aria-live="polite">
        <span className="ledger__explain-label">How this line was read</span>
        <span>{current.how}</span>
      </figcaption>
    </figure>
  )
}
