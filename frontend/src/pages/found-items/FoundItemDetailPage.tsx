import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import foundItemService from '../../services/foundItemService'
import { getErrorMessage } from '../../services/api'
import type { FoundItem } from '../../types/foundItem'
import DeleteConfirmModal from '../../components/found-items/DeleteConfirmModal'

export default function FoundItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  const [item, setItem] = useState<FoundItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const itemId = Number(id)
  const isInvalidId = !id || isNaN(itemId) || itemId <= 0

  useEffect(() => {
    if (isInvalidId) return
    let cancelled = false

    async function fetchItem() {
      setLoading(true)
      setError(null)
      try {
        const data = await foundItemService.getById(itemId)
        if (!cancelled) setItem(data)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchItem()

    return () => {
      cancelled = true
    }
  }, [itemId, isInvalidId])

  if (isInvalidId) {
    return (
      <section className="fmc-page page-width">
        <button
          type="button"
          className="back-button mb-3"
          onClick={() => navigate('/found')}
        >
          <i className="bi bi-arrow-left" /> Back to found items
        </button>
        <div className="alert-banner" role="alert">
          <i className="bi bi-exclamation-triangle" />
          <div className="flex-grow-1">
            <strong>Invalid item identifier</strong>
            <p className="mb-2">The provided item identifier is invalid.</p>
            <button
              type="button"
              className="button secondary small"
              onClick={() => navigate('/found')}
            >
              Return to directory
            </button>
          </div>
        </div>
      </section>
    )
  }

  const isOwner = user?.id === item?.userId
  const canModify = isOwner || isAdmin

  async function handleDeleteConfirm() {
    if (!item) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await foundItemService.delete(item.id)
      navigate('/found', { replace: true })
    } catch (err) {
      setDeleteError(getErrorMessage(err))
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="full-page-loader">
        <div className="loader-box">
          <span className="loader-spinner" aria-hidden="true" />
          <span>Loading found item details...</span>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <section className="fmc-page page-width">
        <button
          type="button"
          className="back-button mb-3"
          onClick={() => navigate('/found')}
        >
          <i className="bi bi-arrow-left" /> Back to found items
        </button>
        <div className="alert-banner" role="alert">
          <i className="bi bi-exclamation-triangle" />
          <div className="flex-grow-1">
            <strong>Unable to display found item</strong>
            <p className="mb-2">{error || 'Item not found'}</p>
            <button
              type="button"
              className="button secondary small"
              onClick={() => navigate('/found')}
            >
              Return to directory
            </button>
          </div>
        </div>
      </section>
    )
  }

  const formattedFoundDate = new Date(item.foundDateTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const formattedReportedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <section className="fmc-page page-width">
      <button
        type="button"
        className="back-button mb-4"
        onClick={() => navigate('/found')}
      >
        <i className="bi bi-arrow-left" /> Back to found items
      </button>

      {deleteError && (
        <div className="alert-banner mb-4" role="alert">
          <i className="bi bi-exclamation-triangle" />
          <span>{deleteError}</span>
        </div>
      )}

      <div className="fmc-detail-layout">
        {/* Left Side: Media & Facts */}
        <div className="fmc-detail-card">
          <div className="fmc-detail-media-wrap">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.itemName} />
            ) : (
              <div className="media-fallback">
                <i className="bi bi-box-seam" />
                <span>No photo provided</span>
              </div>
            )}
          </div>

          <dl className="fmc-facts-list">
            <div className="fmc-fact-row">
              <dt>
                <i className="bi bi-shield-check" /> Status
              </dt>
              <dd>
                <span className={`fmc-badge ${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </dd>
            </div>
            <div className="fmc-fact-row">
              <dt>
                <i className="bi bi-tag" /> Category
              </dt>
              <dd>{item.category}</dd>
            </div>
            {item.color && (
              <div className="fmc-fact-row">
                <dt>
                  <i className="bi bi-palette" /> Color
                </dt>
                <dd>{item.color}</dd>
              </div>
            )}
            <div className="fmc-fact-row">
              <dt>
                <i className="bi bi-geo-alt" /> Location
              </dt>
              <dd>{item.foundLocation}</dd>
            </div>
            <div className="fmc-fact-row">
              <dt>
                <i className="bi bi-calendar3" /> When Found
              </dt>
              <dd>{formattedFoundDate}</dd>
            </div>
            <div className="fmc-fact-row">
              <dt>
                <i className="bi bi-clock-history" /> Reported
              </dt>
              <dd>{formattedReportedDate}</dd>
            </div>
            {isOwner && (
              <div className="fmc-fact-row">
                <dt>
                  <i className="bi bi-person-check" /> Reporter
                </dt>
                <dd className="text-primary fw-medium">You (Finder)</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Right Side: Main Information & Actions */}
        <div className="fmc-detail-card fmc-detail-main">
          <span className="section-kicker">FOUND ITEM REPORT #{item.id}</span>
          <h1>{item.itemName}</h1>

          <div className="mb-4">
            <h3 className="fs-6 text-muted mb-2 text-uppercase letter-spacing-1">
              Description &amp; Identifying Details
            </h3>
            <div className="fmc-detail-desc">{item.description}</div>
          </div>

          {/* Institutional guidance */}
          <div className="fmc-privacy-box mb-4">
            <i className="bi bi-info-circle-fill" />
            <div>
              <h4>Campus Handover Policy</h4>
              <p>
                Found items remain registered until verified by an authorized campus admin or claimed
                by the owner. For your safety, always coordinate handoffs at the designated Campus Security
                or Student Affairs Office.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="fmc-actions-bar">
            {/* View Matches */}
            <button
              type="button"
              className="button secondary"
              onClick={() => navigate(`/matches/found/${item.id}`)}
            >
              <i className="bi bi-stars text-primary" /> View Smart Matches
            </button>

            {/* Claim item (only available if item is not yet RETURNED and current user isn't the reporter) */}
            {item.status !== 'RETURNED' && !isOwner && (
              <button
                type="button"
                className="button primary"
                onClick={() => navigate(`/claims/new?foundItemId=${item.id}`)}
              >
                <i className="bi bi-shield-check" /> Claim This Item
              </button>
            )}

            {/* Edit / Delete actions for owner or admin */}
            {canModify && (
              <>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => navigate(`/found/${item.id}/edit`)}
                >
                  <i className="bi bi-pencil" /> Edit Report
                </button>
                <button
                  type="button"
                  className="button outline-danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <i className="bi bi-trash3" /> Delete Report
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        itemName={item.itemName}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />
    </section>
  )
}
