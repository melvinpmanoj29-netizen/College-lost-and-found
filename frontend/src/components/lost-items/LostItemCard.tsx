import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LostItem } from '../../types/lostItem'

interface LostItemCardProps {
  item: LostItem
  showOwnerActions?: boolean
  onDelete?: (id: number) => void
}

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return isoDate
  }
}

function getCategoryIcon(category: string): string {
  const c = category.toLowerCase()
  if (c.includes('bag') || c.includes('backpack')) return 'bi-backpack2'
  if (c.includes('phone') || c.includes('mobile')) return 'bi-phone'
  if (c.includes('book') || c.includes('notebook')) return 'bi-book'
  if (c.includes('key')) return 'bi-key'
  if (c.includes('card') || c.includes('id')) return 'bi-person-badge'
  if (c.includes('electronic') || c.includes('earbud') || c.includes('laptop')) return 'bi-laptop'
  if (c.includes('bottle') || c.includes('flask')) return 'bi-cup-straw'
  if (c.includes('wallet') || c.includes('purse')) return 'bi-wallet2'
  return 'bi-box-seam'
}

export default function LostItemCard({ item, showOwnerActions, onDelete }: LostItemCardProps) {
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)

  const statusClass =
    item.status === 'RETURNED'
      ? 'badge-status-returned'
      : item.status === 'ARCHIVED'
      ? 'badge-status-archived'
      : 'badge-status-lost'

  return (
    <article className="lost-item-card">
      <div className="lost-card-media" onClick={() => navigate(`/lost/${item.id}`)}>
        {item.imageUrl && !imageError ? (
          <img
            src={item.imageUrl}
            alt={item.itemName}
            className="lost-card-image"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="lost-card-placeholder">
            <i className={`bi ${getCategoryIcon(item.category)}`} />
          </div>
        )}

        <div className="lost-card-badges">
          <span className={`badge-status ${statusClass}`}>{item.status}</span>
          {item.isUrgent && (
            <span className="badge-urgent">
              <i className="bi bi-lightning-charge-fill" /> Urgent
            </span>
          )}
        </div>
      </div>

      <div className="lost-card-body">
        <div className="lost-card-header">
          <h3
            className="lost-card-title"
            title={item.itemName}
            onClick={() => navigate(`/lost/${item.id}`)}
          >
            {item.itemName}
          </h3>
        </div>

        <p className="lost-card-meta">
          <span>
            <i className="bi bi-tag" /> {item.category}
          </span>
          {item.color && (
            <span>
              <i className="bi bi-palette" /> {item.color}
            </span>
          )}
        </p>

        <p className="lost-card-location">
          <i className="bi bi-geo-alt" /> {item.lastSeenLocation}
        </p>

        <div className="lost-card-footer">
          <span className="lost-card-date">
            <i className="bi bi-calendar3" /> Lost {formatDate(item.lostDateTime)}
          </span>

          <div className="lost-card-actions">
            {showOwnerActions ? (
              <div className="lost-card-owner-buttons" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="button secondary small"
                  style={{ fontSize: '0.78rem', padding: '0 8px', gap: '4px' }}
                  title="View AI Smart Matches"
                  onClick={() => navigate(`/matches/lost/${item.id}`)}
                >
                  <i className="bi bi-cpu" /> Matches
                </button>
                <button
                  type="button"
                  className="button secondary small icon-btn"
                  title="Edit item"
                  onClick={() => navigate(`/lost/${item.id}/edit`)}
                >
                  <i className="bi bi-pencil" />
                </button>
                {onDelete && (
                  <button
                    type="button"
                    className="button secondary small icon-btn text-danger"
                    title="Delete item"
                    onClick={() => onDelete(item.id)}
                  >
                    <i className="bi bi-trash" />
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="button secondary small"
                  style={{ fontSize: '0.76rem', padding: '0 8px', gap: '4px' }}
                  title="View AI Smart Matches"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/matches/lost/${item.id}`)
                  }}
                >
                  <i className="bi bi-cpu" /> Matches
                </button>
                <button
                  type="button"
                  className="details-link"
                  onClick={() => navigate(`/lost/${item.id}`)}
                >
                  View details <i className="bi bi-arrow-right" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
