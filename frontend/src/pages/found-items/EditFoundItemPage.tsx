import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import foundItemService from '../../services/foundItemService'
import { getErrorMessage } from '../../services/api'
import type { CreateFoundItemRequest, FoundItem } from '../../types/foundItem'
import FoundItemForm from '../../components/found-items/FoundItemForm'

export default function EditFoundItemPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  const [item, setItem] = useState<FoundItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const itemId = Number(id)
  const isInvalidId = !id || isNaN(itemId) || itemId <= 0

  useEffect(() => {
    if (isInvalidId) return
    let cancelled = false

    async function loadItem() {
      setLoading(true)
      setError(null)
      try {
        const data = await foundItemService.getById(itemId)
        if (!cancelled) {
          // Verify ownership or admin permission
          if (data.userId !== user?.id && !isAdmin) {
            setError('You are not authorized to edit this report.')
          } else {
            setItem(data)
          }
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadItem()

    return () => {
      cancelled = true
    }
  }, [itemId, isInvalidId, user, isAdmin])

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
              Back to directory
            </button>
          </div>
        </div>
      </section>
    )
  }

  async function handleSubmit(formData: CreateFoundItemRequest) {
    if (!item) return
    setIsSubmitting(true)
    setError(null)
    try {
      await foundItemService.update(item.id, formData)
      navigate(`/found/${item.id}`)
    } catch (err) {
      setError(getErrorMessage(err))
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="full-page-loader">
        <div className="loader-box">
          <span className="loader-spinner" aria-hidden="true" />
          <span>Loading report data...</span>
        </div>
      </div>
    )
  }

  if (error && !item) {
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
            <strong>Unable to edit report</strong>
            <p className="mb-2">{error}</p>
            <button
              type="button"
              className="button secondary small"
              onClick={() => navigate('/found')}
            >
              Back to directory
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="fmc-page page-width">
      <div className="fmc-header">
        <div>
          <button
            type="button"
            className="back-button mb-2"
            onClick={() => navigate(`/found/${itemId}`)}
          >
            <i className="bi bi-arrow-left" /> Back to item details
          </button>
          <span className="section-kicker">EDIT REPORT</span>
          <h1>Edit Found Item #{itemId}</h1>
          <p>
            Update any changes to the location, description, or status details for this report.
          </p>
        </div>
      </div>

      {item && (
        <FoundItemForm
          initialValues={{
            itemName: item.itemName,
            category: item.category,
            color: item.color,
            foundDateTime: item.foundDateTime,
            foundLocation: item.foundLocation,
            imageUrl: item.imageUrl,
            description: item.description,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Save Changes"
          error={error}
          onCancel={() => navigate(`/found/${item.id}`)}
        />
      )}
    </section>
  )
}
