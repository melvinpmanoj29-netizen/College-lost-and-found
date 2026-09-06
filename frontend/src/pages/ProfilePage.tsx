import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/api'

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth()
  const [studentName, setStudentName] = useState(user?.studentName ?? '')
  const [className, setClassName] = useState(user?.className ?? '')
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImageUrl ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!user) return null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!studentName.trim() || !className.trim()) {
      setError('Name and class are required')
      return
    }
    setSubmitting(true)
    setError(null)
    setSuccess(false)
    try {
      await updateProfile({
        studentName: studentName.trim(),
        className: className.trim(),
        profileImageUrl: profileImageUrl.trim() || null,
      })
      setSuccess(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="profile-page page-width">
      <div className="profile-head">
        <div>
          <span className="section-kicker">MY PROFILE</span>
          <h1>Your account</h1>
          <p>Manage the personal details shown across the campus.</p>
        </div>
        <button type="button" className="button secondary" onClick={logout}>
          <i className="bi bi-box-arrow-right" /> Log out
        </button>
      </div>

      <div className="profile-layout">
        <aside className="profile-card profile-side">
          {user.profileImageUrl ? (
            <img className="profile-avatar-img" src={user.profileImageUrl} alt={`${user.studentName}'s avatar`} />
          ) : (
            <span className="profile-avatar">{initialsOf(user.studentName)}</span>
          )}
          <h2>{user.studentName}</h2>
          <span className={`role-badge ${user.role === 'ADMIN' ? 'admin' : ''}`}>
            <i className={`bi ${user.role === 'ADMIN' ? 'bi-shield-check' : 'bi-mortarboard'}`} />
            {user.role}
          </span>
          <dl className="profile-facts">
            <div><dt>Email</dt><dd>{user.email}</dd></div>
            <div><dt>Roll number</dt><dd>{user.rollNumber}</dd></div>
            <div><dt>Class</dt><dd>{user.className}</dd></div>
            <div><dt>Member since</dt><dd>Registered student account</dd></div>
          </dl>
        </aside>

        <div className="profile-card profile-main">
          <h2>Edit profile</h2>
          <p className="profile-sub">Changes apply to your account across the campus.</p>

          {success && (
            <div className="alert-banner success" role="status">
              <i className="bi bi-check-circle" />
              <span>Profile updated successfully.</span>
            </div>
          )}
          {error && (
            <div className="alert-banner" role="alert">
              <i className="bi bi-exclamation-circle" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="profile-name">Student name</label>
              <div className="input-wrap">
                <i className="bi bi-person" />
                <input
                  id="profile-name"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="profile-class">Class / department</label>
              <div className="input-wrap">
                <i className="bi bi-mortarboard" />
                <input
                  id="profile-class"
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="profile-image">Profile image URL <small>(optional)</small></label>
              <div className="input-wrap">
                <i className="bi bi-image" />
                <input
                  id="profile-image"
                  type="url"
                  placeholder="https://res.cloudinary.com/…"
                  value={profileImageUrl}
                  onChange={(e) => setProfileImageUrl(e.target.value)}
                />
              </div>
              <p className="auth-hint">Images are hosted on Cloudinary; only the URL is stored.</p>
            </div>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="loader-spinner light" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg" />
                  Save changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}