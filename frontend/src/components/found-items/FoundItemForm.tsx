import { useState, type FormEvent } from 'react'
import type { CreateFoundItemRequest } from '../../types/foundItem'

interface FoundItemFormProps {
  initialValues?: Partial<CreateFoundItemRequest>
  onSubmit: (formData: CreateFoundItemRequest) => Promise<void>
  isSubmitting: boolean
  submitLabel: string
  error: string | null
  onCancel: () => void
}

const CATEGORIES = [
  'Electronics',
  'Bags & Backpacks',
  'Books & Notebooks',
  'ID Cards & Documents',
  'Keys',
  'Personal Accessories',
  'Wallets & Purses',
  'Clothing & Wearables',
  'Water Bottles',
  'Other',
]

const COMMON_CAMPUS_LOCATIONS = [
  'Harrison Central Library',
  'Student Union Building',
  'Science Building Ground Floor',
  'Main Academic Block',
  'North Campus Gymnasium',
  'Campus Canteen / Cafeteria',
  'Hostel Block A',
  'Hostel Block B',
  'Main Entrance & Parking',
  'Sports Complex',
]

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
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')

  // Client validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!itemName.trim()) errs.itemName = 'Item name is required'
    if (!category.trim()) errs.category = 'Please select a category'
    if (!foundDateTime.trim()) errs.foundDateTime = 'Found date and time is required'
    if (!foundLocation.trim()) errs.foundLocation = 'Found location is required'
    if (!description.trim()) errs.description = 'Please provide a clear description'

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    await onSubmit({
      itemName: itemName.trim(),
      category: category.trim(),
      color: color.trim() || null,
      foundDateTime: foundDateTime.includes('T') && foundDateTime.length === 16 ? `${foundDateTime}:00` : foundDateTime,
      foundLocation: foundLocation.trim(),
      imageUrl: imageUrl.trim() || null,
      description: description.trim(),
    })
  }

  return (
    <form className="fmc-form-container" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="alert-banner" role="alert">
          <i className="bi bi-exclamation-circle" />
          <span>{error}</span>
        </div>
      )}

      <div className="fmc-form-grid">
        {/* Item Name */}
        <div className="fmc-field full-width">
          <label htmlFor="itemName">
            Item Name <span className="required">*</span>
          </label>
          <input
            id="itemName"
            type="text"
            className="fmc-input"
            placeholder="e.g. Blue Dell Laptop Sleeve"
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value)
              if (fieldErrors.itemName) setFieldErrors((prev) => ({ ...prev, itemName: '' }))
            }}
          />
          {fieldErrors.itemName && <span className="field-error">{fieldErrors.itemName}</span>}
        </div>

        {/* Category */}
        <div className="fmc-field">
          <label htmlFor="category">
            Category <span className="required">*</span>
          </label>
          <select
            id="category"
            className="fmc-form-select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              if (fieldErrors.category) setFieldErrors((prev) => ({ ...prev, category: '' }))
            }}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {fieldErrors.category && <span className="field-error">{fieldErrors.category}</span>}
        </div>

        {/* Color */}
        <div className="fmc-field">
          <label htmlFor="color">
            Primary Color <small>(optional)</small>
          </label>
          <input
            id="color"
            type="text"
            className="fmc-input"
            placeholder="e.g. Navy Blue, Silver, Black"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>

        {/* Date and Time Found */}
        <div className="fmc-field">
          <label htmlFor="foundDateTime">
            Date &amp; Time Found <span className="required">*</span>
          </label>
          <input
            id="foundDateTime"
            type="datetime-local"
            className="fmc-input"
            value={foundDateTime}
            onChange={(e) => {
              setFoundDateTime(e.target.value)
              if (fieldErrors.foundDateTime) setFieldErrors((prev) => ({ ...prev, foundDateTime: '' }))
            }}
          />
          {fieldErrors.foundDateTime && (
            <span className="field-error">{fieldErrors.foundDateTime}</span>
          )}
        </div>

        {/* Location Found */}
        <div className="fmc-field">
          <label htmlFor="foundLocation">
            Campus Location <span className="required">*</span>
          </label>
          <input
            id="foundLocation"
            type="text"
            list="location-options"
            className="fmc-input"
            placeholder="e.g. Library 2nd Floor, Science Block"
            value={foundLocation}
            onChange={(e) => {
              setFoundLocation(e.target.value)
              if (fieldErrors.foundLocation) setFieldErrors((prev) => ({ ...prev, foundLocation: '' }))
            }}
          />
          <datalist id="location-options">
            {COMMON_CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
          {fieldErrors.foundLocation && (
            <span className="field-error">{fieldErrors.foundLocation}</span>
          )}
        </div>

        {/* Image URL */}
        <div className="fmc-field full-width">
          <label htmlFor="imageUrl">
            Item Image URL <small>(optional, e.g. Cloudinary)</small>
          </label>
          <input
            id="imageUrl"
            type="url"
            className="fmc-input"
            placeholder="https://res.cloudinary.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          {imageUrl && (
            <div className="fmc-image-preview">
              <img
                src={imageUrl}
                alt="Item preview"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
            </div>
          )}
          <span className="auth-hint">
            Images are securely hosted on Cloudinary; the database stores only the image URL.
          </span>
        </div>

        {/* Description */}
        <div className="fmc-field full-width">
          <label htmlFor="description">
            Detailed Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            className="fmc-textarea"
            rows={4}
            placeholder="Describe distinguishing marks, condition, brand, stickers, or general contents..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: '' }))
            }}
          />
          {fieldErrors.description && (
            <span className="field-error">{fieldErrors.description}</span>
          )}
        </div>
      </div>

      <div className="fmc-form-actions">
        <button
          type="button"
          className="button secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button type="submit" className="button primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="loader-spinner light" aria-hidden="true" />
              Saving...
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
  )
}
