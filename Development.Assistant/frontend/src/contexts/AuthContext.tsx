import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useLogin } from '@/hooks/queries/useAuth'

interface User {
  username: string
  login: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loginMutation: ReturnType<typeof useLogin>
  logout: () => void
  syncAuthFromStorage: () => void
  updateStoredUser: (nextUser: User) => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loginMutation = useLogin()

  const syncAuthFromStorage = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('user')
        setUser(null)
        setToken(null)
      }
    } else {
      setUser(null)
      setToken(null)
    }
  }

  useEffect(() => {
    syncAuthFromStorage()
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (loginMutation.isSuccess) {
      syncAuthFromStorage()
    }
  }, [loginMutation.isSuccess])

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const updateStoredUser = (nextUser: User) => {
    setUser(nextUser)
    localStorage.setItem('user', JSON.stringify(nextUser))
  }

  const value = {
    user,
    token,
    loginMutation,
    logout,
    syncAuthFromStorage,
    updateStoredUser,
    isAuthenticated: !!token,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
