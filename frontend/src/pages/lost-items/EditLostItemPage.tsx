import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLostItemById, updateLostItem } from '../../services/lostItemService'
import { getErrorMessage } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import type { UpdateLostItemRequest } from '../../types/lostItem'
import ImageUploadField from '../../components/lost-items/ImageUploadField'
import { getActiveCategoryNames, getActiveLocationNames, getCategoryIcon } from '../../constants/categories'

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

  // Popular campus locations for quick-pick chips
  const quickLocations = [
    'Central Library',
    'Main Canteen',
    'Decennial Block',
    'Main Block',
    'Sports Complex / Ground',
    'Auditorium',
    'Mechanical Lab',
  ]

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

        if (getActiveLocationNames().includes(item.lastSeenLocation)) {
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
        <p>Loading report details…</p>
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
        <span className="section-kicker">UPDATE REPORT</span>
        <h1>Edit Lost Item</h1>
        <p>Keep your report accurate to help other students and staff locate and return your item.</p>
      </div>

      <div className="report-page-layout">
        {/* Left Column: Form */}
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

          {/* Section 1: Item details */}
          <div className="form-section">
            <div className="form-section-head">
              <div className="form-step-num">1</div>
              <h2>Item Details</h2>
            </div>
            <p>Update identifiable characteristics of your lost item.</p>

            <label>
              Item Name <span className="req">*</span>
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
                  {Array.from(new Set([...getActiveCategoryNames(), ...(category ? [category] : [])])).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Primary Color <small>(Optional)</small>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </label>
            </div>

            <label>
              Detailed Description <span className="req">*</span>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <div className="textarea-footer">
                <span>Include unique details (e.g. keychains, scratches, labels)</span>
                <span>{description.length} characters</span>
              </div>
            </label>
          </div>

          {/* Section 2: Time & Campus Location */}
          <div className="form-section">
            <div className="form-section-head">
              <div className="form-step-num">2</div>
              <h2>When &amp; Where Was It Lost?</h2>
            </div>
            <p>Modify timing or location if you have new information.</p>

            <div className="two-fields">
              <label>
                Date Lost <span className="req">*</span>
                <input
                  type="date"
                  value={lostDate}
                  onChange={(e) => setLostDate(e.target.value)}
                  required
                />
              </label>

              <label>
                Time Lost <small>(Approximate)</small>
                <input
                  type="time"
                  value={lostTime}
                  onChange={(e) => setLostTime(e.target.value)}
                />
              </label>
            </div>

            <label>
              Last Seen Campus Location <span className="req">*</span>
              <select
                value={lastSeenLocation}
                onChange={(e) => setLastSeenLocation(e.target.value)}
                required
              >
                <option value="">Select a campus location</option>
                {Array.from(new Set([...getActiveLocationNames(), ...(lastSeenLocation ? [lastSeenLocation] : [])])).map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </label>

            {/* Location Quick Chips */}
            <div className="location-chips-wrap">
              <span className="location-chips-label">Popular Locations:</span>
              <div className="location-chips">
                {quickLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    className={`location-chip-btn ${lastSeenLocation === loc ? 'active' : ''}`}
                    onClick={() => setLastSeenLocation(loc)}
                  >
                    <i className="bi bi-geo-alt-fill" /> {loc}
                  </button>
                ))}
              </div>
            </div>

            {lastSeenLocation === 'Other' && (
              <label>
                Specify Custom Location <span className="req">*</span>
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  required
                />
              </label>
            )}
          </div>

          {/* Section 3: Photo & Urgency */}
          <div className="form-section">
            <div className="form-section-head">
              <div className="form-step-num">3</div>
              <h2>Photo &amp; Priority Settings</h2>
            </div>

            <div className="form-field-group">
              <label className="field-group-label" htmlFor="lost-item-image-input">
                Item Photo <small>(Optional — Cloudinary Upload)</small>
              </label>
              <ImageUploadField
                initialImageUrl={imageUrl}
                onImageUploaded={(url) => setImageUrl(url)}
                onUploadingChange={(uploading) => setImageUploading(uploading)}
              />
            </div>

            {/* High Visibility Urgent Callout */}
            <div className={`urgent-callout-box ${isUrgent ? 'active' : ''}`}>
              <input
                id="urgent-checkbox"
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
              />
              <div className="urgent-callout-text">
                <strong>
                  <i className="bi bi-lightning-charge-fill" /> Mark as Urgent Item
                </strong>
                <p>Urgent items receive high priority in searches and directory listings.</p>
              </div>
            </div>

            <label>
              Auto-Archive Date
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
                  <i className="bi bi-check-lg" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Live Preview */}
        <aside className="form-preview-panel">
          <div className="preview-panel-head">
            <h3>
              <i className="bi bi-eye" /> Live Feed Preview
            </h3>
            <span className="preview-pill">Real-time</span>
          </div>

          <div className="lost-item-card" style={{ boxShadow: 'none' }}>
            <div className="lost-card-media">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="lost-card-image"
                />
              ) : (
                <div className="lost-card-placeholder">
                  <i className={`bi ${getCategoryIcon(category)}`} />
                </div>
              )}

              <div className="lost-card-badges">
                <span className="badge-status badge-status-lost">LOST</span>
                {isUrgent && (
                  <span className="badge-urgent">
                    <i className="bi bi-exclamation-circle-fill" /> URGENT
                  </span>
                )}
              </div>
            </div>

            <div className="lost-card-body">
              <h4 className="lost-card-title">
                {itemName.trim() || 'Item Name Preview'}
              </h4>

              <div className="lost-card-meta">
                <span>
                  <i className={`bi ${getCategoryIcon(category)}`} /> {category || 'Uncategorized'}
                </span>
                {color && <span>• {color}</span>}
              </div>

              <div className="lost-card-location">
                <i className="bi bi-geo-alt" />
                <span>{effectiveLocation || 'Campus location…'}</span>
              </div>

              <div className="lost-card-footer">
                <span className="lost-card-date">
                  <i className="bi bi-clock" /> {lostDate || 'Today'}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
