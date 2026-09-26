import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../hooks/useAppState'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Stepper } from '../components/Stepper'
import { DemoNotice } from '../components/DemoNotice'
import { Icon } from '../components/Icon'
import { FLOW_STEPS } from '../data/flow'
import { inspectImage, safeFileName, MAX_FILES } from '../utils/fileCheck'
import { analyseRecords } from '../services/analysis'
import { plain } from '../utils/format'
import { cleanText } from '../utils/sanitize'

const KINDS = [
  { value: 'ledger', label: 'Ledger page' },
  { value: 'mobile', label: 'Mobile money screenshot' },
]

export default function EntrepreneurRecords() {
  useDocumentTitle('Upload records')
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [rejects, setRejects] = useState([])
  const [dragging, setDragging] = useState(false)
  const [stage, setStage] = useState('')
  const [failure, setFailure] = useState('')
  const [rows, setRows] = useState(() => state.extraction?.rows ?? [])
  const counter = useRef(0)

  const filesRef = useRef(files)
  useEffect(() => {
    filesRef.current = files
  }, [files])
  useEffect(() => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.preview)), [])

  async function addFiles(list) {
    const incoming = Array.from(list)
    const problems = []
    const accepted = []
    for (const file of incoming) {
      if (files.length + accepted.length >= MAX_FILES) {
        problems.push(`You can upload up to ${MAX_FILES} images at a time.`)
        break
      }
      const result = await inspectImage(file)
      if (!result.ok) {
        problems.push(result.reason)
        continue
      }
      counter.current += 1
      accepted.push({
        id: `${Date.now()}-${counter.current}`,
        file,
        originalName: cleanText(file.name),
        safeName: safeFileName(counter.current, result.ext),
        preview: URL.createObjectURL(file),
        kind: /mpesa|mobile|screenshot|statement/i.test(file.name) ? 'mobile' : 'ledger',
      })
    }
    setRejects(problems)
    if (accepted.length) setFiles((current) => [...current, ...accepted])
  }

  function removeFile(id) {
    setFiles((current) => {
      const target = current.find((f) => f.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return current.filter((f) => f.id !== id)
    })
  }

  async function analyse() {
    setFailure('')
    try {
      const extraction = await analyseRecords(files, setStage)
      dispatch({ type: 'records/extracted', extraction })
      setRows(extraction.rows)
    } catch (error) {
      setFailure(error.message)
    } finally {
      setStage('')
    }
  }

  function resolveRow(id, change) {
    setRows((current) => current.map((r) => (r.id === id ? { ...r, ...change, flag: undefined } : r)))
  }

  function removeRow(id) {
    setRows((current) => current.filter((r) => r.id !== id))
  }

  const openFlags = rows.filter((r) => r.flag).length
  const extracted = Boolean(state.extraction) && rows.length > 0

  function confirm() {
    dispatch({ type: 'records/confirmed', extraction: { ...state.extraction, rows } })
    navigate('/entrepreneur/report')
  }

  return (
    <section className="page">
      <Stepper steps={FLOW_STEPS} current={extracted ? 2 : 1} />
      <h1 className="page__title">{extracted ? 'Check what the AI read' : `Upload records for ${state.business.businessName}`}</h1>
      <p className="page__lede">
        {extracted
          ? 'Here is a sample of the lines taken from your records. Fix anything flagged, then confirm.'
          : 'Add clear photos of your ledger pages and screenshots of your mobile money statements. PNG, JPEG or WebP, up to 5 MB each.'}
      </p>
      <DemoNotice>Your images stay in this browser. The analysis shows sample lines from a demo business.</DemoNotice>

      {!extracted && (
        <>
          <div
            className={`dropzone ${dragging ? 'is-dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
          >
            <Icon name="upload" size={28} />
            <p><strong>Drag images here</strong> or choose them from your phone or computer.</p>
            <button type="button" className="btn btn--dark" onClick={() => inputRef.current?.click()}>Choose images</button>
            <input
              ref={inputRef}
              id="record-files"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="visually-hidden"
              onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
            />
            <label htmlFor="record-files" className="visually-hidden">Choose record images</label>
          </div>

          {rejects.length > 0 && (
            <ul className="reject-list" role="alert">
              {rejects.map((r) => <li key={r}><Icon name="alert" size={16} /> {r}</li>)}
            </ul>
          )}

          {files.length > 0 && (
            <ul className="file-grid">
              {files.map((f) => (
                <li key={f.id} className="file-card">
                  <img src={f.preview} alt={`Uploaded record ${f.originalName}`} />
                  <div className="file-card__body">
                    <p className="file-card__name" title={f.originalName}>{f.originalName}</p>
                    <p className="file-card__safe">Stored as {f.safeName}</p>
                    <label className="visually-hidden" htmlFor={`kind-${f.id}`}>Type of record</label>
                    <select id={`kind-${f.id}`} value={f.kind} onChange={(e) => setFiles((cur) => cur.map((x) => (x.id === f.id ? { ...x, kind: e.target.value } : x)))}>
                      {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                    </select>
                    <button type="button" className="text-button" onClick={() => removeFile(f.id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {stage ? (
            <div className="progress-panel" role="status" aria-live="polite">
              <div className="progress-panel__bar"><span /></div>
              <p>{stage}…</p>
            </div>
          ) : (
            <div className="actions">
              <button type="button" className="btn btn--primary" onClick={analyse} disabled={files.length === 0}>
                Analyse {files.length || ''} {files.length === 1 ? 'image' : 'images'}
              </button>
              <button type="button" className="btn btn--ghost" onClick={analyse}>Use sample records instead</button>
            </div>
          )}
          {failure && <p className="form__failure" role="alert">{failure}</p>}
        </>
      )}

      {extracted && (
        <>
          <div className="summary-strip">
            <span><strong className="num">{plain(state.extraction.linesRead)}</strong> lines read</span>
            <span><strong className="num">{Math.round(state.extraction.verifiedShare * 100)}%</strong> matched with mobile money</span>
            <span className={openFlags ? 'is-warn' : 'is-good'}><strong className="num">{openFlags}</strong> {openFlags === 1 ? 'line needs' : 'lines need'} your check</span>
          </div>
          <div className="table-wrap">
            <table className="data-table lines-table">
              <thead>
                <tr><th scope="col">Date</th><th scope="col">What</th><th scope="col">Source</th><th scope="col" className="num-col">AI confidence</th><th scope="col" className="num-col">Amount</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={r.flag ? 'is-flagged' : ''}>
                    <td className="num">{r.date}</td>
                    <td>
                      {r.description}
                      {r.flag === 'unclear' && <UnclearFix row={r} onConfirm={(amount) => resolveRow(r.id, { amount, confidence: 1 })} />}
                      {r.flag === 'duplicate' && (
                        <div className="flag-box">
                          <p>This may be the same payment as the mobile money line on {r.date}.</p>
                          <div className="actions actions--tight">
                            <button type="button" className="btn btn--dark btn--small" onClick={() => removeRow(r.id)}>Same payment, remove</button>
                            <button type="button" className="btn btn--ghost btn--small" onClick={() => resolveRow(r.id, { confidence: 1 })}>Different sale, keep</button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td><span className={`tag ${r.source === 'mobile' ? 'tag--good' : ''}`}>{r.source === 'mobile' ? 'Mobile money' : 'Ledger'}</span></td>
                    <td className="num-col num">{Math.round(r.confidence * 100)}%</td>
                    <td className={`num-col num ${r.direction === 'in' ? 'is-in' : ''}`}>{r.direction === 'in' ? '+' : '−'}{plain(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="actions">
            <button type="button" className="btn btn--primary" onClick={confirm} disabled={openFlags > 0}>
              Confirm and build my report <Icon name="arrow" />
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => { setRows([]); dispatch({ type: 'records/extracted', extraction: null }) }}>
              Upload different images
            </button>
            {openFlags > 0 && <p className="note">Resolve the flagged {openFlags === 1 ? 'line' : 'lines'} to continue.</p>}
          </div>
        </>
      )}
    </section>
  )
}

function UnclearFix({ row, onConfirm }) {
  const [value, setValue] = useState(String(row.amount))
  const [error, setError] = useState('')
  const id = `fix-${row.id}`
  function submit() {
    const amount = Number(value)
    if (!Number.isFinite(amount) || amount < 1000) {
      setError('Enter the amount written in your ledger.')
      return
    }
    onConfirm(amount)
  }
  return (
    <div className="flag-box">
      <p>One digit is smudged. The AI read {plain(row.amount)}. What does your ledger say?</p>
      <div className="actions actions--tight">
        <label htmlFor={id} className="visually-hidden">Correct amount</label>
        <input id={id} type="number" inputMode="numeric" step="1000" value={value} onChange={(e) => setValue(e.target.value)} aria-invalid={Boolean(error)} />
        <button type="button" className="btn btn--dark btn--small" onClick={submit}>Confirm amount</button>
      </div>
      {error && <p className="field__error" role="alert">{error}</p>}
    </div>
  )
}
