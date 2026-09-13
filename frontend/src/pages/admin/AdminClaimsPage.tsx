import { useCallback, useEffect, useState } from 'react'
import {
  approveClaim,
  getAdminClaimDetail,
  getAdminClaims,
  rejectClaim,
} from '../../services/adminService'
import { getErrorMessage } from '../../services/api'
import type { AdminClaimReview, AdminClaimSummary, ClaimStatus } from '../../types/admin'

function formatDate(isoString?: string): string {
  if (!isoString) return '—'
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}

function getStatusBadge(status: ClaimStatus) {
  switch (status) {
    case 'APPROVED':
      return <span className="badge-approved">APPROVED</span>
    case 'REJECTED':
      return <span className="badge-rejected">REJECTED</span>
    case 'PENDING':
    default:
      return <span className="badge-pending">PENDING REVIEW</span>
  }
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<AdminClaimSummary[]>([])
  const [statusFilter, setStatusFilter] = useState<'ALL' | ClaimStatus>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Review modal state
  const [reviewingId, setReviewingId] = useState<number | null>(null)
  const [reviewDetail, setReviewDetail] = useState<AdminClaimReview | null>(null)
  const [loadingReview, setLoadingReview] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null)

  const fetchClaimsList = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAdminClaims()
      setClaims(data || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    getAdminClaims()
      .then((data) => {
        if (!isMounted) return
        setClaims(data || [])
        setLoading(false)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(getErrorMessage(err))
        setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const openReviewModal = async (id: number) => {
    setReviewingId(id)
    setReviewDetail(null)
    setLoadingReview(true)
    setReviewError(null)

    try {
      const detail = await getAdminClaimDetail(id)
      setReviewDetail(detail)
    } catch (err) {
      setReviewError(getErrorMessage(err))
    } finally {
      setLoadingReview(false)
    }
  }

  const closeReviewModal = () => {
    setReviewingId(null)
    setReviewDetail(null)
    setReviewError(null)
    setProcessingAction(null)
  }

  const handleApprove = async () => {
    if (!reviewDetail) return
    setProcessingAction('approve')
    setFeedback(null)

    try {
      const updated = await approveClaim(reviewDetail.id)
      setClaims((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, status: updated.status } : c))
      )
      setFeedback({
        type: 'success',
        message: `Claim #${reviewDetail.id} was successfully approved. Found item status transitioned to RETURNED.`,
      })
      closeReviewModal()
    } catch (err) {
      setReviewError(getErrorMessage(err))
    } finally {
      setProcessingAction(null)
    }
  }

  const handleReject = async () => {
    if (!reviewDetail) return
    setProcessingAction('reject')
    setFeedback(null)

    try {
      const updated = await rejectClaim(reviewDetail.id)
      setClaims((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, status: updated.status } : c))
      )
      setFeedback({
        type: 'success',
        message: `Claim #${reviewDetail.id} was rejected. Found item remains available for other claims.`,
      })
      closeReviewModal()
    } catch (err) {
      setReviewError(getErrorMessage(err))
    } finally {
      setProcessingAction(null)
    }
  }

  const displayedClaims = claims.filter((c) => {
    if (statusFilter === 'ALL') return true
    return c.status === statusFilter
  })

  return (
    <div>
      <div className="admin-table-card">
        <div className="admin-table-header">
          <div>
            <h2>Student Claims Review ({claims.length})</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              Inspect student ownership claims, verify claimant answers, and approve or reject handoffs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ClaimStatus)}
              style={{ fontSize: '13px', padding: '6px 10px' }}
            >
              <option value="ALL">All Statuses ({claims.length})</option>
              <option value="PENDING">Pending Only ({claims.filter((c) => c.status === 'PENDING').length})</option>
              <option value="APPROVED">Approved ({claims.filter((c) => c.status === 'APPROVED').length})</option>
              <option value="REJECTED">Rejected ({claims.filter((c) => c.status === 'REJECTED').length})</option>
            </select>

            <button className="button secondary small" onClick={fetchClaimsList} disabled={loading}>
              <i className="bi bi-arrow-clockwise" />
            </button>
          </div>
        </div>

        {/* Action feedback banner */}
        {feedback && (
          <div style={{ padding: '16px 20px 0' }}>
            <div className={`admin-feedback-toast ${feedback.type}`}>
              <i className={`bi ${feedback.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} />
              <span>{feedback.message}</span>
              <button
                style={{ marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer' }}
                onClick={() => setFeedback(null)}
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="state-container" style={{ margin: '20px' }}>
            <div className="loader-spinner" style={{ width: '28px', height: '28px', borderWidth: '3px' }} />
            <div className="state-title" style={{ marginTop: '14px', fontSize: '15px' }}>Loading submitted claims...</div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="state-container" style={{ margin: '20px' }}>
            <div className="state-icon error" style={{ width: '40px', height: '40px', fontSize: '20px' }}>
              <i className="bi bi-exclamation-circle" />
            </div>
            <div className="state-title" style={{ fontSize: '16px' }}>Failed to load claims</div>
            <div className="state-desc">{error}</div>
            <button className="button primary small" onClick={fetchClaimsList}>
              <i className="bi bi-arrow-clockwise" /> Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && displayedClaims.length === 0 && (
          <div className="state-container" style={{ margin: '20px' }}>
            <div className="state-icon" style={{ width: '44px', height: '44px', fontSize: '22px' }}>
              <i className="bi bi-check2-circle" />
            </div>
            <div className="state-title" style={{ fontSize: '16px' }}>No claims matching filter</div>
            <div className="state-desc">
              {statusFilter === 'PENDING'
                ? 'All claims have been reviewed! There are no pending claims.'
                : 'There are currently no claims matching this filter.'}
            </div>
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && displayedClaims.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Lost Item ID</th>
                  <th>Found Item ID</th>
                  <th>Claimant User ID</th>
                  <th>Submitted At</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedClaims.map((claim) => (
                  <tr key={claim.id}>
                    <td>
                      <strong>#{claim.id}</strong>
                    </td>
                    <td>Report #{claim.lostItemId}</td>
                    <td>Report #{claim.foundItemId}</td>
                    <td>Student #{claim.claimantUserId}</td>
                    <td>{formatDate(claim.createdAt)}</td>
                    <td>{getStatusBadge(claim.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="button primary small"
                        style={{ padding: '4px 12px', minHeight: '32px', fontSize: '12px' }}
                        onClick={() => openReviewModal(claim.id)}
                      >
                        <i className="bi bi-eye" /> Review Claim
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal with Restricted verificationAnswer */}
      {reviewingId !== null && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '560px' }}>
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="bi bi-shield-lock" style={{ color: '#2563eb', fontSize: '18px' }} />
                <h3>Administrative Claim Review (Claim #{reviewingId})</h3>
              </div>
              <button className="icon-button" onClick={closeReviewModal} disabled={processingAction !== null}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="modal-body">
              {loadingReview && (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
                  <div className="loader-spinner" style={{ marginBottom: '8px' }} />
                  <div>Loading claim verification details...</div>
                </div>
              )}

              {reviewError && (
                <div className="alert-banner" style={{ margin: 0 }}>
                  <i className="bi bi-exclamation-triangle-fill" />
                  <span>{reviewError}</span>
                </div>
              )}

              {!loadingReview && reviewDetail && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      Status: {getStatusBadge(reviewDetail.status)}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Submitted: {formatDate(reviewDetail.createdAt)}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>LOST ITEM REPORT</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>ID #{reviewDetail.lostItemId}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>FOUND ITEM REPORT</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>ID #{reviewDetail.foundItemId}</div>
                    </div>
                  </div>

                  {/* RESTRICTED VERIFICATION ANSWER BOX */}
                  <div className="verification-box">
                    <label>
                      <i className="bi bi-shield-shaded" style={{ marginRight: '4px' }} />
                      Confidential Verification Answer (Admin Only)
                    </label>
                    <p>{reviewDetail.verificationAnswer || 'No specific answer provided by claimant.'}</p>
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.45, marginTop: '8px' }}>
                    Verify that the claimant's answer matches the hidden distinguishing marks or contents
                    recorded in the found item report before approving.
                  </div>
                </div>
              )}
            </div>

            <div className="modal-foot">
              <button
                className="button secondary small"
                onClick={closeReviewModal}
                disabled={processingAction !== null}
              >
                Close
              </button>

              {reviewDetail && reviewDetail.status === 'PENDING' && (
                <>
                  <button
                    className="button secondary small"
                    style={{ color: '#dc2626', borderColor: '#fecaca' }}
                    onClick={handleReject}
                    disabled={processingAction !== null}
                  >
                    {processingAction === 'reject' ? 'Rejecting...' : 'Reject Claim'}
                  </button>

                  <button
                    className="button primary small"
                    onClick={handleApprove}
                    disabled={processingAction !== null}
                  >
                    {processingAction === 'approve' ? 'Approving...' : 'Approve & Release'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
