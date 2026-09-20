import { useState, type FormEvent } from 'react'
import type { CreateFoundItemRequest } from '../../types/foundItem'
import { getActiveCategoryNames, getActiveLocationNames, getCategoryIcon } from '../../constants/categories'
import ImageUploadField from '../lost-items/ImageUploadField'

interface FoundItemFormProps {
  initialValues?: Partial<CreateFoundItemRequest>
  onSubmit: (formData: CreateFoundItemRequest) => Promise<void>
  isSubmitting: boolean
  submitLabel: string
  error: string | null
  onCancel: () => void
}

export default function FoundItemForm({
  initialValues,
  onSubmit,
  isSubmitting,
  submitLabel,
  error,
  onCancel,
}: FoundItemFormProps) {
  const [itemName, setItemName] = useState(initialValues?.itemName ?? '')
  const [category, setCategory] = useState(initialValues?.category ?? '')
  const [color, setColor] = useState(initialValues?.color ?? '')
  const [foundDateTime, setFoundDateTime] = useState(
    initialValues?.foundDateTime
      ? initialValues.foundDateTime.slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  )
  const [foundLocation, setFoundLocation] = useState(initialValues?.foundLocation ?? '')
  const [customLocation, setCustomLocation] = useState('')
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? '')
  const [imageUploading, setImageUploading] = useState(false)
  const [description, setDescription] = useState(initialValues?.description ?? '')

  // Client validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

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

  const effectiveLocation =
    foundLocation === 'Other' ? customLocation.trim() : foundLocation

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!itemName.trim()) errs.itemName = 'Item name is required'
    if (!category.trim()) errs.category = 'Please select a category'
    if (!foundDateTime.trim()) errs.foundDateTime = 'Found date and time is required'
    if (!effectiveLocation) errs.foundLocation = 'Found location is required'
    if (!description.trim()) errs.description = 'Please provide a clear description'

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    if (imageUploading) return

    await onSubmit({
      itemName: itemName.trim(),
      category: category.trim(),
      color: color.trim() || null,
      foundDateTime: foundDateTime.includes('T') && foundDateTime.length === 16 ? `${foundDateTime}:00` : foundDateTime,
      foundLocation: effectiveLocation,
      imageUrl: imageUrl.trim() || null,
      description: description.trim(),
    })
  }

  return (
    <div className="report-page-layout">
      {/* Left Column: Form */}
      <form className="report-form" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="alert-banner" role="alert">
            <i className="bi bi-exclamation-circle" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Item Details */}
        <div className="form-section">
          <div className="form-section-head">
            <div className="form-step-num">1</div>
            <h2>Found Item Details</h2>
          </div>
          <p>Provide recognizable details so the rightful owner can recognize it.</p>

          <label htmlFor="itemName">
            Item Name <span className="req">*</span>
            <input
              id="itemName"
              type="text"
              className="fmc-input"
              placeholder="e.g. Black Dell Laptop Charger, Silver Casio Watch"
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value)
                if (fieldErrors.itemName) setFieldErrors((prev) => ({ ...prev, itemName: '' }))
              }}
              required
            />
            {fieldErrors.itemName && <span className="field-error">{fieldErrors.itemName}</span>}
          </label>

          <div className="two-fields">
            <label htmlFor="category">
              Category <span className="req">*</span>
              <select
                id="category"
                className="fmc-form-select"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  if (fieldErrors.category) setFieldErrors((prev) => ({ ...prev, category: '' }))
                }}
                required
              >
                <option value="">Select a category</option>
                {Array.from(new Set([...getActiveCategoryNames(), ...(category ? [category] : [])])).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {fieldErrors.category && <span className="field-error">{fieldErrors.category}</span>}
            </label>

            <label htmlFor="color">
              Primary Color <small>(Optional)</small>
              <input
                id="color"
                type="text"
                className="fmc-input"
                placeholder="e.g. Navy Blue, Silver, Black"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </label>
          </div>

          <label htmlFor="description">
            Detailed Description <span className="req">*</span>
            <textarea
              id="description"
              className="fmc-textarea"
              rows={4}
              placeholder="Describe distinguishing marks, model, general condition, or stickers..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: '' }))
              }}
              required
            />
            <div className="textarea-footer">
              <span>Never disclose secret verification details (e.g. passcode, secret notes).</span>
              <span>{description.length} characters</span>
            </div>
            {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
          </label>
        </div>

        {/* Section 2: Time & Campus Location */}
        <div className="form-section">
          <div className="form-section-head">
            <div className="form-step-num">2</div>
            <h2>When &amp; Where Was It Found?</h2>
          </div>
          <p>Accurate location details trigger high-precision automated smart matching.</p>

          <label htmlFor="foundDateTime">
            Date &amp; Time Found <span className="req">*</span>
            <input
              id="foundDateTime"
              type="datetime-local"
              className="fmc-input"
              value={foundDateTime}
              onChange={(e) => {
                setFoundDateTime(e.target.value)
                if (fieldErrors.foundDateTime) setFieldErrors((prev) => ({ ...prev, foundDateTime: '' }))
              }}
              required
            />
            {fieldErrors.foundDateTime && <span className="field-error">{fieldErrors.foundDateTime}</span>}
          </label>

          <label htmlFor="foundLocation">
            Campus Location <span className="req">*</span>
            <select
              id="foundLocation"
              className="fmc-form-select"
              value={foundLocation}
              onChange={(e) => {
                setFoundLocation(e.target.value)
                if (fieldErrors.foundLocation) setFieldErrors((prev) => ({ ...prev, foundLocation: '' }))
              }}
              required
            >
              <option value="">Select a campus location</option>
              {getActiveLocationNames().map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            {fieldErrors.foundLocation && <span className="field-error">{fieldErrors.foundLocation}</span>}
          </label>

          {/* Location Quick Chips */}
          <div className="location-chips-wrap">
            <span className="location-chips-label">Popular Locations:</span>
            <div className="location-chips">
              {quickLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  className={`location-chip-btn ${foundLocation === loc ? 'active' : ''}`}
                  onClick={() => {
                    setFoundLocation(loc)
                    if (fieldErrors.foundLocation) setFieldErrors((prev) => ({ ...prev, foundLocation: '' }))
                  }}
                >
                  <i className="bi bi-geo-alt-fill" /> {loc}
                </button>
              ))}
            </div>
          </div>

          {foundLocation === 'Other' && (
            <label>
              Specify Custom Location <span className="req">*</span>
              <input
                type="text"
                className="fmc-input"
                placeholder="e.g. 2nd floor corridor near Lab 4"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                required
              />
            </label>
          )}
        </div>

        {/* Section 3: Photo Upload */}
        <div className="form-section">
          <div className="form-section-head">
            <div className="form-step-num">3</div>
            <h2>Photo Verification</h2>
          </div>
          <p>A photo helps the owner verify their item immediately.</p>

          <div className="form-field-group">
            <label className="field-group-label" htmlFor="found-item-image-input">
              Item Photo <small>(Optional — Cloudinary Upload)</small>
            </label>
            <ImageUploadField
              initialImageUrl={imageUrl}
              onImageUploaded={(url) => setImageUrl(url || '')}
              onUploadingChange={(uploading) => setImageUploading(uploading)}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="button secondary"
            onClick={onCancel}
            disabled={isSubmitting || imageUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button primary"
            disabled={isSubmitting || imageUploading}
          >
            {imageUploading ? (
              <>
                <span className="loader-spinner light" aria-hidden="true" />
                Uploading photo…
              </>
            ) : isSubmitting ? (
              <>
                <span className="loader-spinner light" aria-hidden="true" />
                Saving report…
              </>
            ) : (
              <>
                <i className="bi bi-check-lg" />
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Right Column: Live Preview Panel */}
      <aside className="form-preview-panel">
        <div className="preview-panel-head">
          <h3>
            <i className="bi bi-eye" /> Live Feed Preview
          </h3>
          <span className="preview-pill">Real-time</span>
        </div>

        <div className="fmc-card" style={{ boxShadow: 'none' }}>
          <div className="fmc-card-media">
            {imageUrl ? (
              <img src={imageUrl} alt="Item preview" />
            ) : (
              <div className="media-fallback">
                <i className={`bi ${getCategoryIcon(category)}`} />
                <span>{category || 'ITEM'}</span>
              </div>
            )}
            <div className="card-status-badge">
              <span className="fmc-badge found">FOUND</span>
            </div>
            {category && (
              <div className="card-category-badge">{category}</div>
            )}
          </div>

          <div className="fmc-card-body">
            <h4 className="fmc-card-title">
              {itemName.trim() || 'Found Item Name'}
            </h4>
            <p className="fmc-card-desc">
              {description.trim() || 'Detailed description preview will appear here…'}
            </p>

            <div className="fmc-card-meta">
              <div className="fmc-card-meta-row">
                <i className="bi bi-geo-alt-fill" />
                <span>{effectiveLocation || 'Campus location…'}</span>
              </div>
              <div className="fmc-card-meta-row">
                <i className="bi bi-calendar3" />
                <span>{foundDateTime.replace('T', ' ') || 'Today'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="preview-tips-card">
          <strong>
            <i className="bi bi-shield-lock" /> Safe Custody Notice
          </strong>
          <p style={{ margin: 0, fontSize: '0.76rem', lineHeight: 1.4 }}>
            Please deposit high-value items (laptops, wallets, gold, cash) with Campus Security or the Dean's office for secure verification.
          </p>
        </div>
      </aside>
    </div>
  )
}
