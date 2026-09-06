import { useAuth } from '../context/AuthContext'

/**
 * Minimal shell for the admin area. The full admin dashboard (statistics,
 * claim review, report management, return history) is owned by Developer 4;
 * this page only establishes the ADMIN-only route boundary.
 */
export default function AdminPage() {
  const { user } = useAuth()

  return (
    <section className="admin-page page-width">
      <div className="admin-hero">
        <span className="section-kicker">ADMIN AREA</span>
        <h1>Administration</h1>
        <p>
          Signed in as <strong>{user?.email}</strong> with the <strong>ADMIN</strong> role.
          You have full access to the campus lost &amp; found system.
        </p>
        <div className="admin-actions">
          <button className="button primary" type="button" disabled>
            <i className="bi bi-speedometer2" /> Dashboard
          </button>
          <button className="button secondary" type="button" disabled>
            <i className="bi bi-flag" /> Manage reports
          </button>
          <button className="button secondary" type="button" disabled>
            <i className="bi bi-chat-square-text" /> Review claims
          </button>
        </div>
        <p className="admin-note">
          <i className="bi bi-info-circle" />
          The admin dashboard is under development by Developer 4. This page confirms that only
          ADMIN accounts can reach this area.
        </p>
      </div>
    </section>
  )
}