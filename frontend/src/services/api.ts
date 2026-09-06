import axios, { type AxiosError } from 'axios'
import type { ApiError } from '../types/auth'

const TOKEN_KEY = 'auth_token'

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
}

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
})

// Attach the JWT to every request: Authorization: Bearer <token>
api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// A 401 on a protected endpoint means the token is missing/expired/invalid.
// Clear the auth state so the route guards redirect to the login page.
// Login/register requests are excluded - their pages handle errors themselves.
let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

function isAuthEndpoint(url?: string): boolean {
  return url?.includes('/auth/') ?? false
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !isAuthEndpoint(error.config?.url)) {
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)

/** Extract a human-readable message from an API error. */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined
    if (data?.message) return data.message
    if (error.response?.status === 401) return 'Invalid email or password'
    if (error.code === 'ERR_NETWORK') return 'Cannot reach the server. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}

export default api