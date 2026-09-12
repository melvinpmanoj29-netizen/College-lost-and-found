import api from './api'
import type { CreateLostItemRequest, ImageUploadResponse, LostItem, UpdateLostItemRequest } from '../types/lostItem'

export async function getAllLostItems(): Promise<LostItem[]> {
  const response = await api.get<LostItem[]>('/lost-items')
  return response.data
}

export async function getLostItemById(id: number): Promise<LostItem> {
  const response = await api.get<LostItem>(`/lost-items/${id}`)
  return response.data
}

export async function createLostItem(payload: CreateLostItemRequest): Promise<LostItem> {
  const response = await api.post<LostItem>('/lost-items', payload)
  return response.data
}

export async function updateLostItem(id: number, payload: UpdateLostItemRequest): Promise<LostItem> {
  const response = await api.put<LostItem>(`/lost-items/${id}`, payload)
  return response.data
}

export async function deleteLostItem(id: number): Promise<void> {
  await api.delete(`/lost-items/${id}`)
}

export async function getMyLostItems(): Promise<LostItem[]> {
  const response = await api.get<LostItem[]>('/lost-items/my')
  return response.data
}

export async function uploadLostItemImage(file: File): Promise<ImageUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post<ImageUploadResponse>('/lost-items/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

