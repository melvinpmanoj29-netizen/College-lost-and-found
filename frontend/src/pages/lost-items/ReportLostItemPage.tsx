import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createLostItem } from '../../services/lostItemService'
import { getErrorMessage } from '../../services/api'
import type { CreateLostItemRequest } from '../../types/lostItem'

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
  const [imageUrl, setImageUrl] = useState('')
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

    const lostDateTimeIso = `${lostDate}T${lostTime ? lostTime + ':00' : '12:00:00'}`
    const expiryDateTimeIso = expiryDate ? `${expiryDate}T23:59:59` : null

    const payload: CreateLostItemRequest = {
      itemName: itemName.trim(),
      category: category.trim(),
      color: color.trim() || null,
      lastSeenLocation: effectiveLocation,
      description: description.trim(),
      lostDateTime: lostDateTimeIso,
      imageUrl: imageUrl.trim() || null,
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
        <span className="section-kicker">NEW REPORT</span>
        <h1>Report a lost item</h1>
        <p>
          Share the details you remember. Your report will be immediately searchable by other
          students and campus staff.
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
            <span>Lost item reported successfully! Redirecting…</span>
          </div>
        )}

        <div className="form-section">
          <h2>Item details</h2>
          <p>Provide recognizable details so anyone who spots it can identify it.</p>

          <label>
            Item name <span className="req">*</span>
            <input
              type="text"
              placeholder="e.g. Navy Blue Nike Backpack, Casio FX-991EX Calculator"
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
                placeholder="e.g. Black, Silver, Navy"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </label>
          </div>

          <label>
            Description <span className="req">*</span>
            <textarea
              rows={4}
              placeholder="Describe unique marks, stickers, wear and tear, internal contents, or identifying features…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>

          <label>
            Photo URL <small>(Optional — Cloudinary image URL)</small>
            <input
              type="url"
              placeholder="https://res.cloudinary.com/…"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <span className="auth-hint">
              Upload your photo to Cloudinary and paste the link here. Only image URLs are stored.
            </span>
          </label>
        </div>

        <div className="form-section">
          <h2>When and where was it lost?</h2>
          <p>Approximate times and locations help students trace where it might be.</p>

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
                placeholder="e.g. 2nd floor corridor near Lab 4"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                required
              />
            </label>
          )}
        </div>

        <div className="form-section">
          <h2>Priority &amp; Lifecycle</h2>
          <p>Urgent items receive high visibility. Expiry dates trigger archiving.</p>

          <div className="checkbox-field">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
              />
              <span>
                <strong>Mark as urgent item</strong>
                <small>Recommended for College IDs, house/car keys, wallets, or essential documents.</small>
              </span>
            </label>
          </div>

          <label>
            Auto-archive date <small>(Default 30 days)</small>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
            <span className="auth-hint">
              Unresolved reports are archived after this date to keep the directory fresh, while
              preserving records for campus history.
            </span>
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => navigate('/lost')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="button primary" disabled={submitting}>
            {submitting ? (
              <>
                <span className="loader-spinner light" aria-hidden="true" />
                Submitting report…
              </>
            ) : (
              <>
                <i className="bi bi-check-lg" /> Submit lost report
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}
