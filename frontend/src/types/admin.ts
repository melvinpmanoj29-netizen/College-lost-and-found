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

export interface UserSummary {
  id: number
  name: string
  email: string
  rollNumber: string
  className: string
  role: string
}

export interface LostReportDetail {
  id: number
  itemName: string
  description: string
  category: string
  color?: string
  location: string
  lostDateTime: string
  imageUrl?: string | null
  status: string
  createdAt: string
}

export interface FoundReportDetail {
  id: number
  itemName: string
  description: string
  category: string
  color?: string
  location: string
  foundDateTime: string
  imageUrl?: string | null
  status: string
  createdAt: string
}

export interface ClaimDetail {
  id: number
  verificationAnswer: string
  status: string
  createdAt: string
  reviewedAt?: string | null
}

export interface TimelineEvent {
  title: string
  description: string
  timestamp: string
  actorName: string
  actorRole: string
  type: string
}

export interface AdminItemHistoryDetail {
  claimId: number
  itemName: string
  category: string
  status: string
  resolvedAt: string
  claimant?: UserSummary
  lostReporter?: UserSummary
  foundReporter?: UserSummary
  reviewer?: UserSummary
  lostReport?: LostReportDetail
  foundReport?: FoundReportDetail
  claimDetail?: ClaimDetail
  timeline: TimelineEvent[]
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
