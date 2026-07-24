import React, { createContext, useContext, useState } from 'react'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('autohub_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (user: User, token: string) => {
    setUser(user)
    localStorage.setItem('autohub_user', JSON.stringify(user))
    localStorage.setItem('autohub_token', token)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('autohub_user')
    localStorage.removeItem('autohub_token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!localStorage.getItem('autohub_token'),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
