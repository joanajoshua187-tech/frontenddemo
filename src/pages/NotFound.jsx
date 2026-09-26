import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <section className="page page--narrow not-found">
      <p className="not-found__code num">404</p>
      <h1 className="page__title">This page is not in the ledger</h1>
      <p className="page__lede">The link may be old or mistyped.</p>
      <div className="actions">
        <Link to="/" className="btn btn--primary">Go to the home page</Link>
        <Link to="/about" className="btn btn--ghost">About Africa Credit OS</Link>
      </div>
    </section>
  )
}
