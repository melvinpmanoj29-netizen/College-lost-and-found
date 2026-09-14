import api from './api'
import type { Match } from '../types/match'

export const matchService = {
  /**
   * Fetch possible matches for a lost item.
   * GET /api/matches/lost/{lostItemId}
   */
  async getMatchesForLostItem(lostItemId: number): Promise<Match[]> {
    const { data } = await api.get<Match[]>(`/matches/lost/${lostItemId}`)
    return data
  },

  /**
   * Fetch possible matches for a found item.
   * GET /api/matches/found/{foundItemId}
   */
  async getMatchesForFoundItem(foundItemId: number): Promise<Match[]> {
    const { data } = await api.get<Match[]>(`/matches/found/${foundItemId}`)
    return data
  },

  /**
   * Fetch specific match details by match ID.
   * GET /api/matches/{id}
   */
  async getById(id: number): Promise<Match> {
    const { data } = await api.get<Match>(`/matches/${id}`)
    return data
  },
}

export default matchService
