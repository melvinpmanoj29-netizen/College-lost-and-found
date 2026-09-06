interface MatchScoreBadgeProps {
  score: number
  showMeter?: boolean
}

export default function MatchScoreBadge({ score, showMeter = true }: MatchScoreBadgeProps) {
  // Determine score class based on points
  let scoreClass = 'high'
  if (score < 50) {
    scoreClass = 'low'
  } else if (score < 75) {
    scoreClass = 'medium'
  }

  const roundedScore = Math.round(score * 10) / 10

  return (
    <div>
      <div className={`fmc-score-badge ${scoreClass}`} title={`Calculated match score: ${roundedScore} out of 100`}>
        <i className="bi bi-stars" />
        <span>{roundedScore}% match</span>
      </div>

      {showMeter && (
        <div className="fmc-meter" role="progressbar" aria-valuenow={roundedScore} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`fmc-meter-fill ${scoreClass}`}
            style={{ width: `${Math.min(100, Math.max(0, roundedScore))}%` }}
          />
        </div>
      )}
    </div>
  )
}
