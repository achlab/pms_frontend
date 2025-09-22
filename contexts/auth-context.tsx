"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { AuthService, type AuthState } from "@/lib/auth"

interface AuthContextType extends AuthState {
  login: (emailOrPhone: string, password: string) => Promise<void>
  register: (data: {
    name: string
    email: string
    phone: string
    password: string
    role: "landlord" | "tenant"
  }) => Promise<void>
  socialAuth: (provider: "google" | "facebook", role?: "landlord" | "tenant") => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await AuthService.verifyToken()
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: !!user,
        })
      } catch (error) {
        console.error("Auth initialization error:", error)
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    initAuth()
  }, [])

  const login = async (emailOrPhone: string, password: string) => {
    console.log("Auth Context - Login attempt:", { emailOrPhone })
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      const { user } = await AuthService.login(emailOrPhone, password)
      console.log("Auth Context - Login successful, user:", user)
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
      return { user }
    } catch (error) {
      console.error("Auth Context - Login failed:", error)
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const register = async (data: {
    name: string
    email: string
    phone: string
    password: string
    role: "landlord" | "tenant"
  }) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      const { user } = await AuthService.register(data)
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const socialAuth = async (provider: "google" | "facebook", role?: "landlord" | "tenant") => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      const { user } = await AuthService.socialAuth(provider, role)
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const logout = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      await AuthService.logout()
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const forgotPassword = async (email: string) => {
    await AuthService.forgotPassword(email)
  }

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    socialAuth,
    logout,
    forgotPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
