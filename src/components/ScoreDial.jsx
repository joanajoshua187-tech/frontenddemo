import { useCountUp } from '../hooks/useCountUp'

export function ScoreDial({ score, caption }) {
  const shown = useCountUp(score)
  const length = Math.PI * 90
  const offset = length * (1 - score / 100)
  return (
    <figure className="score-dial">
      <svg viewBox="0 0 220 138" role="img" aria-label={`Credit readiness score ${score} out of 100`}>
        <path d="M20 118 A90 90 0 0 1 200 118" className="score-dial__track" />
        <path d="M20 118 A90 90 0 0 1 200 118" className="score-dial__value" strokeDasharray={length} strokeDashoffset={offset} />
        <text x="20" y="136" textAnchor="middle" className="score-dial__tick">0</text>
        <text x="200" y="136" textAnchor="middle" className="score-dial__tick">100</text>
        <text x="110" y="104" textAnchor="middle" className="score-dial__number">{Math.round(shown)}</text>
      </svg>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

export function CountUpMoney({ value, prefix = 'TSh ' }) {
  const shown = useCountUp(value)
  return <>{prefix}{Math.round(shown).toLocaleString('en-US')}</>
}
