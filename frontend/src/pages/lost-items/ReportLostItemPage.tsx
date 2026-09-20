import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createLostItem } from '../../services/lostItemService'
import { getErrorMessage } from '../../services/api'
import type { CreateLostItemRequest } from '../../types/lostItem'
import ImageUploadField from '../../components/lost-items/ImageUploadField'
import { getActiveCategoryNames, getActiveLocationNames, getCategoryIcon } from '../../constants/categories'

export default function ReportLostItemPage() {
  const navigate = useNavigate()

  // Form State
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState('')
  const [color, setColor] = useState('')
  const [lostDate, setLostDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [lostTime, setLostTime] = useState(() => {
    const now = new Date()
    return now.toTimeString().slice(0, 5)
  })
  const [lastSeenLocation, setLastSeenLocation] = useState('')
  const [customLocation, setCustomLocation] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const effectiveLocation =
    lastSeenLocation === 'Other' ? customLocation.trim() : lastSeenLocation

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

  // Helpful description tags
  const descriptionTags = [
    'Has Keychain',
    'Leather finish',
    'Sticker attached',
    'Contains Student ID',
    'Black Case',
    'Engraved initials',
  ]

  const addTagToDescription = (tag: string) => {
    setDescription((prev) => {
      if (prev.includes(tag)) return prev
      return prev ? `${prev}, ${tag}` : tag
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
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
      setError('Please provide a description to help identify the item.')
      return
    }
    if (!lostDate) {
      setError('Please select the date the item was lost.')
      return
    }
    if (imageUploading) {
      setError('Please wait for the photo upload to finish before submitting.')
      return
    }

    const lostDateTimeIso = `${lostDate}T${lostTime ? lostTime + ':00' : '12:00:00'}`
    const expiryDateTimeIso = expiryDate ? `${expiryDate}T23:59:59` : null

    const payload: CreateLostItemRequest = {
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
      const created = await createLostItem(payload)
      setSuccess(true)
      setTimeout(() => {
        navigate(`/lost/${created.id}`)
      }, 1000)
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <section className="form-page page-width">
      <div className="form-intro">
        <span className="section-kicker">COMMUNITY REPORTING</span>
        <h1>Report a Lost Item</h1>
        <p>
          Fill in the details you remember. Your report will be immediately searchable by students,
          faculty, and campus security.
        </p>

        <div className="form-tabs">
          <button type="button" className="active">
            <i className="bi bi-flag-fill" /> I lost an item
          </button>
          <button
            type="button"
            onClick={() => navigate('/report/found')}
          >
            <i className="bi bi-box-seam" /> I found an item
          </button>
        </div>
      </div>

      <div className="report-page-layout">
        {/* Left Column: Form Fields */}
        <form className="report-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="alert-banner" role="alert">
              <i className="bi bi-exclamation-circle-fill" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert-banner success" role="status">
              <i className="bi bi-check-circle-fill" />
              <span>Lost item reported successfully! Redirecting to item details…</span>
            </div>
          )}

          {/* Section 1: Item Details */}
          <div className="form-section">
            <div className="form-section-head">
              <div className="form-step-num">1</div>
              <h2>Item Information</h2>
            </div>
            <p>Provide recognizable details so anyone who spots it can quickly identify it.</p>

            <div className="two-fields">
              <label>
                Item Name <span className="req">*</span>
                <input
                  type="text"
                  placeholder="e.g. Dell Inspiron Charger, Blue Water Bottle"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
              </label>

              <label>
                Primary Color <small>(Optional)</small>
                <input
                  type="text"
                  placeholder="e.g. Navy Blue, Matte Black"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </label>
            </div>

            {/* Visual Category Selection Grid */}
            <div className="category-selection-block">
              <span className="form-inner-label">
                Select Category <span className="req">*</span>
              </span>
              <div className="category-pill-grid">
                {getActiveCategoryNames().map((cat) => {
                  const icon = getCategoryIcon(cat)
                  const isSelected = category === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`category-pill-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setCategory(cat)}
                    >
                      <i className={`bi ${icon}`} />
                      <span>{cat}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <label>
              Detailed Description <span className="req">*</span>
              <textarea
                rows={3}
                placeholder="Describe distinguishing marks, stickers, wear and tear, internal contents, or brand model..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              {/* Quick Tags for Description */}
              <div className="desc-quick-tags">
                <span className="quick-tags-label">Quick tags:</span>
                {descriptionTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="tag-pill-btn"
                    onClick={() => addTagToDescription(tag)}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
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
            <p>Approximate times and campus locations help match with reported found items.</p>

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
                {getActiveLocationNames().map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </label>

            {/* Quick Location Chips */}
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
                  placeholder="e.g. 2nd floor corridor near CS Lab 3"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  required
                />
              </label>
            )}
          </div>

          {/* Section 3: Photo, Priority & Lifecycle */}
          <div className="form-section">
            <div className="form-section-head">
              <div className="form-step-num">3</div>
              <h2>Photo &amp; Priority Settings</h2>
            </div>
            <p>High quality photos and urgent flags speed up recovery significantly.</p>

            <div className="form-field-group">
              <label className="field-group-label" htmlFor="lost-item-image-input">
                Item Photo <small>(Optional — Secure Cloudinary Upload)</small>
              </label>
              <ImageUploadField
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
              <label htmlFor="urgent-checkbox" className="urgent-callout-text">
                <strong>
                  <i className="bi bi-lightning-charge-fill" /> Mark as Urgent Item
                </strong>
                <p>
                  Urgent items get top placement and an animated beacon. Recommended for College IDs,
                  wallets, keys, and hall tickets.
                </p>
              </label>
            </div>

            <div className="two-fields">
              <label>
                Auto-Archive Date <small>(Default 30 days)</small>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </label>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="form-actions">
            <button
              type="button"
              className="button secondary"
              onClick={() => navigate('/lost')}
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
                  Submitting report…
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg" /> Publish Lost Report
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Sticky Live Preview Panel */}
        <aside className="form-preview-panel">
          <div className="preview-panel-head">
            <h3>
              <i className="bi bi-eye" /> Live Feed Preview
            </h3>
            <span className="preview-pill">Real-time</span>
          </div>

          {/* Card representation */}
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

          <div className="preview-tips-card">
            <strong>
              <i className="bi bi-shield-check" /> Tips for Faster Recovery
            </strong>
            <ul>
              <li>Upload a clear photo if available.</li>
              <li>Include unique stickers or marks in description.</li>
              <li>Check the Found Items catalog frequently.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  )
}
