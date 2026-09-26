import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ScoreDial, CountUpMoney } from './ScoreDial'
import { estimateFromTotals, STEADINESS } from '../utils/scoring'
import { plain } from '../utils/format'
import { Icon } from './Icon'

function Slider({ id, label, value, min, max, step, onChange, format }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="slider">
      <div className="slider__top">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="slider__value num">{format(value)}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--fill': `${pct}%` }}
      />
    </div>
  )
}

function Toggle({ id, label, checked, onChange }) {
  return (
    <label className="toggle" htmlFor={id}>
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle__track" aria-hidden="true"><span className="toggle__thumb" /></span>
      <span>{label}</span>
    </label>
  )
}

export function Estimator() {
  const [sales, setSales] = useState(1400000)
  const [costs, setCosts] = useState(950000)
  const [months, setMonths] = useState(6)
  const [steadiness, setSteadiness] = useState('mixed')
  const [registered, setRegistered] = useState(true)
  const [mobile, setMobile] = useState(true)
  const [separate, setSeparate] = useState(false)
  const [saves, setSaves] = useState(false)

  const safeCosts = Math.min(costs, sales)
  const result = estimateFromTotals({
    sales,
    costs: safeCosts,
    months,
    steadiness,
    registered,
    mobileShare: mobile ? 0.7 : 0.3,
    separate,
    saves,
  })

  return (
    <div className="estimator">
      <div className="estimator__inputs">
        <Slider id="est-sales" label="Average sales a month" value={sales} min={200000} max={10000000} step={50000} onChange={(v) => { setSales(v); if (costs > v) setCosts(v) }} format={(v) => `TSh ${plain(v)}`} />
        <Slider id="est-costs" label="Average costs a month" value={safeCosts} min={0} max={sales} step={50000} onChange={setCosts} format={(v) => `TSh ${plain(v)}`} />
        <Slider id="est-months" label="Months of records you have" value={months} min={1} max={12} step={1} onChange={setMonths} format={(v) => `${v} ${v === 1 ? 'month' : 'months'}`} />
        <fieldset className="segmented">
          <legend>How steady are your sales?</legend>
          <div className="segmented__options">
            {Object.entries(STEADINESS).map(([key, s]) => (
              <label key={key} className={`segmented__option ${steadiness === key ? 'is-selected' : ''}`}>
                <input type="radio" name="est-steady" value={key} checked={steadiness === key} onChange={() => setSteadiness(key)} />
                {s.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="toggles">
          <Toggle id="est-reg" label="Business is registered" checked={registered} onChange={setRegistered} />
          <Toggle id="est-mobile" label="Most sales go through mobile money" checked={mobile} onChange={setMobile} />
          <Toggle id="est-separate" label="Business money kept separate" checked={separate} onChange={setSeparate} />
          <Toggle id="est-saves" label="I save something every week" checked={saves} onChange={setSaves} />
        </div>
      </div>

      <div className="estimator__result" aria-live="polite">
        <ScoreDial score={result.score} caption={`${result.level.name}, ${result.level.label}`} />
        <dl className="estimator__facts">
          <div>
            <dt>Indicative loan</dt>
            <dd className="num"><CountUpMoney value={result.indicativeLoan} /></dd>
          </div>
          <div>
            <dt>Repayment you can carry</dt>
            <dd className="num"><CountUpMoney value={result.monthlyRepayment} /> a month</dd>
          </div>
          <div>
            <dt>Save each week</dt>
            <dd className="num"><CountUpMoney value={result.savings.weekly} /></dd>
          </div>
        </dl>
        <p className="note">An estimate from the numbers above. Your real report uses your verified records.</p>
        <Link to="/entrepreneur" className="btn btn--primary btn--block">
          Get my real report <Icon name="arrow" />
        </Link>
      </div>
    </div>
  )
}
