import api from './api'
import type { Claim, CreateClaimRequest } from '../types/claim'

export const claimService = {
  /**
   * Submit a claim for a found item.
   * POST /api/claims
   *
   * Note: claimantUserId is derived on the backend from the JWT.
   * verificationAnswer is transmitted over TLS/HTTPS and never stored locally.
   */
  async create(payload: CreateClaimRequest): Promise<Claim> {
    const { data } = await api.post<Claim>('/claims', payload)
    return data
  },

  /**
   * Fetch all claims submitted by the current authenticated student.
   * GET /api/claims/my
   */
  async getMyClaims(): Promise<Claim[]> {
    const { data } = await api.get<Claim[]>('/claims/my')
    return data
  },

  /**
   * Fetch specific claim by ID.
   * GET /api/claims/{id}
   */
  async getById(id: number): Promise<Claim> {
    const { data } = await api.get<Claim>(`/claims/${id}`)
    return data
  },
}

export default claimService
