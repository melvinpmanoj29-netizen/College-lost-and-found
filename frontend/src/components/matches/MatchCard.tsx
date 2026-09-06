import { useNavigate } from 'react-router-dom'
import type { Match } from '../../types/match'
import MatchScoreBadge from './MatchScoreBadge'

interface MatchCardProps {
  match: Match
  showClaimButton?: boolean
}

export default function MatchCard({ match, showClaimButton = true }: MatchCardProps) {
  const navigate = useNavigate()

  const formattedDate = new Date(match.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <article className="fmc-card" aria-label={`Match #${match.id}`}>
      <div className="fmc-card-body">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
          <div>
            <span className="section-kicker">MATCH #{match.id}</span>
            <h3 className="fmc-card-title mt-1 mb-0">Possible Match Found</h3>
            <small className="text-muted">Detected on {formattedDate}</small>
          </div>
          <span className={`fmc-badge ${match.matchStatus.toLowerCase()}`}>
            {match.matchStatus}
          </span>
        </div>

        <div className="mb-3">
          <MatchScoreBadge score={match.matchScore} />
        </div>

        <div className="fmc-card-meta">
          <div className="fmc-card-meta-row">
            <i className="bi bi-search" />
            <span>
              Lost Item Reference: <strong>#{match.lostItemId}</strong>
            </span>
          </div>
          <div className="fmc-card-meta-row">
            <i className="bi bi-box-seam" />
            <span>
              Found Item Reference: <strong>#{match.foundItemId}</strong>
            </span>
          </div>
        </div>

        <div className="fmc-card-actions mt-auto">
          <button
            type="button"
            className="button secondary small"
            onClick={() => navigate(`/found/${match.foundItemId}`)}
            title="View found item details"
          >
            <i className="bi bi-box-seam" /> View Found Item
          </button>
          <button
            type="button"
            className="button secondary small"
            onClick={() => navigate(`/matches/${match.id}`)}
          >
            <i className="bi bi-eye" /> Match Details
          </button>
          {showClaimButton && match.matchStatus !== 'RESOLVED' && (
            <button
              type="button"
              className="button primary small"
              onClick={() =>
                navigate(`/claims/new?lostItemId=${match.lostItemId}&foundItemId=${match.foundItemId}`)
              }
            >
              <i className="bi bi-shield-check" /> Claim
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
