import api from './api'
import type { NotificationItem } from '../types/notification'

export async function getNotifications(): Promise<NotificationItem[]> {
  const response = await api.get<NotificationItem[]>('/notifications')
  return response.data
}

export async function getUnreadNotifications(): Promise<NotificationItem[]> {
  const response = await api.get<NotificationItem[]>('/notifications/unread')
  return response.data
}

export async function markNotificationAsRead(id: number): Promise<NotificationItem> {
  const response = await api.put<NotificationItem>(`/notifications/${id}/read`)
  return response.data
}
