import api from './api'
import type { MapItem } from '../types/map'

export async function getMapItems(): Promise<MapItem[]> {
  const response = await api.get<MapItem[]>('/map/items')
  return response.data
}
