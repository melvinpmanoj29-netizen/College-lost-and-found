import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/api'

interface FieldErrors {
  studentName?: string
  rollNumber?: string
  className?: string
  email?: string
  password?: string
}

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    studentName: '',
    rollNumber: '',
    className: '',
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [success, setSuccess] = useState(false)

  function setField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const errors: FieldErrors = {}
    if (!form.studentName.trim()) errors.studentName = 'Full name is required'
    if (!form.rollNumber.trim()) errors.rollNumber = 'Roll number is required'
    if (!form.className.trim()) errors.className = 'Class / department is required'
    if (!form.email.trim()) errors.email = 'Email is required'
    else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address'
    if (!form.password) errors.password = 'Password is required'
    else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    setError(null)
    try {
      await register({
        studentName: form.studentName.trim(),
        rollNumber: form.rollNumber.trim(),
        className: form.className.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      setSuccess(true)
      // Success flow: send the new student to the login screen.
      window.setTimeout(() => navigate('/login', { replace: true }), 1200)
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
          <h1>Create your account</h1>
          <p>Register to start reporting lost and found items on campus.</p>
        </div>

        {success && (
          <div className="alert-banner success" role="status">
            <i className="bi bi-check-circle" />
            <span>Registration successful! Redirecting to login…</span>
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
            <label htmlFor="reg-name">Student name</label>
            <div className="input-wrap">
              <i className="bi bi-person" />
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                value={form.studentName}
                onChange={(e) => setField('studentName', e.target.value)}
                aria-invalid={fieldErrors.studentName ? true : undefined}
              />
            </div>
            {fieldErrors.studentName && <p className="field-error">{fieldErrors.studentName}</p>}
          </div>

          <div className="field">
            <label htmlFor="reg-roll">Roll number</label>
            <div className="input-wrap">
              <i className="bi bi-badge-id" />
              <input
                id="reg-roll"
                type="text"
                placeholder="CS2026-001"
                value={form.rollNumber}
                onChange={(e) => setField('rollNumber', e.target.value)}
                aria-invalid={fieldErrors.rollNumber ? true : undefined}
              />
            </div>
            {fieldErrors.rollNumber && <p className="field-error">{fieldErrors.rollNumber}</p>}
          </div>

          <div className="field">
            <label htmlFor="reg-class">Class / department</label>
            <div className="input-wrap">
              <i className="bi bi-mortarboard" />
              <input
                id="reg-class"
                type="text"
                placeholder="CSE S4"
                value={form.className}
                onChange={(e) => setField('className', e.target.value)}
                aria-invalid={fieldErrors.className ? true : undefined}
              />
            </div>
            {fieldErrors.className && <p className="field-error">{fieldErrors.className}</p>}
          </div>

          <div className="field">
            <label htmlFor="reg-email">Email address</label>
            <div className="input-wrap">
              <i className="bi bi-envelope" />
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="jane.doe@college.edu"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                aria-invalid={fieldErrors.email ? true : undefined}
              />
            </div>
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="reg-password">Password</label>
            <div className="input-wrap">
              <i className="bi bi-lock" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
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
            <p className="auth-hint">Must be at least 8 characters long.</p>
          </div>

          <button type="submit" className="button primary auth-submit" disabled={submitting}>
            {submitting ? (
              <>
                <span className="loader-spinner light" aria-hidden="true" />
                Creating account…
              </>
            ) : (
              <>
                <i className="bi bi-person-plus" />
                Register
              </>
            )}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </section>
  )
}