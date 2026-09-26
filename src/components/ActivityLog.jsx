import { verifyChain } from '../utils/ledger'
import { Icon } from './Icon'

export function ActivityLog({ log, title = 'Activity log' }) {
  const intact = verifyChain(log)
  return (
    <section className="activity" aria-labelledby="activity-title">
      <div className="activity__head">
        <div>
          <h2 id="activity-title">{title}</h2>
          <p>Every action is written here and never edited. Each entry carries the fingerprint of the one before it, so a changed or deleted entry breaks the chain.</p>
        </div>
        <span className={`chain-badge ${intact ? 'is-ok' : 'is-broken'}`}>
          <Icon name={intact ? 'check' : 'alert'} size={16} /> {intact ? `Chain intact, ${log.length} entries` : 'Chain broken'}
        </span>
      </div>
      {log.length === 0 ? (
        <p className="empty">Nothing recorded yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th scope="col">#</th><th scope="col">When</th><th scope="col">What happened</th><th scope="col">Details</th><th scope="col">Fingerprint</th></tr>
            </thead>
            <tbody>
              {[...log].reverse().map((e) => (
                <tr key={e.n}>
                  <td className="num">{e.n}</td>
                  <td className="num nowrap">{new Date(e.at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <th scope="row">{e.action}</th>
                  <td>{e.detail}</td>
                  <td className="mono-small" title={`Previous: ${e.prev}`}>{e.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
