export type FoundItemStatus = 'FOUND' | 'RETURNED'

export interface FoundItem {
  id: number
  userId: number
  itemName: string
  imageUrl: string | null
  description: string
  category: string
  color: string | null
  foundDateTime: string
  foundLocation: string
  status: FoundItemStatus
  createdAt: string
  updatedAt: string
}

export interface CreateFoundItemRequest {
  itemName: string
  imageUrl?: string | null
  description: string
  category: string
  color?: string | null
  foundDateTime: string
  foundLocation: string
}

export interface UpdateFoundItemRequest {
  itemName: string
  imageUrl?: string | null
  description: string
  category: string
  color?: string | null
  foundDateTime: string
  foundLocation: string
}
