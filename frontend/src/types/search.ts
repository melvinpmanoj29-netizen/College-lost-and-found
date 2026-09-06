export interface SearchLostItem {
  id: number
  itemName: string
  description?: string
  category?: string
  color?: string
  lastSeenLocation?: string
  status?: string
  isUrgent?: boolean
  lostDateTime?: string
  imageUrl?: string
  userId?: number
}

export interface SearchFoundItem {
  id: number
  itemName: string
  description?: string
  category?: string
  color?: string
  foundLocation?: string
  status?: string
  isUrgent?: boolean
  foundDateTime?: string
  imageUrl?: string
  userId?: number
}

export interface SearchResponse {
  lostItems: SearchLostItem[]
  foundItems: SearchFoundItem[]
}

export interface SearchFilterParams {
  q?: string
  category?: string
  location?: string
  date?: string
  status?: string
  color?: string
  urgent?: boolean
  type?: string
}
