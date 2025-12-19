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
  refreshUser: () => Promise<void>
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
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      const response = await AuthService.login(emailOrPhone, password)
      const { user, token } = response
      
      // Set cookies for middleware (in addition to localStorage)
      if (typeof document !== "undefined") {
        document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      }
      
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
      return { user }
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const register = async (data: {
    name: string
    email: string
    phone: string
    password: string
    address?: string
    role: "landlord" | "tenant"
  }) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      const response = await AuthService.register(data)
      const { user, token } = response
      
      // Set cookies for middleware (in addition to localStorage)
      if (typeof document !== "undefined") {
        document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      }
      
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
      // Call logout API (this will clear localStorage via authService)
      await AuthService.logout()
    } catch (error) {
      // Even if API call fails, we still want to clear client-side data
      console.error("Logout API call failed, but clearing local auth:", error)
    } finally {
      // Always clear cookies and state, even if API fails
      if (typeof document !== "undefined") {
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        document.cookie = "auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      }
      
      // Clear state
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
      
      // Force redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
  }

  const forgotPassword = async (email: string) => {
    await AuthService.forgotPassword(email)
  }

  const refreshUser = async () => {
    try {
      const user = await AuthService.verifyToken()
      if (user) {
        setAuthState((prev) => ({
          ...prev,
          user,
        }))
        
        // Update cookie with fresh user data
        if (typeof document !== "undefined") {
          document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        }
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error)
    }
  }

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    socialAuth,
    logout,
    forgotPassword,
    refreshUser,
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
