import api from './api'
import type { CreateFoundItemRequest, FoundItem, UpdateFoundItemRequest } from '../types/foundItem'

export const foundItemService = {
  /**
   * Fetch all found items.
   * GET /api/found-items
   */
  async getAll(): Promise<FoundItem[]> {
    const { data } = await api.get<FoundItem[]>('/found-items')
    return data
  },

  /**
   * Fetch a single found item by ID.
   * GET /api/found-items/{id}
   */
  async getById(id: number): Promise<FoundItem> {
    const { data } = await api.get<FoundItem>(`/found-items/${id}`)
    return data
  },

  /**
   * Fetch found items reported by the current authenticated student.
   * GET /api/found-items/my
   */
  async getMy(): Promise<FoundItem[]> {
    const { data } = await api.get<FoundItem[]>('/found-items/my')
    return data
  },

  /**
   * Report a newly found item.
   * POST /api/found-items
   * Note: userId is populated by the backend from JWT.
   */
  async create(payload: CreateFoundItemRequest): Promise<FoundItem> {
    const { data } = await api.post<FoundItem>('/found-items', payload)
    return data
  },

  /**
   * Update an existing found item report.
   * PUT /api/found-items/{id}
   */
  async update(id: number, payload: UpdateFoundItemRequest): Promise<FoundItem> {
    const { data } = await api.put<FoundItem>(`/found-items/${id}`, payload)
    return data
  },

  /**
   * Delete a found item report.
   * DELETE /api/found-items/{id}
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/found-items/${id}`)
  },
}

export default foundItemService
