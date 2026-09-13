export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/**
 * Student-facing Claim model.
 *
 * CRITICAL PRIVACY RULE:
 * verificationAnswer is NEVER returned by the backend or included here.
 */
export interface Claim {
  id: number
  lostItemId: number
  foundItemId: number
  status: ClaimStatus
  createdAt: string
}

export interface CreateClaimRequest {
  lostItemId: number
  foundItemId: number
  verificationAnswer: string
}
