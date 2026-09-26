import { plain } from '../utils/format'

export function CashflowChart({ months, moneyIn, moneyOut }) {
  const W = 640
  const H = 270
  const L = 64
  const R = 12
  const T = 18
  const B = 34
  const max = 1800000
  const ticks = [0, 500000, 1000000, 1500000]
  const ih = H - T - B
  const iw = W - L - R
  const y = (v) => T + ih * (1 - v / max)
  const gw = iw / months.length
  const bw = Math.min(24, gw / 3)
  const peak = moneyIn.indexOf(Math.max(...moneyIn))

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Money in and money out by month, ${months[0]} to ${months[months.length - 1]}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="chart__grid" />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" className="chart__label">{t === 0 ? '0' : `${plain(t / 1000)}k`}</text>
          </g>
        ))}
        {months.map((m, i) => {
          const cx = L + gw * i + gw / 2
          return (
            <g key={m}>
              <rect x={cx - bw - 2} y={y(moneyIn[i])} width={bw} height={y(0) - y(moneyIn[i])} rx="3" className="chart__in" />
              <rect x={cx + 2} y={y(moneyOut[i])} width={bw} height={y(0) - y(moneyOut[i])} rx="3" className="chart__out" />
              <text x={cx} y={H - 12} textAnchor="middle" className="chart__label">{m}</text>
            </g>
          )
        })}
        <text x={L + gw * peak + gw / 2 - bw / 2 - 2} y={y(moneyIn[peak]) - 7} textAnchor="middle" className="chart__callout">
          {`${plain(moneyIn[peak] / 1000)}k`}
        </text>
      </svg>
      <div className="chart__legend">
        <span><i className="swatch swatch--in" />Money in</span>
        <span><i className="swatch swatch--out" />Money out</span>
        <span>Tanzanian shillings, thousands</span>
      </div>
    </div>
  )
}
