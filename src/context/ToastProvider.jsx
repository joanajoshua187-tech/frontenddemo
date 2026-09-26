import { useCallback, useRef, useState } from 'react'
import { ToastContext } from './toastContext'
import { Icon } from '../components/Icon'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (message, tone = 'good') => {
      counter.current += 1
      const id = counter.current
      setToasts((current) => [...current.slice(-2), { id, message, tone }])
      setTimeout(() => dismiss(id), 3200)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone}`}>
            <span className="toast__icon"><Icon name={t.tone === 'warn' ? 'alert' : 'check'} size={16} /></span>
            <span>{t.message}</span>
            <button type="button" className="toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
