import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteLostItem, getLostItemById } from '../../services/lostItemService'
import { getErrorMessage } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import type { LostItem } from '../../types/lostItem'
import DeleteConfirmModal from '../../components/lost-items/DeleteConfirmModal'

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function LostItemDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  const [item, setItem] = useState<LostItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItem = async () => {
      if (!id || isNaN(Number(id))) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const data = await getLostItemById(Number(id))
        setItem(data)
      } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((err as any)?.response?.status === 404) {
          setNotFound(true)
        } else {
          setError(getErrorMessage(err))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id])

  const isOwner = Boolean(user && item && user.id === item.userId)
  const canManage = isOwner || isAdmin

  async function handleDeleteConfirm() {
    if (!item) return
    setDeleting(true)
    setActionError(null)
    try {
      await deleteLostItem(item.id)
      navigate('/lost', { replace: true })
    } catch (err) {
      setActionError(getErrorMessage(err))
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="state-container page-width">
        <span className="loader-spinner" />
        <p>Loading item details…</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="state-container empty page-width">
        <div className="empty-icon-wrap">
          <i className="bi bi-question-circle" />
        </div>
        <h2>Lost item not found</h2>
        <p>The report you are looking for does not exist or may have been removed.</p>
        <button type="button" className="button primary" onClick={() => navigate('/lost')}>
          <i className="bi bi-arrow-left" /> Back to Lost Items
        </button>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="state-container error page-width">
        <i className="bi bi-exclamation-triangle state-icon text-danger" />
        <h2>Error loading report</h2>
        <p>{error || 'An unexpected error occurred.'}</p>
        <button type="button" className="button secondary" onClick={() => navigate('/lost')}>
          Back to Lost Items
        </button>
      </div>
    )
  }

  const statusClass =
    item.status === 'RETURNED'
      ? 'badge-status-returned'
      : item.status === 'ARCHIVED'
      ? 'badge-status-archived'
      : 'badge-status-lost'

  return (
    <section className="details-page page-width">
      <div className="details-nav-row">
        <button type="button" className="back-button" onClick={() => navigate('/lost')}>
          <i className="bi bi-arrow-left" /> Back to Lost Items
        </button>

        {canManage && (
          <div className="details-owner-actions">
            <button
              type="button"
              className="button secondary small"
              onClick={() => navigate(`/lost/${item.id}/edit`)}
            >
              <i className="bi bi-pencil" /> Edit report
            </button>
            <button
              type="button"
              className="button secondary small text-danger"
              onClick={() => setShowDeleteModal(true)}
            >
              <i className="bi bi-trash" /> Delete
            </button>
          </div>
        )}
      </div>

      {actionError && (
        <div className="alert-banner" role="alert">
          <i className="bi bi-exclamation-circle" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="details-layout">
        <div className="detail-media-container">
          {item.imageUrl && !imageError ? (
            <img
              src={item.imageUrl}
              alt={item.itemName}
              className="detail-large-image"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="detail-image-fallback">
              <i className="bi bi-box-seam" />
              <span>No image provided</span>
            </div>
          )}

          <div className="detail-status-strip">
            <span className={`badge-status ${statusClass}`}>{item.status}</span>
            {item.isUrgent && (
              <span className="badge-urgent">
                <i className="bi bi-lightning-charge-fill" /> Urgent item
              </span>
            )}
            {item.isArchived && (
              <span className="badge-status-archived">
                <i className="bi bi-archive" /> Archived
              </span>
            )}
          </div>
        </div>

        <div className="detail-copy">
          <span className="section-kicker">LOST ITEM REPORT #{item.id}</span>
          <h1>{item.itemName}</h1>
          <p className="detail-sub">Reported on {formatDateTime(item.createdAt)}</p>

          <div className="detail-facts">
            <span>
              <i className="bi bi-tag" />
              <b>Category</b>
              {item.category}
            </span>

            {item.color && (
              <span>
                <i className="bi bi-palette" />
                <b>Color</b>
                {item.color}
              </span>
            )}

            <span>
              <i className="bi bi-geo-alt" />
              <b>Last seen</b>
              {item.lastSeenLocation}
            </span>

            <span>
              <i className="bi bi-calendar3" />
              <b>Date lost</b>
              {formatDateTime(item.lostDateTime)}
            </span>

            {item.expiryDate && (
              <span>
                <i className="bi bi-hourglass-split" />
                <b>Expiry date</b>
                {formatDateTime(item.expiryDate)}
              </span>
            )}
          </div>

          <div className="description">
            <h2>Description</h2>
            <p>{item.description}</p>
          </div>

          <div className="detail-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '24px 0' }}>
            <button
              type="button"
              className="button primary"
              onClick={() => navigate(`/matches/lost/${item.id}`)}
            >
              <i className="bi bi-cpu-fill" /> View Smart Matches
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={() => navigate('/found')}
            >
              <i className="bi bi-search" /> Browse Found Items
            </button>
          </div>

          <div className="safety-note">
            <i className="bi bi-shield-check" />
            <span>
              <strong>Campus Verification Protocol</strong>
              <small>
                When a match is found, submit a verification claim. Campus security or the finder will verify your details before handing over the item.
              </small>
            </span>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        itemName={item.itemName}
        isDeleting={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />
    </section>
  )
}
