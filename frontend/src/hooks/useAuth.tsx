import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser, login, logout, signup } from '../api'
import type { ApiError, LoginPayload, SignupPayload, User } from '../types'
import type { ReactNode } from 'react'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  signIn: (payload: LoginPayload) => Promise<User | null>
  signUp: (payload: SignupPayload) => Promise<User | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    getCurrentUser()
      .then((data) => {
        if (!isActive) return
        setUser(data?.user || null)
      })
      .catch((error: ApiError) => {
        if (!isActive) return
        if (error?.status !== 401) {
          console.error('Failed to load session', error)
        }
        setUser(null)
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      isLoading,
      signIn: async (payload) => {
        const data = await login(payload)
        setUser(data?.user || null)
        return data?.user || null
      },
      signUp: async (payload) => {
        const data = await signup(payload)
        setUser(data?.user || null)
        return data?.user || null
      },
      signOut: async () => {
        try {
          await logout()
        } finally {
          setUser(null)
        }
      }
    }
  }, [user, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
