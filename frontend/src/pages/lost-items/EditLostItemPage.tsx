import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLostItemById, updateLostItem } from '../../services/lostItemService'
import { getErrorMessage } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import type { UpdateLostItemRequest } from '../../types/lostItem'
import ImageUploadField from '../../components/lost-items/ImageUploadField'

const STANDARD_CATEGORIES = [
  'Electronics',
  'Bags & Backpacks',
  'Books & Notebooks',
  'ID Cards & Wallets',
  'Keys',
  'Water Bottles',
  'Clothing & Accessories',
  'Stationery',
  'Other',
]

const CAMPUS_LOCATIONS = [
  'Harrison Library',
  'Student Union',
  'North Gym',
  'Science Building',
  'Main Block',
  'Campus Canteen',
  'Sports Ground',
  'Central Courtyard',
  'Hostel Block',
  'Parking Area',
  'Other',
]

export default function EditLostItemPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  // Form State
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState('')
  const [color, setColor] = useState('')
  const [lostDate, setLostDate] = useState('')
  const [lostTime, setLostTime] = useState('')
  const [lastSeenLocation, setLastSeenLocation] = useState('')
  const [customLocation, setCustomLocation] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)
  const [expiryDate, setExpiryDate] = useState('')

  // UI State
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      navigate('/lost', { replace: true })
      return
    }

    const fetchItem = async () => {
      setLoading(true)
      setError(null)
      try {
        const item = await getLostItemById(Number(id))

        // Check ownership
        const isOwner = user && user.id === item.userId
        if (!isOwner && !isAdmin) {
          setUnauthorized(true)
          setLoading(false)
          return
        }

        setItemName(item.itemName)
        setCategory(item.category)
        setColor(item.color || '')
        setDescription(item.description)
        setImageUrl(item.imageUrl || null)
        setIsUrgent(item.isUrgent)

        if (item.lostDateTime) {
          const parts = item.lostDateTime.split('T')
          setLostDate(parts[0])
          if (parts[1]) {
            setLostTime(parts[1].slice(0, 5))
          }
        }

        if (CAMPUS_LOCATIONS.includes(item.lastSeenLocation)) {
          setLastSeenLocation(item.lastSeenLocation)
        } else {
          setLastSeenLocation('Other')
          setCustomLocation(item.lastSeenLocation)
        }

        if (item.expiryDate) {
          setExpiryDate(item.expiryDate.split('T')[0])
        }
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id, user, isAdmin, navigate])

  const effectiveLocation =
    lastSeenLocation === 'Other' ? customLocation.trim() : lastSeenLocation

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!id) return
    setError(null)

    if (!itemName.trim()) {
      setError('Item name is required.')
      return
    }
    if (!category.trim()) {
      setError('Please select a category.')
      return
    }
    if (!effectiveLocation) {
      setError('Please provide the last seen location.')
      return
    }
    if (!description.trim()) {
      setError('Please provide a description.')
      return
    }
    if (!lostDate) {
      setError('Please select the date the item was lost.')
      return
    }
    if (imageUploading) {
      setError('Please wait for the photo upload to finish before saving.')
      return
    }

    const lostDateTimeIso = `${lostDate}T${lostTime ? lostTime + ':00' : '12:00:00'}`
    const expiryDateTimeIso = expiryDate ? `${expiryDate}T23:59:59` : null

    const payload: UpdateLostItemRequest = {
      itemName: itemName.trim(),
      category: category.trim(),
      color: color.trim() || null,
      lastSeenLocation: effectiveLocation,
      description: description.trim(),
      lostDateTime: lostDateTimeIso,
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : null,
      isUrgent,
      expiryDate: expiryDateTimeIso,
    }

    setSubmitting(true)
    try {
      await updateLostItem(Number(id), payload)
      setSuccess(true)
      setTimeout(() => {
        navigate(`/lost/${id}`)
      }, 1000)
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="state-container page-width">
        <span className="loader-spinner" />
        <p>Loading item for editing…</p>
      </div>
    )
  }

  if (unauthorized) {
    return (
      <div className="state-container empty page-width">
        <div className="empty-icon-wrap text-danger">
          <i className="bi bi-shield-x" />
        </div>
        <h2>Unauthorized</h2>
        <p>You do not have permission to edit this report. Only the original author or an administrator can edit it.</p>
        <button type="button" className="button primary" onClick={() => navigate('/lost')}>
          Return to Lost Items
        </button>
      </div>
    )
  }

  return (
    <section className="form-page page-width">
      <div className="form-intro">
        <span className="section-kicker">EDIT REPORT</span>
        <h1>Update lost item</h1>
        <p>Keep your report accurate to help other students find and return your item.</p>
      </div>

      <form className="report-form" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="alert-banner" role="alert">
            <i className="bi bi-exclamation-circle" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert-banner success" role="status">
            <i className="bi bi-check-circle" />
            <span>Report updated successfully! Redirecting…</span>
          </div>
        )}

        <div className="form-section">
          <h2>Item details</h2>
          <p>Update identifiable characteristics of your lost item.</p>

          <label>
            Item name <span className="req">*</span>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </label>

          <div className="two-fields">
            <label>
              Category <span className="req">*</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {STANDARD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Color <small>(Optional)</small>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </label>
          </div>

          <label>
            Description <span className="req">*</span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>

          <div className="form-field-group">
            <label className="field-group-label" htmlFor="lost-item-image-input">
              Photo <small>(Optional — Upload to Cloudinary)</small>
            </label>
            <ImageUploadField
              initialImageUrl={imageUrl}
              onImageUploaded={(url) => setImageUrl(url)}
              onUploadingChange={(uploading) => setImageUploading(uploading)}
            />
          </div>
        </div>

        <div className="form-section">
          <h2>When and where was it lost?</h2>
          <p>Modify timing or location if you have new information.</p>

          <div className="two-fields">
            <label>
              Date lost <span className="req">*</span>
              <input
                type="date"
                value={lostDate}
                onChange={(e) => setLostDate(e.target.value)}
                required
              />
            </label>

            <label>
              Time lost <small>(Approximate)</small>
              <input
                type="time"
                value={lostTime}
                onChange={(e) => setLostTime(e.target.value)}
              />
            </label>
          </div>

          <label>
            Last seen location <span className="req">*</span>
            <select
              value={lastSeenLocation}
              onChange={(e) => setLastSeenLocation(e.target.value)}
              required
            >
              <option value="">Select a campus location</option>
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </label>

          {lastSeenLocation === 'Other' && (
            <label>
              Specify location <span className="req">*</span>
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                required
              />
            </label>
          )}
        </div>

        <div className="form-section">
          <h2>Priority &amp; Lifecycle</h2>

          <div className="checkbox-field">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
              />
              <span>
                <strong>Mark as urgent item</strong>
                <small>Highlights the report in student search and directory.</small>
              </span>
            </label>
          </div>

          <label>
            Auto-archive date
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => navigate(`/lost/${id}`)}
            disabled={submitting || imageUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button primary"
            disabled={submitting || imageUploading}
          >
            {imageUploading ? (
              <>
                <span className="loader-spinner light" aria-hidden="true" />
                Uploading photo…
              </>
            ) : submitting ? (
              <>
                <span className="loader-spinner light" aria-hidden="true" />
                Saving changes…
              </>
            ) : (
              <>
                <i className="bi bi-check-lg" /> Save changes
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}
