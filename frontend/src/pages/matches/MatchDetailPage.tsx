import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import matchService from '../../services/matchService'
import { getErrorMessage } from '../../services/api'
import type { Match } from '../../types/match'
import MatchScoreBadge from '../../components/matches/MatchScoreBadge'
import MatchExplanationBanner from '../../components/matches/MatchExplanationBanner'

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const matchId = Number(id)
  const isInvalidId = !id || isNaN(matchId) || matchId <= 0

  useEffect(() => {
    if (isInvalidId) return
    let cancelled = false

    async function loadMatch() {
      setLoading(true)
      setError(null)
      try {
        const data = await matchService.getById(matchId)
        if (!cancelled) setMatch(data)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadMatch()

    return () => {
      cancelled = true
    }
  }, [matchId, isInvalidId])

  if (isInvalidId) {
    return (
      <section className="fmc-page page-width">
        <button
          type="button"
          className="back-button mb-3"
          onClick={() => navigate('/found')}
        >
          <i className="bi bi-arrow-left" /> Back to directory
        </button>
        <div className="alert-banner" role="alert">
          <i className="bi bi-exclamation-triangle" />
          <div className="flex-grow-1">
            <strong>Invalid match identifier</strong>
            <p className="mb-2">The provided match identifier is invalid.</p>
            <button
              type="button"
              className="button secondary small"
              onClick={() => navigate('/found')}
            >
              Return to directory
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <div className="full-page-loader">
        <div className="loader-box">
          <span className="loader-spinner" aria-hidden="true" />
          <span>Loading match details...</span>
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <section className="fmc-page page-width">
        <button
          type="button"
          className="back-button mb-3"
          onClick={() => navigate('/found')}
        >
          <i className="bi bi-arrow-left" /> Back to directory
        </button>
        <div className="alert-banner" role="alert">
          <i className="bi bi-exclamation-triangle" />
          <div className="flex-grow-1">
            <strong>Unable to display match</strong>
            <p className="mb-2">{error || 'Match record not found'}</p>
            <button
              type="button"
              className="button secondary small"
              onClick={() => navigate('/found')}
            >
              Return to directory
            </button>
          </div>
        </div>
      </section>
    )
  }

  const formattedDate = new Date(match.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <section className="fmc-page page-width">
      <button
        type="button"
        className="back-button mb-3"
        onClick={() => navigate(`/matches/found/${match.foundItemId}`)}
      >
        <i className="bi bi-arrow-left" /> Back to matches list
      </button>

      <div className="fmc-header">
        <div>
          <span className="section-kicker">SMART MATCH DETAILS</span>
          <h1>Match #{match.id}</h1>
          <p>Generated automatically by campus rule scoring on {formattedDate}.</p>
        </div>
        <div className="fmc-header-actions">
          <span className={`fmc-badge ${match.matchStatus.toLowerCase()}`}>
            Status: {match.matchStatus}
          </span>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-7">
          <div className="fmc-detail-card mb-4">
            <h2 className="fs-5 fw-bold mb-3">Matching Score Breakdown</h2>
            <div className="mb-4">
              <MatchScoreBadge score={match.matchScore} />
            </div>

            <div className="p-3 bg-light rounded border mb-4">
              <p className="text-muted small mb-0">
                This item pair achieved a calculated score of{' '}
                <strong>{match.matchScore} / 100</strong>. The backend algorithm assigns points
                based on category alignment, matching colors, geographic campus proximity, timestamp
                closeness, and description token overlap.
              </p>
            </div>

            <h3 className="fs-6 text-uppercase text-muted letter-spacing-1 mb-3">
              Connected Reports
            </h3>
            <div className="d-flex flex-column gap-3 mb-4">
              <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                <div>
                  <div className="text-muted small">Reported Found Item</div>
                  <strong>Item Reference #{match.foundItemId}</strong>
                </div>
                <button
                  type="button"
                  className="button secondary small"
                  onClick={() => navigate(`/found/${match.foundItemId}`)}
                >
                  <i className="bi bi-box-seam" /> View Found Item
                </button>
              </div>

              <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                <div>
                  <div className="text-muted small">Reported Lost Item</div>
                  <strong>Item Reference #{match.lostItemId}</strong>
                </div>
                <button
                  type="button"
                  className="button secondary small"
                  onClick={() => navigate(`/lost`)}
                >
                  <i className="bi bi-search" /> View Lost Report
                </button>
              </div>
            </div>

            <div className="fmc-actions-bar">
              {match.matchStatus !== 'RESOLVED' && (
                <button
                  type="button"
                  className="button primary"
                  onClick={() =>
                    navigate(
                      `/claims/new?lostItemId=${match.lostItemId}&foundItemId=${match.foundItemId}`
                    )
                  }
                >
                  <i className="bi bi-shield-check" /> Submit Claim For This Match
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-5">
          <MatchExplanationBanner />
        </div>
      </div>
    </section>
  )
}
