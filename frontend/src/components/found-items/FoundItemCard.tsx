import { useNavigate } from 'react-router-dom'
import type { FoundItem } from '../../types/foundItem'

interface FoundItemCardProps {
  item: FoundItem
  isOwner?: boolean
}

export default function FoundItemCard({ item, isOwner }: FoundItemCardProps) {
  const navigate = useNavigate()

  const formattedDate = new Date(item.foundDateTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <article className="fmc-card" aria-label={`Found item: ${item.itemName}`}>
      <div className="fmc-card-media">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.itemName} loading="lazy" />
        ) : (
          <div className="media-fallback">
            <i className="bi bi-box-seam" />
            <span>No image</span>
          </div>
        )}

        <span className={`fmc-badge card-status-badge ${item.status.toLowerCase()}`}>
          <i className={`bi ${item.status === 'FOUND' ? 'bi-box-seam' : 'bi-check-circle-fill'}`} />
          {item.status}
        </span>

        <span className="card-category-badge">{item.category}</span>
      </div>

      <div className="fmc-card-body">
        <h3 className="fmc-card-title">{item.itemName}</h3>
        <p className="fmc-card-desc">{item.description}</p>

        <div className="fmc-card-meta">
          <div className="fmc-card-meta-row">
            <i className="bi bi-geo-alt" />
            <span>{item.foundLocation}</span>
          </div>
          <div className="fmc-card-meta-row">
            <i className="bi bi-calendar3" />
            <span>Found {formattedDate}</span>
          </div>
          {item.color && (
            <div className="fmc-card-meta-row">
              <i className="bi bi-palette" />
              <span>Color: {item.color}</span>
            </div>
          )}
          {isOwner && (
            <div className="fmc-card-meta-row">
              <i className="bi bi-person-check text-primary" />
              <span className="text-primary fw-medium">Reported by you</span>
            </div>
          )}
        </div>

        <div className="fmc-card-actions">
          <button
            type="button"
            className="button secondary small"
            onClick={() => navigate(`/found/${item.id}`)}
          >
            <i className="bi bi-eye" /> Details
          </button>
          <button
            type="button"
            className="button primary small"
            onClick={() => navigate(`/matches/found/${item.id}`)}
            title="Check smart matches"
          >
            <i className="bi bi-stars" /> Matches
          </button>
        </div>
      </div>
    </article>
  )
}
