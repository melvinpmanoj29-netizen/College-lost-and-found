export type LostItemStatus = 'LOST' | 'RETURNED' | 'ARCHIVED'

export interface LostItem {
  id: number
  userId: number
  itemName: string
  imageUrl: string | null
  description: string
  category: string
  color: string | null
  lostDateTime: string
  lastSeenLocation: string
  latitude: number | null
  longitude: number | null
  status: LostItemStatus | string
  isUrgent: boolean
  expiryDate: string | null
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateLostItemRequest {
  itemName: string
  imageUrl?: string | null
  description: string
  category: string
  color?: string | null
  lostDateTime: string
  lastSeenLocation: string
  isUrgent?: boolean
  expiryDate?: string | null
  latitude?: number | null
  longitude?: number | null
}

export interface UpdateLostItemRequest {
  itemName: string
  imageUrl?: string | null
  description: string
  category: string
  color?: string | null
  lostDateTime: string
  lastSeenLocation: string
  isUrgent?: boolean
  expiryDate?: string | null
  latitude?: number | null
  longitude?: number | null
}
