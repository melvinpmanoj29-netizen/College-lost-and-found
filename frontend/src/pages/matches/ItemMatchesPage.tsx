import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import matchService from '../../services/matchService'
import { getErrorMessage } from '../../services/api'
import type { Match } from '../../types/match'
import MatchCard from '../../components/matches/MatchCard'
import MatchExplanationBanner from '../../components/matches/MatchExplanationBanner'

interface ItemMatchesPageProps {
  type?: 'found' | 'lost'
}

export default function ItemMatchesPage({ type }: ItemMatchesPageProps) {
  const { foundItemId, lostItemId } = useParams<{ foundItemId?: string; lostItemId?: string }>()
  const navigate = useNavigate()

  // Determine whether this is for a found item or lost item
  const isFoundItem = Boolean(foundItemId) || type === 'found'
  const targetId = Number(foundItemId || lostItemId)
  const isInvalidId = (!foundItemId && !lostItemId) || isNaN(targetId) || targetId <= 0

  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isInvalidId) return
    let cancelled = false

    async function loadMatches() {
      setLoading(true)
      setError(null)
      try {
        const data = isFoundItem
          ? await matchService.getMatchesForFoundItem(targetId)
          : await matchService.getMatchesForLostItem(targetId)

        if (!cancelled) {
          // Sort descending by score
          const sorted = [...data].sort((a, b) => b.matchScore - a.matchScore)
          setMatches(sorted)
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadMatches()

    return () => {
      cancelled = true
    }
  }, [targetId, isFoundItem, isInvalidId])

  if (isInvalidId) {
    return (
      <section className="fmc-page page-width">
        <button
          type="button"
          className="back-button mb-3"
          onClick={() => navigate('/found')}
        >
          <i className="bi bi-arrow-left" /> Back
        </button>
        <div className="alert-banner" role="alert">
          <i className="bi bi-exclamation-triangle" />
          <div className="flex-grow-1">
            <strong>Invalid item identifier</strong>
            <p className="mb-2">The provided item identifier is invalid.</p>
            <button
              type="button"
              className="button secondary small"
              onClick={() => navigate('/found')}
            >
              Back to directory
            </button>
          </div>
        </div>
      </section>
    )
  }

  const returnPath = isFoundItem ? `/found/${targetId}` : '/lost'

  return (
    <section className="fmc-page page-width">
      <button
        type="button"
        className="back-button mb-3"
        onClick={() => navigate(returnPath)}
      >
        <i className="bi bi-arrow-left" /> Back to {isFoundItem ? 'found item' : 'lost item'}
      </button>

      <div className="fmc-header">
        <div>
          <span className="section-kicker">SMART MATCHING SYSTEM</span>
          <h1>
            Matches for {isFoundItem ? `Found Item #${targetId}` : `Lost Item #${targetId}`}
          </h1>
          <p>
            The system continuously compares item categories, colors, locations, timestamps, and
            descriptions to suggest potential reunions.
          </p>
        </div>
      </div>

      {/* Educational Banner for Viva / Institutional transparency */}
      <MatchExplanationBanner />

      {/* Loading state */}
      {loading && (
        <div className="full-page-loader" style={{ minHeight: '300px' }}>
          <div className="loader-box">
            <span className="loader-spinner" aria-hidden="true" />
            <span>Evaluating campus reports and calculating matches...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="alert-banner" role="alert">
          <i className="bi bi-exclamation-triangle" />
          <div className="flex-grow-1">
            <strong>Unable to load matches</strong>
            <p className="mb-2">{error}</p>
            <button
              type="button"
              className="button secondary small"
              onClick={() => window.location.reload()}
            >
              <i className="bi bi-arrow-clockwise" /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty matches state */}
      {!loading && !error && matches.length === 0 && (
        <div className="fmc-empty-state">
          <div className="fmc-empty-icon">
            <i className="bi bi-stars" />
          </div>
          <h3>No matches detected yet</h3>
          <p>
            The matching algorithm compares existing and upcoming reports automatically. As more
            students file reports matching the location, category, or description, potential matches will
            appear here.
          </p>
          <button
            type="button"
            className="button secondary"
            onClick={() => navigate(returnPath)}
          >
            Back to Item
          </button>
        </div>
      )}

      {/* Match cards grid */}
      {!loading && !error && matches.length > 0 && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted small">
              Found <strong>{matches.length}</strong> potential match
              {matches.length > 1 ? 'es' : ''}
            </span>
          </div>

          <div className="fmc-card-grid">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
