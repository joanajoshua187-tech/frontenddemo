const LINES = [
  { date: '02/09', text: 'Magauni 3, Mama Salma', amount: '95,000', read: 'Sale', value: 'TSh 95,000', source: 'Ledger, confirmed' },
  { date: '04/09', text: 'Vitambaa Kariakoo', amount: '180,000', read: 'Stock', value: 'TSh 180,000', source: 'Matches mobile money' },
  { date: '06/09', text: 'Sare za shule 5', amount: '150,000', read: 'Sale', value: 'TSh 150,000', source: 'Owner checked the smudge' },
  { date: '12/09', text: 'Kodi ya fremu', amount: '120,000', read: 'Rent', value: 'TSh 120,000', source: 'Matches mobile money' },
]

export function LedgerPage() {
  return (
    <figure className="ledger" aria-label="A handwritten ledger page with each line read and checked by Mizani">
      <div className="ledger__page">
        <p className="ledger__head">
          <span>Tarehe</span>
          <span>Maelezo</span>
          <span>Kiasi</span>
        </p>
        {LINES.map((line, i) => (
          <div className="ledger__row" key={line.date + line.text} style={{ '--i': i }}>
            <p className="ledger__hand">
              <span className="num">{line.date}</span>
              <span>{line.text}</span>
              <span className="num">{line.amount}</span>
            </p>
            <p className="ledger__read">
              <span className="ledger__tag">{line.read}</span>
              <span className="num">{line.value}</span>
              <span className="ledger__source">{line.source}</span>
            </p>
          </div>
        ))}
      </div>
      <figcaption className="ledger__foot">
        <span>September, page 3 of 11</span>
        <span className="ledger__stamp">Registered · TIN checked</span>
      </figcaption>
    </figure>
  )
}
