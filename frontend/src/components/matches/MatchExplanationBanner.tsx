export default function MatchExplanationBanner() {
  return (
    <div className="fmc-match-banner" role="region" aria-label="Smart match explanation">
      <div className="d-flex align-items-center gap-2 mb-1">
        <i className="bi bi-cpu-fill text-primary fs-5" />
        <h3>Institutional Rule-Based Smart Matching</h3>
      </div>
      <p>
        Matches are calculated deterministically by the backend using campus criteria weights (100 total points). No external AI or opaque machine learning models are used:
      </p>
      <div className="fmc-criteria-pills">
        <span className="fmc-criteria-pill">
          Category: <strong>30 pts</strong>
        </span>
        <span className="fmc-criteria-pill">
          Color: <strong>20 pts</strong>
        </span>
        <span className="fmc-criteria-pill">
          Location: <strong>20 pts</strong>
        </span>
        <span className="fmc-criteria-pill">
          Description keywords: <strong>20 pts</strong>
        </span>
        <span className="fmc-criteria-pill">
          Date proximity: <strong>10 pts</strong>
        </span>
      </div>
    </div>
  )
}
