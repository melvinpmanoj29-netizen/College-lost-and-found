export type MatchStatus = 'POSSIBLE' | 'REVIEWED' | 'CLAIMED' | 'RESOLVED'

export interface Match {
  id: number
  lostItemId: number
  foundItemId: number
  matchScore: number
  matchStatus: MatchStatus
  createdAt: string
}
