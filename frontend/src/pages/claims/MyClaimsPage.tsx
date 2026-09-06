import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import claimService from '../../services/claimService'
import { getErrorMessage } from '../../services/api'
import type { Claim } from '../../types/claim'
import ClaimCard from '../../components/claims/ClaimCard'

export default function MyClaimsPage() {
  const navigate = useNavigate()
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadClaims() {
      setLoading(true)
      setError(null)
      try {
        const data = await claimService.getMyClaims()
        if (!cancelled) {
          // Sort newest first
          const sorted = [...data].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          setClaims(sorted)
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadClaims()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="fmc-page page-width">
      <div className="fmc-header">
        <div>
          <span className="section-kicker">STUDENT CLAIMS</span>
          <h1>My Submitted Claims</h1>
          <p>
            Track ownership claims you have submitted for items found on campus. Campus administrators
            review claims to verify ownership before release.
          </p>
        </div>
        <div className="fmc-header-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => navigate('/found')}
          >
            <i className="bi bi-search" /> Browse Found Items
          </button>
          <button
            type="button"
            className="button primary"
            onClick={() => navigate('/claims/new')}
          >
            <i className="bi bi-plus-lg" /> New Claim
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="full-page-loader" style={{ minHeight: '300px' }}>
          <div className="loader-box">
            <span className="loader-spinner" aria-hidden="true" />
            <span>Retrieving your claim records...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="alert-banner" role="alert">
          <i className="bi bi-exclamation-triangle" />
          <div className="flex-grow-1">
            <strong>Unable to load your claims</strong>
            <p className="mb-2">{error}</p>
            <button
              type="button"
              className="button secondary small"
              onClick={() => window.location.reload()}
            >
              <i className="bi bi-arrow-clockwise" /> Try again
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && claims.length === 0 && (
        <div className="fmc-empty-state">
          <div className="fmc-empty-icon">
            <i className="bi bi-shield-check" />
          </div>
          <h3>No claims submitted</h3>
          <p>
            You have not submitted any ownership claims yet. If you see an item in the found items
            directory that belongs to you, submit a verification claim to begin the return process.
          </p>
          <button
            type="button"
            className="button primary"
            onClick={() => navigate('/found')}
          >
            <i className="bi bi-box-seam" /> Browse Found Items
          </button>
        </div>
      )}

      {/* Claims grid */}
      {!loading && !error && claims.length > 0 && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted small">
              Showing <strong>{claims.length}</strong> claim{claims.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="fmc-card-grid">
            {claims.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
