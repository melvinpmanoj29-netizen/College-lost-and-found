import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import claimService from '../../services/claimService'
import { getErrorMessage } from '../../services/api'
import type { Claim } from '../../types/claim'
import ClaimStatusBadge from '../../components/claims/ClaimStatusBadge'
import ClaimPrivacyNotice from '../../components/claims/ClaimPrivacyNotice'

export default function ClaimDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const [claim, setClaim] = useState<Claim | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isNewlyCreated = Boolean(location.state && (location.state as { newClaim?: boolean }).newClaim)

  const claimId = Number(id)
  const isInvalidId = !id || isNaN(claimId) || claimId <= 0

  useEffect(() => {
    if (isInvalidId) return
    let cancelled = false

    async function loadClaim() {
      setLoading(true)
      setError(null)
      try {
        const data = await claimService.getById(claimId)
        if (!cancelled) setClaim(data)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadClaim()

    return () => {
      cancelled = true
    }
  }, [claimId, isInvalidId])

  if (isInvalidId) {
    return (
      <section className="fmc-page page-width">
        <button
          type="button"
          className="back-button mb-3"
          onClick={() => navigate('/claims')}
        >
          <i className="bi bi-arrow-left" /> Back to my claims
        </button>
        <div className="alert-banner" role="alert">
          <i className="bi bi-exclamation-triangle" />
          <div className="flex-grow-1">
            <strong>Invalid claim reference</strong>
            <p className="mb-2">The provided claim reference number is invalid.</p>
            <button
              type="button"
              className="button secondary small"
              onClick={() => navigate('/claims')}
            >
              Back to claims list
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <div className="full-page-loader">
        <div className="loader-box">
          <span className="loader-spinner" aria-hidden="true" />
          <span>Loading claim details...</span>
        </div>
      </div>
    )
  }

  if (error || !claim) {
    return (
      <section className="fmc-page page-width">
        <button
          type="button"
          className="back-button mb-3"
          onClick={() => navigate('/claims')}
        >
          <i className="bi bi-arrow-left" /> Back to my claims
        </button>
        <div className="alert-banner" role="alert">
          <i className="bi bi-exclamation-triangle" />
          <div className="flex-grow-1">
            <strong>Unable to find claim</strong>
            <p className="mb-2">{error || 'Claim record not found'}</p>
            <button
              type="button"
              className="button secondary small"
              onClick={() => navigate('/claims')}
            >
              Back to claims list
            </button>
          </div>
        </div>
      </section>
    )
  }

  const formattedDate = new Date(claim.createdAt).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <section className="fmc-page page-width">
      <button
        type="button"
        className="back-button mb-3"
        onClick={() => navigate('/claims')}
      >
        <i className="bi bi-arrow-left" /> Back to my claims
      </button>

      {isNewlyCreated && (
        <div className="alert-banner success mb-4" role="status">
          <i className="bi bi-check-circle-fill" />
          <div>
            <strong>Claim Submitted Successfully!</strong>
            <p className="mb-0">
              Your claim has been assigned Reference #{claim.id} and is awaiting administrative
              review.
            </p>
          </div>
        </div>
      )}

      <div className="fmc-header">
        <div>
          <span className="section-kicker">CLAIM DETAILS</span>
          <h1>Claim #{claim.id}</h1>
          <p>Submitted on {formattedDate}</p>
        </div>
        <div className="fmc-header-actions">
          <ClaimStatusBadge status={claim.status} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-7">
          <div className="fmc-detail-card mb-4">
            <h2 className="fs-5 fw-bold mb-3">Claim Status &amp; Progress</h2>

            {/* Lifecycle Progression Tracker */}
            <div className="d-flex flex-column gap-3 mb-4">
              <div className="d-flex align-items-start gap-3 p-3 bg-light rounded border">
                <div className="text-success fs-5">
                  <i className="bi bi-check-circle-fill" />
                </div>
                <div>
                  <strong>1. Claim Submitted</strong>
                  <div className="text-muted small">
                    Submitted on {formattedDate}. Private verification details recorded for admin
                    review.
                  </div>
                </div>
              </div>

              <div
                className={`d-flex align-items-start gap-3 p-3 rounded border ${
                  claim.status === 'PENDING'
                    ? 'bg-warning-subtle border-warning'
                    : 'bg-light'
                }`}
              >
                <div
                  className={`fs-5 ${
                    claim.status === 'PENDING'
                      ? 'text-warning-emphasis'
                      : claim.status === 'APPROVED'
                      ? 'text-success'
                      : 'text-danger'
                  }`}
                >
                  <i
                    className={`bi ${
                      claim.status === 'PENDING'
                        ? 'bi-hourglass-split'
                        : claim.status === 'APPROVED'
                        ? 'bi-check-circle-fill'
                        : 'bi-x-circle-fill'
                    }`}
                  />
                </div>
                <div>
                  <strong>2. Administrative Verification</strong>
                  <div className="text-muted small">
                    {claim.status === 'PENDING' &&
                      'Campus administration is reviewing your proof of ownership against the reported item details.'}
                    {claim.status === 'APPROVED' &&
                      'Claim approved! An administrator verified your information. You may now collect your item from Campus Security / Student Affairs.'}
                    {claim.status === 'REJECTED' &&
                      'Claim was rejected by the administration because the verification details did not match the physical item.'}
                  </div>
                </div>
              </div>

              {claim.status === 'APPROVED' && (
                <div className="d-flex align-items-start gap-3 p-3 bg-success-subtle border border-success rounded">
                  <div className="text-success fs-5">
                    <i className="bi bi-gift-fill" />
                  </div>
                  <div>
                    <strong>3. Ready for Collection</strong>
                    <div className="text-muted small">
                      Please bring your Student ID card to the Campus Lost &amp; Found office to
                      collect your belongings.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <h3 className="fs-6 text-uppercase text-muted letter-spacing-1 mb-3">
              Referenced Reports
            </h3>
            <div className="d-flex flex-column gap-3 mb-4">
              <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                <div>
                  <div className="text-muted small">Claimed Found Item</div>
                  <strong>Found Item #{claim.foundItemId}</strong>
                </div>
                <button
                  type="button"
                  className="button secondary small"
                  onClick={() => navigate(`/found/${claim.foundItemId}`)}
                >
                  <i className="bi bi-box-seam" /> View Item Details
                </button>
              </div>

              <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                <div>
                  <div className="text-muted small">Your Lost Item Report</div>
                  <strong>Lost Item #{claim.lostItemId}</strong>
                </div>
                <button
                  type="button"
                  className="button secondary small"
                  onClick={() => navigate('/lost')}
                >
                  <i className="bi bi-search" /> View Lost Report
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-5">
          <ClaimPrivacyNotice />

          <div className="fmc-detail-card">
            <h3 className="fs-6 fw-bold mb-2">Need to contact Campus Security?</h3>
            <p className="text-muted small mb-3">
              If your claim has been approved or you have questions about collection hours, contact
              the Central Campus Lost &amp; Found desk:
            </p>
            <div className="d-flex flex-column gap-2 text-muted small">
              <div>
                <i className="bi bi-geo-alt-fill text-primary me-2" />
                Student Affairs Center, Ground Floor, Room 102
              </div>
              <div>
                <i className="bi bi-clock-fill text-primary me-2" />
                Monday – Friday, 9:00 AM – 4:30 PM
              </div>
              <div>
                <i className="bi bi-card-text text-primary me-2" />
                Physical College ID is mandatory for item pickup
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
