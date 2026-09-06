import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import api, { setUnauthorizedHandler, tokenStorage } from '../services/api'
import type { LoginResponse, RegisterRequest, UpdateProfileRequest, User } from '../types/auth'

interface AuthContextValue {
  user: User | null
  token: string | null
  /** True while the stored token is being validated against /api/users/me. */
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<User>
  register: (data: RegisterRequest) => Promise<void>
  updateProfile: (data: UpdateProfileRequest) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => tokenStorage.get())
  const [isLoading, setIsLoading] = useState<boolean>(() => tokenStorage.get() !== null)

  const clearAuth = useCallback(() => {
    tokenStorage.clear()
    setToken(null)
    setUser(null)
  }, [])

  // When any protected API call returns 401, drop the auth state; the route
  // guards then redirect to /login. The backend/JWT remains authoritative.
  useEffect(() => {
    setUnauthorizedHandler(clearAuth)
    return () => setUnauthorizedHandler(null)
  }, [clearAuth])

  // On app start, if a token exists, validate it against the backend.
  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      const stored = tokenStorage.get()
      if (!stored) {
        setIsLoading(false)
        return
      }
      try {
        const { data } = await api.get<User>('/users/me')
        if (!cancelled) setUser(data)
      } catch {
        if (!cancelled) clearAuth()
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    restoreSession()
    return () => {
      cancelled = true
    }
  }, [clearAuth])

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
    tokenStorage.set(data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (data: RegisterRequest): Promise<void> => {
    await api.post('/auth/register', data)
  }, [])

  const updateProfile = useCallback(async (data: UpdateProfileRequest): Promise<User> => {
    const { data: updated } = await api.put<User>('/users/me', data)
    setUser(updated)
    return updated
  }, [])

  const logout = useCallback(() => {
    clearAuth()
  }, [clearAuth])

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    updateProfile,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}