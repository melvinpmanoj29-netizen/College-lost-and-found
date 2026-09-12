export interface LocationStat {
  location: string
  count: number
}

export interface DashboardStats {
  totalLostItems: number
  totalFoundItems: number
  itemsReturned: number
  pendingClaims: number
  mostCommonLocations: LocationStat[]
}

export interface ReturnHistoryStats {
  bagsReturned: number
  phonesReturned: number
  idCardsReturned: number
  walletsReturned: number
  keysReturned: number
  docsReturned: number
  othersReturned: number
}

export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface AdminClaimSummary {
  id: number
  lostItemId: number
  foundItemId: number
  claimantUserId: number
  status: ClaimStatus
  createdAt: string
}

export interface AdminClaimReview extends AdminClaimSummary {
  verificationAnswer: string
  reviewedAt: string | null
  reviewedBy: number | null
}

export interface AdminLostItem {
  id: number
  userId?: number
  itemName: string
  imageUrl?: string | null
  description?: string
  category: string
  color?: string
  lostDateTime?: string
  lastSeenLocation: string
  status: string
  isUrgent?: boolean
  expiryDate?: string
  isArchived?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AdminFoundItem {
  id: number
  userId?: number
  itemName: string
  imageUrl?: string | null
  description?: string
  category: string
  color?: string
  foundDateTime?: string
  foundLocation: string
  status: string
  createdAt?: string
  updatedAt?: string
}
