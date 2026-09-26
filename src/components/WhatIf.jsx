import { useState } from 'react'
import { assessBusiness } from '../utils/scoring'
import { ScoreDial, CountUpMoney } from './ScoreDial'

function Delta({ now, then, money }) {
  const diff = now - then
  if (Math.round(diff) === 0) return <span className="delta">no change</span>
  const text = money ? `${Math.abs(Math.round(diff)).toLocaleString('en-US')}` : Math.abs(Math.round(diff))
  return <span className={`delta ${diff > 0 ? 'is-up' : 'is-down'}`}>{diff > 0 ? '+' : '−'}{text}</span>
}

export function WhatIf({ base, inputs }) {
  const [separate, setSeparate] = useState(!inputs.mixedMoney)
  const [saves, setSaves] = useState(inputs.savingsFound)
  const [growth, setGrowth] = useState(0)
  const [cut, setCut] = useState(0)

  const next = assessBusiness({
    ...inputs,
    moneyIn: inputs.moneyIn.map((v) => v * (1 + growth / 100)),
    moneyOut: inputs.moneyOut.map((v) => v * (1 - cut / 100)),
    mixedMoney: !separate,
    savingsFound: saves,
  })

  return (
    <section className="whatif" aria-labelledby="whatif-title">
      <div className="whatif__head">
        <h2 id="whatif-title">What if you changed something?</h2>
        <p>Try a change and watch your score and loan level move. This does not change your saved report.</p>
      </div>
      <div className="whatif__body">
        <div className="whatif__controls">
          <label className="toggle" htmlFor="wi-separate">
            <input id="wi-separate" type="checkbox" role="switch" checked={separate} onChange={(e) => setSeparate(e.target.checked)} />
            <span className="toggle__track" aria-hidden="true"><span className="toggle__thumb" /></span>
            <span>Keep business money in its own account</span>
          </label>
          <label className="toggle" htmlFor="wi-saves">
            <input id="wi-saves" type="checkbox" role="switch" checked={saves} onChange={(e) => setSaves(e.target.checked)} />
            <span className="toggle__track" aria-hidden="true"><span className="toggle__thumb" /></span>
            <span>Save the suggested amount every week</span>
          </label>
          <div className="slider">
            <div className="slider__top">
              <label htmlFor="wi-growth">Grow monthly sales by</label>
              <output htmlFor="wi-growth" className="slider__value num">{growth}%</output>
            </div>
            <input id="wi-growth" type="range" min="0" max="30" step="5" value={growth} onChange={(e) => setGrowth(Number(e.target.value))} style={{ '--fill': `${(growth / 30) * 100}%` }} />
          </div>
          <div className="slider">
            <div className="slider__top">
              <label htmlFor="wi-cut">Cut monthly costs by</label>
              <output htmlFor="wi-cut" className="slider__value num">{cut}%</output>
            </div>
            <input id="wi-cut" type="range" min="0" max="20" step="5" value={cut} onChange={(e) => setCut(Number(e.target.value))} style={{ '--fill': `${(cut / 20) * 100}%` }} />
          </div>
        </div>
        <div className="whatif__result" aria-live="polite">
          <ScoreDial score={next.score} caption={`${next.level.name}, ${next.level.label}`} />
          <dl className="whatif__facts">
            <div><dt>Score</dt><dd className="num">{next.score} <Delta now={next.score} then={base.score} /></dd></div>
            <div><dt>Indicative loan</dt><dd className="num"><CountUpMoney value={next.indicativeLoan} /> <Delta now={next.indicativeLoan} then={base.indicativeLoan} money /></dd></div>
            <div><dt>Save each week</dt><dd className="num"><CountUpMoney value={next.savings.weekly} /> <Delta now={next.savings.weekly} then={base.savings.weekly} money /></dd></div>
          </dl>
        </div>
      </div>
    </section>
  )
}
