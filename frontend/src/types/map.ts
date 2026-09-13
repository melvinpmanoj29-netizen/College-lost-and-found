export interface MapItem {
  id: number
  type: 'LOST' | 'FOUND'
  itemName: string
  location: string
  latitude: number
  longitude: number
  isUrgent: boolean
}
