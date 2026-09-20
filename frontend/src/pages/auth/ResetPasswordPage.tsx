import { useState, useEffect, type FormEvent } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../../services/api'
import Logo from '../../components/Logo'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const urlToken = searchParams.get('token')
    if (urlToken) {
      setToken(urlToken.trim())
    }
  }, [searchParams])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!token.trim()) {
      setError('Please provide a valid password reset token')
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword,
      })
      setSuccess(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-container" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div className="auth-card" style={{ width: '100%' }}>
          <div className="auth-heading">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <Logo size={42} />
            </div>
            <h1>Set new password</h1>
            <p>Enter your reset token and choose a secure new password for your account.</p>
          </div>

          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(5, 150, 105, 0.12)',
                  color: '#059669',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '28px',
                  margin: '0 auto 16px',
                }}
              >
                <i className="bi bi-check-lg" />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Password Reset Successfully!
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                Your account password has been updated. You can now sign in using your new credentials.
              </p>
              <button
                type="button"
                className="button primary"
                style={{ width: '100%' }}
                onClick={() => navigate('/login')}
              >
                <i className="bi bi-box-arrow-in-right" /> Proceed to Login
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="alert-banner" role="alert" style={{ marginBottom: '16px' }}>
                  <i className="bi bi-exclamation-circle-fill" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="field">
                  <label htmlFor="reset-token">Reset Token</label>
                  <div className="input-wrap">
                    <i className="bi bi-key" />
                    <input
                      id="reset-token"
                      type="text"
                      placeholder="Paste your reset token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="reset-new-password">New Password</label>
                  <div className="input-wrap">
                    <i className="bi bi-lock" />
                    <input
                      id="reset-new-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="reset-confirm-password">Confirm New Password</label>
                  <div className="input-wrap">
                    <i className="bi bi-lock-fill" />
                    <input
                      id="reset-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="button primary auth-submit"
                  disabled={submitting}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  {submitting ? (
                    <>
                      <span className="loader-spinner light" aria-hidden="true" />
                      Updating Password…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-check" />
                      Save New Password
                    </>
                  )}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link to="/login" style={{ fontSize: '0.86rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
                  <i className="bi bi-arrow-left" /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
