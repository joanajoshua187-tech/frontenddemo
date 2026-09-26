import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AssistantContext } from '../context/assistantContext'
import { useAppState } from '../hooks/useAppState'
import { useAssessment } from '../hooks/useAssessment'
import { useSpeech } from '../hooks/useSpeech'
import { respond, SUGGESTIONS, GREETING } from '../data/assistantIntents'
import { Icon } from './Icon'

export function AssistantProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState('en')
  const [aloud, setAloud] = useState(true)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState(() => [{ id: 0, from: 'bot', text: GREETING.en }])
  const counter = useRef(1)
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { state } = useAppState()
  const report = useAssessment()
  const { supported, listening, error, listen, stop, speak, silence } = useSpeech(lang)

  const ctx = useMemo(
    () => ({
      verified: state.verification?.status === 'verified',
      report,
      investor: state.investor,
      balance: state.wallet.balance,
    }),
    [state.verification, state.investor, state.wallet.balance, report],
  )

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const openAssistant = useCallback(() => {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const add = (from, text) => {
    counter.current += 1
    const id = counter.current
    setMessages((current) => [...current.slice(-30), { id, from, text }])
  }

  const ask = useCallback(
    (text) => {
      const clean = text.trim().slice(0, 200)
      if (!clean) return
      add('user', clean)
      const { reply, to } = respond(clean, lang, ctx)
      setTimeout(() => {
        add('bot', reply)
        if (aloud) speak(reply)
        if (to) navigate(to)
      }, 250)
    },
    [lang, ctx, aloud, speak, navigate],
  )

  function submit(event) {
    event.preventDefault()
    ask(draft)
    setDraft('')
  }

  function switchLang(next) {
    if (next === lang) return
    setLang(next)
    add('bot', GREETING[next])
  }

  function close() {
    setOpen(false)
    stop()
    silence()
  }

  return (
    <AssistantContext.Provider value={{ openAssistant }}>
      {children}
      {!open && (
        <button type="button" className="assistant-fab" onClick={openAssistant} aria-label="Open the voice assistant">
          <Icon name="mic" size={22} />
          <span className="assistant-fab__label">Ask</span>
        </button>
      )}
      {open && (
        <section className="assistant" role="dialog" aria-modal="false" aria-labelledby="assistant-title">
          <header className="assistant__head">
            <div>
              <h2 id="assistant-title">Voice assistant</h2>
              <p>{supported ? 'Speak or type' : 'Type your question'}</p>
            </div>
            <div className="assistant__lang" role="group" aria-label="Language">
              <button type="button" aria-pressed={lang === 'en'} onClick={() => switchLang('en')}>EN</button>
              <button type="button" aria-pressed={lang === 'sw'} onClick={() => switchLang('sw')}>SW</button>
            </div>
            <button type="button" className="assistant__close" onClick={close} aria-label="Close the assistant">
              <Icon name="close" />
            </button>
          </header>

          <ol className="assistant__log" ref={listRef} aria-live="polite">
            {messages.map((m) => (
              <li key={m.id} className={`bubble bubble--${m.from}`} lang={m.from === 'bot' ? (lang === 'sw' ? 'sw' : 'en') : undefined}>
                {m.text}
              </li>
            ))}
          </ol>

          <div className="assistant__chips">
            {SUGGESTIONS[lang].map((s) => (
              <button key={s} type="button" className="chip-button" onClick={() => ask(s)}>{s}</button>
            ))}
          </div>

          {error && <p className="assistant__error" role="alert">{error}</p>}

          <form className="assistant__form" onSubmit={submit}>
            <label htmlFor="assistant-input" className="visually-hidden">Your question</label>
            <input
              id="assistant-input"
              ref={inputRef}
              type="text"
              autoComplete="off"
              maxLength={200}
              placeholder={lang === 'sw' ? 'Andika swali lako…' : 'Type your question…'}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              type="button"
              className={`assistant__mic ${listening ? 'is-listening' : ''}`}
              onClick={() => (listening ? stop() : listen(ask))}
              aria-label={listening ? 'Stop listening' : 'Speak your question'}
              aria-pressed={listening}
            >
              <Icon name={listening ? 'stop' : 'mic'} />
            </button>
            <button type="submit" className="assistant__send" aria-label="Send" disabled={!draft.trim()}>
              <Icon name="send" />
            </button>
          </form>

          <label className="assistant__aloud" htmlFor="assistant-aloud">
            <input id="assistant-aloud" type="checkbox" checked={aloud} onChange={(e) => { setAloud(e.target.checked); if (!e.target.checked) silence() }} />
            Read answers aloud
          </label>
        </section>
      )}
    </AssistantContext.Provider>
  )
}
