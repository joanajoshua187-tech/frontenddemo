import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../../hooks/useAppState'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { listings, CATEGORIES, RISK_LEVELS } from '../../data/listings'
import { fitFor, requiredLessons } from '../../utils/risk'
import { tsh } from '../../utils/format'
import { Icon } from '../../components/Icon'

const SORTS = {
  recommended: { label: 'Best fit first', fn: (a, b) => Number(b.fit.fits) - Number(a.fit.fits) || a.riskScore - b.riskScore },
  risk: { label: 'Lowest risk first', fn: (a, b) => a.riskScore - b.riskScore },
  lock: { label: 'Shortest lock-up first', fn: (a, b) => a.lockMonths - b.lockMonths },
  unit: { label: 'Cheapest unit first', fn: (a, b) => a.unitPrice - b.unitPrice },
}

export default function Marketplace() {
  useDocumentTitle('Marketplace')
  const { state } = useAppState()
  const inv = state.inv
  const [category, setCategory] = useState('All')
  const [risk, setRisk] = useState('Any risk')
  const [onlyFit, setOnlyFit] = useState(false)
  const [sort, setSort] = useState('recommended')
  const [compare, setCompare] = useState([])

  const items = useMemo(
    () =>
      listings
        .map((l) => ({ ...l, fit: fitFor(l, inv.investor), gates: requiredLessons(l).filter((g) => !inv.lessonsDone.includes(g)) }))
        .filter((l) => (category === 'All' || l.category === category) && (risk === 'Any risk' || l.risk === risk) && (!onlyFit || l.fit.fits))
        .sort(SORTS[sort].fn),
    [category, risk, onlyFit, sort, inv.investor, inv.lessonsDone],
  )

  const compared = compare.map((id) => listings.find((l) => l.id === id))

  function toggleCompare(id) {
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]))
  }

  return (
    <div className="stack">
      <section className="market-intro">
        <h2 className="h-section">Verified opportunities</h2>
        <p className="muted">Every listing passed registration checks and shows its records. Buy small units, compare up to three side by side, and read the risk in plain words before you decide.</p>
      </section>

      <div className="chip-row" role="group" aria-label="Category">
        {['All', ...CATEGORIES].map((c) => (
          <button key={c} type="button" className={`chip-button ${category === c ? 'is-selected' : ''}`} aria-pressed={category === c} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="filters filters--bar">
        <label htmlFor="m-risk" className="visually-hidden">Risk</label>
        <select id="m-risk" value={risk} onChange={(e) => setRisk(e.target.value)}>
          {['Any risk', ...RISK_LEVELS].map((r) => <option key={r}>{r}</option>)}
        </select>
        <label htmlFor="m-sort" className="visually-hidden">Sort</label>
        <select id="m-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
        </select>
        <label className="toggle" htmlFor="m-fit">
          <input id="m-fit" type="checkbox" role="switch" checked={onlyFit} onChange={(e) => setOnlyFit(e.target.checked)} />
          <span className="toggle__track" aria-hidden="true"><span className="toggle__thumb" /></span>
          <span>Only what fits my profile</span>
        </label>
      </div>

      {items.length === 0 ? (
        <p className="empty">Nothing matches these filters. Try another category or switch off the profile filter.</p>
      ) : (
        <ul className="listing-grid">
          {items.map((l) => {
            const left = l.units - l.unitsSold
            return (
              <li key={l.id} className="listing-card">
                <div className="listing-card__top">
                  <span className="tag">{l.category}</span>
                  <span className={`risk risk--${l.risk.toLowerCase()}`}>{l.risk} risk</span>
                </div>
                <h3><Link to={`/investor/app/listing/${l.id}`} className="listing-card__link">{l.name}</Link></h3>
                <p className="listing-card__place">{l.place}{l.sandbox ? ' · sandbox' : ''}</p>
                <p className="listing-card__purpose">{l.purpose}</p>
                <div className="meter" aria-hidden="true"><span style={{ width: `${(l.unitsSold / l.units) * 100}%` }} /></div>
                <p className="listing-card__raised num">{left.toLocaleString('en-US')} of {l.units.toLocaleString('en-US')} units left</p>
                <dl className="listing-card__facts">
                  <div><dt>One unit</dt><dd className="num">{tsh(l.unitPrice)}</dd></div>
                  <div><dt>Locked</dt><dd className="num">{l.lockMonths} mo</dd></div>
                  <div><dt>Past range</dt><dd className="num">{l.returnLow}–{l.returnHigh}%</dd></div>
                </dl>
                <p className={`fit ${l.fit.fits ? 'fit--yes' : 'fit--no'}`}>
                  <Icon name={l.fit.fits ? 'check' : 'alert'} size={14} /> {l.fit.fits ? 'Fits your profile' : 'Outside your profile'}
                </p>
                {l.gates.length > 0 && <p className="gate"><Icon name="lock" size={14} /> Finish {l.gates.length} {l.gates.length === 1 ? 'lesson' : 'lessons'} to unlock</p>}
                <div className="listing-card__actions">
                  <Link to={`/investor/app/listing/${l.id}`} className="btn btn--secondary btn--small">Read the details</Link>
                  <label className="compare-check" htmlFor={`cmp-${l.id}`}>
                    <input id={`cmp-${l.id}`} type="checkbox" checked={compare.includes(l.id)} disabled={!compare.includes(l.id) && compare.length >= 3} onChange={() => toggleCompare(l.id)} />
                    Compare
                  </label>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {compared.length >= 2 && (
        <section className="card-block compare-panel" aria-labelledby="compare-title">
          <div className="section-block__head">
            <h2 id="compare-title" className="h-section">Side by side</h2>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => setCompare([])}>Clear</button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th scope="col">Detail</th>{compared.map((l) => <th key={l.id} scope="col">{l.name}</th>)}</tr>
              </thead>
              <tbody>
                <tr><th scope="row">Category</th>{compared.map((l) => <td key={l.id}>{l.category}</td>)}</tr>
                <tr><th scope="row">Risk</th>{compared.map((l) => <td key={l.id}>{l.risk}, <span className="num">{l.riskScore}</span>/100</td>)}</tr>
                <tr><th scope="row">Locked for</th>{compared.map((l) => <td key={l.id} className="num">{l.lockMonths} months</td>)}</tr>
                <tr><th scope="row">Past return range</th>{compared.map((l) => <td key={l.id} className="num">{l.returnLow} to {l.returnHigh}% a year</td>)}</tr>
                <tr><th scope="row">One unit</th>{compared.map((l) => <td key={l.id} className="num">{tsh(l.unitPrice)}</td>)}</tr>
                <tr><th scope="row">Readiness score</th>{compared.map((l) => <td key={l.id} className="num">{l.score ?? 'Not applicable'}</td>)}</tr>
                <tr><th scope="row">Biggest risk</th>{compared.map((l) => <td key={l.id}>{[...l.riskFactors].sort((a, b) => (b.level === 'High') - (a.level === 'High'))[0].label}</td>)}</tr>
                <tr><th scope="row">Fits your profile</th>{compared.map((l) => <td key={l.id}>{fitFor(l, inv.investor).fits ? 'Yes' : 'No'}</td>)}</tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
      {compared.length === 1 && <p className="note">Tick one more listing to compare side by side.</p>}
    </div>
  )
}
