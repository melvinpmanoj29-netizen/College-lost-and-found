import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import api, { getErrorMessage } from '../services/api'
import ImageUploadField from '../components/lost-items/ImageUploadField'

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
  const [imageUploading, setImageUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [pwSubmitting, setPwSubmitting] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState<string | null>(null)

  // Image load error fallback
  const [imgLoadError, setImgLoadError] = useState(false)

  if (!user) return null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!studentName.trim() || !className.trim()) {
      setError('Name and class are required')
      return
    }
    if (imageUploading) {
      setError('Please wait for the image upload to complete')
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
      setImgLoadError(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePasswordChange(event: FormEvent) {
    event.preventDefault()
    setPwError(null)
    setPwSuccess(null)

    if (!currentPassword) {
      setPwError('Current password is required')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setPwError('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('New password and confirmation do not match')
      return
    }
    if (currentPassword === newPassword) {
      setPwError('New password cannot be the same as your current password')
      return
    }

    setPwSubmitting(true)
    try {
      const { data } = await api.post<{ message: string }>('/users/me/change-password', {
        currentPassword,
        newPassword,
      })
      setPwSuccess(data.message || 'Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwError(getErrorMessage(err))
    } finally {
      setPwSubmitting(false)
    }
  }

  const activePhoto = profileImageUrl || user.profileImageUrl

  return (
    <section className="profile-page page-width">
      <div className="profile-head">
        <div>
          <span className="section-kicker">MY PROFILE</span>
          <h1>Your account</h1>
          <p>Manage the personal details and security credentials shown across the campus.</p>
        </div>
        <button type="button" className="button secondary" onClick={logout}>
          <i className="bi bi-box-arrow-right" /> Log out
        </button>
      </div>

      <div className="profile-layout">
        <aside className="profile-card profile-side">
          {activePhoto && !imgLoadError ? (
            <img
              className="profile-avatar-img"
              src={activePhoto}
              alt={`${user.studentName}'s avatar`}
              onError={() => setImgLoadError(true)}
            />
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
            <div><dt>Member since</dt><dd>Registered account</dd></div>
          </dl>
        </aside>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Edit Profile Form */}
          <div className="profile-card profile-main">
            <h2>Edit profile</h2>
            <p className="profile-sub">Changes apply to your account across the campus and update your navbar avatar in real time.</p>

            {success && (
              <div className="alert-banner success" role="status">
                <i className="bi bi-check-circle-fill" />
                <span>Profile updated successfully.</span>
              </div>
            )}
            {error && (
              <div className="alert-banner" role="alert">
                <i className="bi bi-exclamation-circle-fill" />
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
                <label>Profile photo <small>(Cloudinary Upload)</small></label>
                <ImageUploadField
                  initialImageUrl={profileImageUrl}
                  onImageUploaded={(url) => {
                    setProfileImageUrl(url || '')
                    setImgLoadError(false)
                  }}
                  onUploadingChange={setImageUploading}
                />
              </div>
              <button type="submit" className="button primary" disabled={submitting || imageUploading}>
                {imageUploading ? (
                  <>
                    <span className="loader-spinner light" aria-hidden="true" />
                    Uploading photo…
                  </>
                ) : submitting ? (
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

          {/* Change Password Card */}
          <div className="profile-card profile-main">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <i className="bi bi-shield-lock" style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }} />
              <h2 style={{ margin: 0 }}>Change password</h2>
            </div>
            <p className="profile-sub">Update your login password to maintain campus account security.</p>

            {pwSuccess && (
              <div className="alert-banner success" role="status">
                <i className="bi bi-check-circle-fill" />
                <span>{pwSuccess}</span>
              </div>
            )}
            {pwError && (
              <div className="alert-banner" role="alert">
                <i className="bi bi-exclamation-circle-fill" />
                <span>{pwError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} noValidate>
              <div className="field">
                <label htmlFor="current-password">Current password</label>
                <div className="input-wrap">
                  <i className="bi bi-lock" />
                  <input
                    id="current-password"
                    type={showCurrentPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
                    onClick={() => setShowCurrentPw((prev) => !prev)}
                  >
                    <i className={`bi ${showCurrentPw ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
              </div>

              <div className="two-fields">
                <div className="field">
                  <label htmlFor="new-password">New password</label>
                  <div className="input-wrap">
                    <i className="bi bi-key" />
                    <input
                      id="new-password"
                      type={showNewPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      aria-label={showNewPw ? 'Hide password' : 'Show password'}
                      onClick={() => setShowNewPw((prev) => !prev)}
                    >
                      <i className={`bi ${showNewPw ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="confirm-new-password">Confirm new password</label>
                  <div className="input-wrap">
                    <i className="bi bi-key-fill" />
                    <input
                      id="confirm-new-password"
                      type={showNewPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="button primary" disabled={pwSubmitting}>
                {pwSubmitting ? (
                  <>
                    <span className="loader-spinner light" aria-hidden="true" />
                    Updating password…
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-check" />
                    Update password
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}