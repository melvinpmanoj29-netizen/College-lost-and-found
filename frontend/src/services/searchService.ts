import api from './api'
import type { SearchFilterParams, SearchResponse } from '../types/search'

export async function searchItems(params: SearchFilterParams = {}): Promise<SearchResponse> {
  const queryParams: Record<string, string | boolean> = {}
  if (params.q?.trim()) queryParams.q = params.q.trim()
  if (params.category?.trim() && params.category !== 'ALL') queryParams.category = params.category.trim()
  if (params.location?.trim() && params.location !== 'ALL') queryParams.location = params.location.trim()
  if (params.date?.trim()) queryParams.date = params.date.trim()
  if (params.status?.trim() && params.status !== 'ALL') queryParams.status = params.status.trim()
  if (params.color?.trim() && params.color !== 'ALL') queryParams.color = params.color.trim()
  if (params.urgent !== undefined && params.urgent !== false) queryParams.urgent = params.urgent
  if (params.type?.trim() && params.type !== 'all') queryParams.type = params.type.trim()

  const response = await api.get<SearchResponse>('/search', { params: queryParams })
  return response.data
}
