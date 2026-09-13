import { useNavigate } from 'react-router-dom'
import type { Claim } from '../../types/claim'
import ClaimStatusBadge from './ClaimStatusBadge'

interface ClaimCardProps {
  claim: Claim
}

export default function ClaimCard({ claim }: ClaimCardProps) {
  const navigate = useNavigate()

  const formattedDate = new Date(claim.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <article className="fmc-card" aria-label={`Claim #${claim.id}`}>
      <div className="fmc-card-body">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
          <div>
            <span className="section-kicker">CLAIM #{claim.id}</span>
            <h3 className="fmc-card-title mt-1 mb-0">Ownership Claim</h3>
            <small className="text-muted">Submitted {formattedDate}</small>
          </div>
          <ClaimStatusBadge status={claim.status} />
        </div>

        <div className="fmc-card-meta">
          <div className="fmc-card-meta-row">
            <i className="bi bi-box-seam" />
            <span>
              Claimed Found Item: <strong>#{claim.foundItemId}</strong>
            </span>
          </div>
          <div className="fmc-card-meta-row">
            <i className="bi bi-search" />
            <span>
              Associated Lost Item: <strong>#{claim.lostItemId}</strong>
            </span>
          </div>
        </div>

        <div className="fmc-card-actions mt-auto">
          <button
            type="button"
            className="button secondary small"
            onClick={() => navigate(`/found/${claim.foundItemId}`)}
            title="Inspect claimed item"
          >
            <i className="bi bi-box-seam" /> View Item
          </button>
          <button
            type="button"
            className="button primary small"
            onClick={() => navigate(`/claims/${claim.id}`)}
          >
            <i className="bi bi-eye" /> Claim Status
          </button>
        </div>
      </div>
    </article>
  )
}
