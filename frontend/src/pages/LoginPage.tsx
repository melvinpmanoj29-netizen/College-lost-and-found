import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api, { getErrorMessage } from '../services/api'

interface FieldErrors {
  email?: string
  password?: string
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSubmitting, setForgotSubmitting] = useState(false)
  const [forgotError, setForgotError] = useState<string | null>(null)
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null)

  const from = (location.state as { from?: string } | null)?.from

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const errors: FieldErrors = {}
    if (!email.trim()) errors.email = 'Email address is required'
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Enter a valid email address'
    if (!password) errors.password = 'Password is required'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    setError(null)
    try {
      const user = await login(email.trim(), password)
      navigate(from ?? (user.role === 'ADMIN' ? '/admin' : '/dashboard'), { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleForgotSubmit(event: FormEvent) {
    event.preventDefault()
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address')
      return
    }
    setForgotSubmitting(true)
    setForgotError(null)
    setForgotSuccessMessage(null)

    try {
      const { data } = await api.post<{ message: string }>('/auth/forgot-password', {
        email: forgotEmail.trim(),
      })
      setForgotSuccessMessage(data.message || 'Password reset instructions have been sent.')
    } catch (err) {
      setForgotError(getErrorMessage(err))
    } finally {
      setForgotSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-container">
        {/* Left Side: Campus Branding & Highlight */}
        <div className="auth-side-panel">
          <div className="auth-side-header">
            <span className="auth-side-kicker">
              <i className="bi bi-shield-check" /> OFFICIAL CAMPUS PORTAL
            </span>
            <h2>Reconnecting students with their lost valuables.</h2>
            <p>
              Smart matching algorithms, secure claims verification, and real-time alerts across all campus departments.
            </p>
          </div>

          <div className="auth-side-features">
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><i className="bi bi-lightning-charge-fill" /></span>
              <div>
                <strong>Real-Time Item Matching</strong>
                <span>Instant notifications when your missing item is found.</span>
              </div>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><i className="bi bi-award-fill" /></span>
              <div>
                <strong>Verified Ownership Claim</strong>
                <span>Secure department pickup with student ID validation.</span>
              </div>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon"><i className="bi bi-geo-alt-fill" /></span>
              <div>
                <strong>Central Campus Recovery</strong>
                <span>Find designated lost &amp; found desks across campus blocks.</span>
              </div>
            </div>
          </div>

          <div className="auth-side-footer">
            <i className="bi bi-info-circle" />
            <span>Need assistance? Visit the Central Security Desk at Main Block.</span>
          </div>
        </div>

        {/* Right Side: Sign-in Form Card */}
        <div className="auth-card">
          <div className="auth-heading">
            <span className="brand-mark auth-logo"><i className="bi bi-box-seam" /></span>
            <h1>Welcome back</h1>
            <p>Sign in with your campus credentials to access your dashboard.</p>
          </div>

          {error && (
            <div className="alert-banner" role="alert">
              <i className="bi bi-exclamation-circle-fill" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-wrap">
                <i className="bi bi-envelope" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={fieldErrors.email ? true : undefined}
                />
              </div>
              {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
            </div>

            <div className="field">
              <div className="field-label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="login-password">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email)
                    setForgotError(null)
                    setForgotSuccessMessage(null)
                    setShowForgotModal(true)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-wrap">
                <i className="bi bi-lock" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={fieldErrors.password ? true : undefined}
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
              {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
            </div>

            <button type="submit" className="button primary auth-submit" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="loader-spinner light" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right" />
                  Sign In to Portal
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>New to College Lost &amp; Found?</span>
          </div>

          <Link to="/register" className="button secondary auth-submit">
            <i className="bi bi-person-plus" /> Create an Account
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="bi bi-shield-lock" style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Reset your password</h3>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowForgotModal(false)}
                aria-label="Close modal"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="modal-body">
              {forgotSuccessMessage ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(5, 150, 105, 0.12)',
                      color: '#059669',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '24px',
                      margin: '0 auto 12px',
                    }}
                  >
                    <i className="bi bi-check-lg" />
                  </div>
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
                    {forgotSuccessMessage}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                    Check your email inbox or use your reset link to create a new password.
                  </p>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="button secondary small"
                      onClick={() => setShowForgotModal(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="button primary small"
                      onClick={() => {
                        setShowForgotModal(false)
                        navigate('/reset-password')
                      }}
                    >
                      Enter Token / Set Password
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit}>
                  <p style={{ fontSize: '0.86rem', color: 'var(--color-text-secondary)', marginTop: 0, marginBottom: '16px' }}>
                    Enter your registered student or administrator email address. We will send you instructions to reset your password.
                  </p>

                  {forgotError && (
                    <div className="alert-banner" role="alert" style={{ marginBottom: '14px' }}>
                      <i className="bi bi-exclamation-circle-fill" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  <div className="field">
                    <label htmlFor="forgot-email">Registered Email</label>
                    <div className="input-wrap">
                      <i className="bi bi-envelope" />
                      <input
                        id="forgot-email"
                        type="email"
                        placeholder="yourname@college.edu"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => setShowForgotModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="button primary"
                      disabled={forgotSubmitting}
                    >
                      {forgotSubmitting ? (
                        <>
                          <span className="loader-spinner light" aria-hidden="true" />
                          Sending…
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}