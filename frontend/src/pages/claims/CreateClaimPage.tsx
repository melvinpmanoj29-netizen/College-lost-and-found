import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import claimService from '../../services/claimService'
import { getErrorMessage } from '../../services/api'
import ClaimPrivacyNotice from '../../components/claims/ClaimPrivacyNotice'

export default function CreateClaimPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialFoundId = searchParams.get('foundItemId') || ''
  const initialLostId = searchParams.get('lostItemId') || ''

  const [foundItemId, setFoundItemId] = useState<string>(initialFoundId)
  const [lostItemId, setLostItemId] = useState<string>(initialLostId)
  const [verificationAnswer, setVerificationAnswer] = useState<string>('')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  function validate(): boolean {
    const errs: Record<string, string> = {}
    const parsedFoundId = parseInt(foundItemId, 10)
    const parsedLostId = parseInt(lostItemId, 10)

    if (!foundItemId || isNaN(parsedFoundId) || parsedFoundId <= 0) {
      errs.foundItemId = 'A valid Found Item reference number is required.'
    }
    if (!lostItemId || isNaN(parsedLostId) || parsedLostId <= 0) {
      errs.lostItemId = 'A valid Lost Item reference number is required.'
    }
    if (!verificationAnswer.trim()) {
      errs.verificationAnswer = 'Verification proof is required to validate your ownership.'
    } else if (verificationAnswer.trim().length < 5) {
      errs.verificationAnswer = 'Please provide a more detailed verification description.'
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setApiError(null)

    const payload = {
      foundItemId: parseInt(foundItemId, 10),
      lostItemId: parseInt(lostItemId, 10),
      verificationAnswer: verificationAnswer.trim(),
    }

    try {
      const createdClaim = await claimService.create(payload)

      // STRICT PRIVACY RULE:
      // Clear sensitive verificationAnswer immediately from state
      setVerificationAnswer('')

      navigate(`/claims/${createdClaim.id}`, {
        state: { newClaim: true },
      })
    } catch (err: unknown) {
      // In case of error, show friendly institutional message
      setApiError(getErrorMessage(err))
      setIsSubmitting(false)
    }
  }

  return (
    <section className="fmc-page page-width">
      <div className="fmc-header">
        <div>
          <button
            type="button"
            className="back-button mb-2"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left" /> Back
          </button>
          <span className="section-kicker">OWNERSHIP VERIFICATION</span>
          <h1>Submit an Item Claim</h1>
          <p>
            If you lost an item that matches a found report, submit a claim below. An authorized
            administrator will verify your secret verification details before releasing the item.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Privacy Notice Component */}
        <ClaimPrivacyNotice />

        {apiError && (
          <div className="alert-banner" role="alert">
            <i className="bi bi-exclamation-triangle" />
            <div>
              <strong>Claim Submission Failed</strong>
              <p className="mb-0 mt-1">{apiError}</p>
            </div>
          </div>
        )}

        <form className="fmc-form-container" onSubmit={handleSubmit} noValidate>
          <div className="fmc-form-grid">
            {/* Found Item ID */}
            <div className="fmc-field">
              <label htmlFor="foundItemId">
                Found Item Reference # <span className="required">*</span>
              </label>
              <input
                id="foundItemId"
                type="number"
                min="1"
                className="fmc-input"
                placeholder="e.g. 20"
                value={foundItemId}
                onChange={(e) => {
                  setFoundItemId(e.target.value)
                  if (fieldErrors.foundItemId) setFieldErrors((prev) => ({ ...prev, foundItemId: '' }))
                }}
              />
              {fieldErrors.foundItemId && (
                <span className="field-error">{fieldErrors.foundItemId}</span>
              )}
              <span className="auth-hint">ID of the item found and reported on campus.</span>
            </div>

            {/* Lost Item ID */}
            <div className="fmc-field">
              <label htmlFor="lostItemId">
                Your Lost Item Report # <span className="required">*</span>
              </label>
              <input
                id="lostItemId"
                type="number"
                min="1"
                className="fmc-input"
                placeholder="e.g. 10"
                value={lostItemId}
                onChange={(e) => {
                  setLostItemId(e.target.value)
                  if (fieldErrors.lostItemId) setFieldErrors((prev) => ({ ...prev, lostItemId: '' }))
                }}
              />
              {fieldErrors.lostItemId && (
                <span className="field-error">{fieldErrors.lostItemId}</span>
              )}
              <span className="auth-hint">ID of the lost item report filed by you.</span>
            </div>

            {/* Secret Verification Details */}
            <div className="fmc-field full-width">
              <label htmlFor="verificationAnswer">
                Private Verification Answer <span className="required">*</span>
              </label>
              <textarea
                id="verificationAnswer"
                className="fmc-textarea"
                rows={5}
                placeholder="Describe distinguishing attributes only the true owner would know (e.g. phone lockscreen wallpaper, sticker in pocket, key fob color, specific cards inside wallet, scratch on bottom left)..."
                value={verificationAnswer}
                onChange={(e) => {
                  setVerificationAnswer(e.target.value)
                  if (fieldErrors.verificationAnswer) {
                    setFieldErrors((prev) => ({ ...prev, verificationAnswer: '' }))
                  }
                }}
              />
              {fieldErrors.verificationAnswer && (
                <span className="field-error">{fieldErrors.verificationAnswer}</span>
              )}
              <div className="d-flex align-items-center gap-1 mt-1 text-muted small">
                <i className="bi bi-lock-fill text-success" />
                <span>
                  Admin-only review field. Never shown to any other student or public campus feeds.
                </span>
              </div>
            </div>
          </div>

          <div className="fmc-form-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="button primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="loader-spinner light" aria-hidden="true" />
                  Submitting Claim...
                </>
              ) : (
                <>
                  <i className="bi bi-shield-check" />
                  Submit Claim for Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
