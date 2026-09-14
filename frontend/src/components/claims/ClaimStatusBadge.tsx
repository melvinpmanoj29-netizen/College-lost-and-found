import type { ClaimStatus } from '../../types/claim'

interface ClaimStatusBadgeProps {
  status: ClaimStatus
}

export default function ClaimStatusBadge({ status }: ClaimStatusBadgeProps) {
  let icon = 'bi-hourglass-split'
  if (status === 'APPROVED') icon = 'bi-check-circle-fill'
  if (status === 'REJECTED') icon = 'bi-x-circle-fill'

  return (
    <span className={`fmc-badge ${status.toLowerCase()}`}>
      <i className={`bi ${icon}`} />
      {status}
    </span>
  )
}
