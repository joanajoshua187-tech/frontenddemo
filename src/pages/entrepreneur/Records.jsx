import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppState } from '../../hooks/useAppState'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useToast } from '../../hooks/useToast'
import { DemoNotice } from '../../components/DemoNotice'
import { Icon } from '../../components/Icon'
import { SOURCES, TELCO_BANK_SOURCES } from '../../data/demoBusiness'
import { inspectImage, safeFileName, MAX_FILES } from '../../utils/fileCheck'
import { cleanText } from '../../utils/sanitize'
import { plain } from '../../utils/format'
import { wait } from '../../services/apiClient'
import { fileFingerprint } from '../../utils/hash'

const PAGE = 20

function SourceCard({ id, status, onConnect, onDisconnect, count }) {
  const source = SOURCES[id]
  const [confirming, setConfirming] = useState(false)
  const connected = status === 'connected'
  return (
    <li className={`source ${connected ? 'is-connected' : ''}`}>
      <div className="source__top">
        <span className="source__name">{source.name}</span>
        <span className={`tag ${connected ? 'tag--good' : ''}`}>{connected ? 'Connected' : 'Not connected'}</span>
      </div>
      <p className="source__meta">{source.kind} · {source.owner}</p>
      {connected ? (
        <>
          <p className="source__count"><strong className="num">{count}</strong> transactions verified by the provider</p>
          <button type="button" className="text-button" onClick={onDisconnect}>Withdraw consent</button>
        </>
      ) : confirming ? (
        <div className="source__confirm">
          <p>Allow Onekana to read your {source.name} statements for the last 6 months? You can withdraw at any time.</p>
          <div className="actions actions--tight">
            <button type="button" className="btn btn--primary btn--small" onClick={() => { setConfirming(false); onConnect() }}>Allow</button>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn--secondary btn--small" onClick={() => setConfirming(true)}>Connect</button>
      )}
    </li>
  )
}

function ReviewItem({ row, original, onResolve }) {
  const [amount, setAmount] = useState(String(row.amount))
  const [error, setError] = useState('')
  return (
    <li className="review">
      <div className="review__head">
        <span className={`tag ${row.flag === 'duplicate' ? 'tag--warn' : 'tag--warn'}`}>{row.flag === 'duplicate' ? 'Possible duplicate' : 'Unclear amount'}</span>
        <span className="num muted">{row.date}</span>
      </div>
      {row.flag === 'duplicate' && original ? (
        <>
          <p>We found the same amount on the same day in two places. Is this one sale or two?</p>
          <div className="compare">
            <div><span>{SOURCES[original.source].name}</span><strong>{original.description}</strong><span className="num">{plain(original.amount)}</span></div>
            <div><span>{SOURCES[row.source].name}</span><strong>{row.description}</strong><span className="num">{plain(row.amount)}</span></div>
          </div>
          <div className="actions actions--tight">
            <button type="button" className="btn btn--secondary btn--small" onClick={() => onResolve({ decision: 'remove' })}>Same sale, remove the copy</button>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => onResolve({ decision: 'keep' })}>Two different sales, keep both</button>
          </div>
        </>
      ) : (
        <>
          <p>One digit in “{row.description}” is smudged. The AI read <strong className="num">{plain(row.amount)}</strong> but is only {Math.round((row.confidence ?? 0.7) * 100)}% sure. What does your ledger say?</p>
          <div className="actions actions--tight">
            <label htmlFor={`amt-${row.id}`} className="visually-hidden">Correct amount</label>
            <input id={`amt-${row.id}`} className="input-small" type="number" inputMode="numeric" step="1000" value={amount} onChange={(e) => { setAmount(e.target.value); setError('') }} />
            <button
              type="button"
              className="btn btn--secondary btn--small"
              onClick={() => {
                const v = Number(amount)
                if (!Number.isFinite(v) || v < 1000) return setError('Enter the amount written in your ledger.')
                onResolve({ decision: 'amount', amount: v })
              }}
            >
              Confirm amount
            </button>
          </div>
          {error && <p className="field__error" role="alert">{error}</p>}
        </>
      )}
    </li>
  )
}

export default function Records() {
  useDocumentTitle('Records and sources')
  const { state, dispatch } = useAppState()
  const notify = useToast()
  const ent = state.ent
  const inputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [rejects, setRejects] = useState([])
  const [stage, setStage] = useState('')
  const [source, setSource] = useState('all')
  const [direction, setDirection] = useState('all')
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(PAGE)
  const counter = useRef(0)
  const filesRef = useRef(files)
  useEffect(() => {
    filesRef.current = files
  }, [files])
  useEffect(() => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.preview)), [])

  const pending = ent.transactions.filter((t) => t.status === 'pending')
  const kept = ent.transactions.filter((t) => t.status !== 'removed')
  const verifiedCount = kept.filter((t) => t.verified).length

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...kept]
      .reverse()
      .filter((t) => (source === 'all' || t.source === source) && (direction === 'all' || t.direction === direction) && (!q || t.description.toLowerCase().includes(q)))
  }, [kept, source, direction, query])

  async function addFiles(list) {
    const problems = []
    const accepted = []
    for (const file of Array.from(list)) {
      if (files.length + accepted.length >= MAX_FILES) {
        problems.push(`You can upload up to ${MAX_FILES} images at a time.`)
        break
      }
      const result = await inspectImage(file)
      if (!result.ok) {
        problems.push(result.reason)
        continue
      }
      const hash = await fileFingerprint(file)
      const seen = (ent.imageHashes ?? []).find((h) => h.hash === hash)
      if (seen) {
        problems.push(`${cleanText(file.name)} is the same photo you uploaded on ${seen.date}. We skipped it so its lines are not counted twice.`)
        continue
      }
      if ([...files, ...accepted].some((f) => f.hash === hash)) {
        problems.push(`${cleanText(file.name)} is already in this batch.`)
        continue
      }
      counter.current += 1
      accepted.push({ id: `${Date.now()}-${counter.current}`, hash, name: cleanText(file.name), safeName: safeFileName(counter.current, result.ext), preview: URL.createObjectURL(file) })
    }
    setRejects(problems)
    if (accepted.length) setFiles((c) => [...c, ...accepted])
  }

  async function analyse(sample) {
    for (const s of ['Reading handwriting in your ledger pages', 'Categorising sales and costs', 'Checking every line against your bank and mobile money records']) {
      setStage(s)
      await wait(800)
    }
    const before = ent.transactions.filter((t) => t.status === 'pending').length
    dispatch({ type: 'ent/upload', files: sample ? 1 : files.length, hashes: sample ? [] : files.map((f) => ({ hash: f.hash, name: f.safeName })) })
    files.forEach((f) => URL.revokeObjectURL(f.preview))
    setFiles([])
    setStage('')
    notify('Records added. Check any flagged lines below.')
    return before
  }

  function connect(id) {
    dispatch({ type: 'ent/connect', source: id })
    notify(`${SOURCES[id].name} connected. Its transactions now count as verified.`)
  }

  return (
    <div className="stack">
      <section aria-labelledby="sources-title">
        <h2 id="sources-title" className="h-section">Connected banks and mobile money</h2>
        <p className="muted">Transactions from a connected provider are verified at the source, so they carry more weight than photos. You choose which to connect.</p>
        <DemoNotice>Connections are simulated. In production each one uses the provider’s official API with your consent.</DemoNotice>
        <ul className="source-grid">
          {TELCO_BANK_SOURCES.map((id) => (
            <SourceCard
              key={id}
              id={id}
              status={ent.connections[id]}
              count={kept.filter((t) => t.source === id).length}
              onConnect={() => connect(id)}
              onDisconnect={() => { dispatch({ type: 'ent/disconnect', source: id }); notify(`${SOURCES[id].name} disconnected.`, 'info') }}
            />
          ))}
        </ul>
      </section>

      <section className="card-block" aria-labelledby="upload-title">
        <h2 id="upload-title" className="h-section">Upload this week’s ledger</h2>
        <p className="muted">Photograph each page of your daftari. Uploading every week raises your trust level.</p>
        <div
          className="dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
        >
          <Icon name="upload" size={26} />
          <p><strong>Drag ledger photos here</strong> or choose them. PNG, JPEG or WebP, up to 5 MB each.</p>
          <button type="button" className="btn btn--secondary" onClick={() => inputRef.current?.click()}>Choose photos</button>
          <label htmlFor="ledger-files" className="visually-hidden">Choose ledger photos</label>
          <input ref={inputRef} id="ledger-files" type="file" accept="image/png,image/jpeg,image/webp" multiple className="visually-hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
        </div>
        {rejects.length > 0 && <ul className="reject-list" role="alert">{rejects.map((r) => <li key={r}><Icon name="alert" size={16} /> {r}</li>)}</ul>}
        {files.length > 0 && (
          <ul className="thumbs">
            {files.map((f) => (
              <li key={f.id}>
                <img src={f.preview} alt={`Ledger photo ${f.name}`} />
                <span className="mono-small">{f.safeName}</span>
              </li>
            ))}
          </ul>
        )}
        {stage ? (
          <div className="progress-panel" role="status" aria-live="polite"><div className="progress-panel__bar"><span /></div><p>{stage}…</p></div>
        ) : (
          <div className="actions">
            <button type="button" className="btn btn--primary" disabled={!files.length} onClick={() => analyse(false)}>Read {files.length || ''} {files.length === 1 ? 'photo' : 'photos'} with AI</button>
            <button type="button" className="btn btn--ghost" onClick={() => analyse(true)}>Use a sample ledger page</button>
          </div>
        )}
      </section>

      <section id="review" className="card-block" aria-labelledby="review-title">
        <h2 id="review-title" className="h-section">Lines waiting for your answer</h2>
        {pending.length === 0 ? (
          <p className="ok-box"><Icon name="check" /> Nothing to review. Every line has been checked.</p>
        ) : (
          <ul className="review-list">
            {pending.map((row) => (
              <ReviewItem
                key={row.id}
                row={row}
                original={ent.transactions.find((t) => t.id === row.duplicateOf)}
                onResolve={(r) => { dispatch({ type: 'ent/resolve', id: row.id, ...r }); notify('Thanks. Your answer is saved in the activity log.') }}
              />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="ledger-title">
        <div className="section-block__head">
          <div>
            <h2 id="ledger-title" className="h-section">Every record we keep</h2>
            <p className="muted"><strong className="num">{kept.length}</strong> records · <strong className="num">{verifiedCount}</strong> verified by a provider · <strong className="num">{kept.length - verifiedCount}</strong> from your ledger</p>
          </div>
          <div className="filters">
            <label htmlFor="f-source" className="visually-hidden">Source</label>
            <select id="f-source" value={source} onChange={(e) => { setSource(e.target.value); setShown(PAGE) }}>
              <option value="all">All sources</option>
              {Object.values(SOURCES).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label htmlFor="f-dir" className="visually-hidden">Direction</label>
            <select id="f-dir" value={direction} onChange={(e) => { setDirection(e.target.value); setShown(PAGE) }}>
              <option value="all">In and out</option>
              <option value="in">Money in</option>
              <option value="out">Money out</option>
            </select>
            <label htmlFor="f-q" className="visually-hidden">Search</label>
            <input id="f-q" type="search" placeholder="Search" value={query} onChange={(e) => { setQuery(e.target.value); setShown(PAGE) }} />
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="empty">No records match. Connect a source or upload your ledger to begin.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th scope="col">Date</th><th scope="col">Description</th><th scope="col">Category</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col" className="num-col">Amount</th></tr>
                </thead>
                <tbody>
                  {filtered.slice(0, shown).map((t) => (
                    <tr key={t.id} className={t.status === 'pending' ? 'is-flagged' : ''}>
                      <td className="num nowrap">{t.date}</td>
                      <td>{t.description}</td>
                      <td>{t.category}</td>
                      <td>{SOURCES[t.source].name}</td>
                      <td>
                        {t.status === 'pending' ? <span className="tag tag--warn">Needs answer</span> : t.verified ? <span className="tag tag--good">Verified</span> : <span className="tag">Owner confirmed</span>}
                      </td>
                      <td className={`num-col num ${t.direction === 'in' ? 'is-in' : ''}`}>{t.direction === 'in' ? '+' : '−'}{plain(t.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {shown < filtered.length && (
              <div className="actions"><button type="button" className="btn btn--ghost" onClick={() => setShown((s) => s + PAGE)}>Show {Math.min(PAGE, filtered.length - shown)} more of {filtered.length - shown}</button></div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
