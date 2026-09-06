import { Link } from 'react-router-dom'

export default function ForbiddenPage() {
  return (
    <section className="auth-page">
      <div className="auth-card center-text">
        <span className="forbidden-icon"><i className="bi bi-shield-lock" /></span>
        <h1>Access denied</h1>
        <p className="forbidden-text">
          You don&apos;t have permission to view this page. This area is reserved for
          administrators.
        </p>
        <Link to="/" className="button primary auth-submit">
          <i className="bi bi-house" /> Back to home
        </Link>
      </div>
    </section>
  )
}