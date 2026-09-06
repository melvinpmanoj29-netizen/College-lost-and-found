export type Role = 'STUDENT' | 'ADMIN'

export interface User {
  id: number
  studentName: string
  rollNumber: string
  className: string
  email: string
  profileImageUrl: string | null
  role: Role
}

export interface RegisterRequest {
  studentName: string
  rollNumber: string
  className: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface UpdateProfileRequest {
  studentName: string
  className: string
  profileImageUrl: string | null
}

/** Standard backend error shape: { status, message, timestamp } */
export interface ApiError {
  status: number
  message: string
  timestamp: string
}