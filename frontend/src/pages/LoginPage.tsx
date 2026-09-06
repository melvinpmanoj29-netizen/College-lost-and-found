import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/api'

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

  const from = (location.state as { from?: string } | null)?.from

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const errors: FieldErrors = {}
    if (!email.trim()) errors.email = 'Email is required'
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

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-heading">
          <span className="brand-mark auth-logo"><i className="bi bi-box-seam" /></span>
          <h1>Welcome back</h1>
          <p>Sign in to your account to continue.</p>
        </div>

        {error && (
          <div className="alert-banner" role="alert">
            <i className="bi bi-exclamation-circle" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="login-email">Email address</label>
            <div className="input-wrap">
              <i className="bi bi-envelope" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={fieldErrors.email ? true : undefined}
              />
            </div>
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
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
                Sign in
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">New to College Lost &amp; Found?</div>
        <Link to="/register" className="button secondary auth-submit">
          Create an account
        </Link>
      </div>
    </section>
  )
}