export type NotificationType =
  | 'MATCH_FOUND'
  | 'SIMILAR_ITEM_REPORTED'
  | 'ITEM_FOUND'
  | 'CLAIM_APPROVED'
  | 'CLAIM_REJECTED'
  | 'ITEM_RETURNED'

export interface NotificationItem {
  id: number
  userId: number
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}
