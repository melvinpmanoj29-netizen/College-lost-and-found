import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import foundItemService from '../../services/foundItemService'
import { getErrorMessage } from '../../services/api'
import type { CreateFoundItemRequest } from '../../types/foundItem'
import FoundItemForm from '../../components/found-items/FoundItemForm'

export default function ReportFoundItemPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: CreateFoundItemRequest) {
    setIsSubmitting(true)
    setError(null)
    try {
      const createdItem = await foundItemService.create(formData)
      navigate(`/found/${createdItem.id}`)
    } catch (err) {
      setError(getErrorMessage(err))
      setIsSubmitting(false)
    }
  }

  return (
    <section className="fmc-page page-width">
      <div className="fmc-header">
        <div>
          <button
            type="button"
            className="back-button mb-2"
            onClick={() => navigate('/found')}
          >
            <i className="bi bi-arrow-left" /> Back to found items
          </button>
          <span className="section-kicker">REPORT FOUND ITEM</span>
          <h1>Submit a Found Item Report</h1>
          <p>
            Thank you for helping campus belongings find their way back. Enter accurate details
            below so the rightful owner can recognize it and submit a verification claim.
          </p>
        </div>
      </div>

      <FoundItemForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Publish Found Item"
        error={error}
        onCancel={() => navigate('/found')}
      />
    </section>
  )
}
