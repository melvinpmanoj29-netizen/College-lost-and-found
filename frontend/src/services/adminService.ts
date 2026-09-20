import api from './api'
import type {
  AdminClaimReview,
  AdminClaimSummary,
  AdminFoundItem,
  AdminItemHistoryDetail,
  AdminLostItem,
  DashboardStats,
  ReturnHistoryStats,
} from '../types/admin'

export async function getAdminDashboard(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>('/admin/dashboard')
  return response.data
}

export async function getReturnHistory(): Promise<ReturnHistoryStats> {
  const response = await api.get<ReturnHistoryStats>('/admin/return-history')
  return response.data
}

export async function getAdminHistory(): Promise<AdminItemHistoryDetail[]> {
  const response = await api.get<AdminItemHistoryDetail[]>('/admin/history')
  return response.data
}

export async function getAdminHistoryDetail(claimId: number): Promise<AdminItemHistoryDetail> {
  const response = await api.get<AdminItemHistoryDetail>(`/admin/history/${claimId}`)
  return response.data
}

export async function getAdminLostItems(): Promise<AdminLostItem[]> {
  const response = await api.get<AdminLostItem[]>('/admin/lost-items')
  return response.data
}

export async function deleteAdminLostItem(id: number): Promise<void> {
  await api.delete(`/admin/lost-items/${id}`)
}

export async function getAdminFoundItems(): Promise<AdminFoundItem[]> {
  const response = await api.get<AdminFoundItem[]>('/admin/found-items')
  return response.data
}

export async function deleteAdminFoundItem(id: number): Promise<void> {
  await api.delete(`/admin/found-items/${id}`)
}

export async function getAdminClaims(): Promise<AdminClaimSummary[]> {
  const response = await api.get<AdminClaimSummary[]>('/admin/claims')
  return response.data
}

export async function getAdminClaimDetail(id: number): Promise<AdminClaimReview> {
  const response = await api.get<AdminClaimReview>(`/admin/claims/${id}`)
  return response.data
}

export async function approveClaim(id: number): Promise<AdminClaimSummary> {
  const response = await api.put<AdminClaimSummary>(`/admin/claims/${id}/approve`)
  return response.data
}

export async function rejectClaim(id: number): Promise<AdminClaimSummary> {
  const response = await api.put<AdminClaimSummary>(`/admin/claims/${id}/reject`)
  return response.data
}
