import { useState } from 'react'
import { Link } from 'react-router-dom'

const KEY = 'mizani-cookie-notice'

function readDismissed() {
  try {
    return window.sessionStorage.getItem(KEY) === 'seen'
  } catch {
    return false
  }
}

export function CookieNotice() {
  const [hidden, setHidden] = useState(readDismissed)

  if (hidden) return null

  function dismiss() {
    try {
      window.sessionStorage.setItem(KEY, 'seen')
    } catch {
      return setHidden(true)
    }
    setHidden(true)
  }

  return (
    <section className="cookie-notice" aria-label="Cookie notice">
      <p>
        We use two cookies that keep you signed in and protect our forms. No tracking or advertising cookies.{' '}
        <Link to="/cookies">Read the cookie policy</Link>.
      </p>
      <button type="button" className="btn btn--dark btn--small" onClick={dismiss}>
        Understood
      </button>
    </section>
  )
}
