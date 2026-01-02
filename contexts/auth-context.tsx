"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
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
  verifyEmail: (token: string, email: string) => Promise<void>
  resendVerificationEmail: (email: string) => Promise<void>
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
        // Only set as authenticated if user exists AND is verified
        const isAuthenticated = !!(user && user.isVerified === true)
        
        // Update cookies with fresh user data
        if (user && typeof document !== "undefined") {
          const token = AuthService.getToken()
          if (token) {
            document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
          }
          document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        }
        
        setAuthState({
          user: user || null,
          isLoading: false,
          isAuthenticated,
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
      
      // Normalize verification status - check both camelCase and snake_case
      const isVerified = user.isVerified === true || 
                        user.is_verified === true || 
                        (user.email_verified_at !== null && user.email_verified_at !== undefined)
      
      // If user appears unverified, refresh user data from backend to get latest status
      // This handles the case where user just verified their email
      // NOTE: Only refresh if user is explicitly unverified (not if verification status is unclear)
      let finalUser = user
      const explicitlyUnverified = user.isVerified === false || 
                                   (user.is_verified === false && !user.email_verified_at)
      
      if (explicitlyUnverified && token) {
        try {
          console.log("🔄 User appears unverified after login, refreshing user data...")
          const refreshedUser = await AuthService.verifyToken()
          if (refreshedUser) {
            finalUser = refreshedUser
            const refreshedIsVerified = refreshedUser.isVerified === true || 
                                       refreshedUser.is_verified === true || 
                                       (refreshedUser.email_verified_at !== null && refreshedUser.email_verified_at !== undefined)
            
            if (refreshedIsVerified) {
              console.log("✅ User is actually verified! Updating state...")
              // Update cookies with refreshed user data
              if (typeof document !== "undefined") {
                document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
                document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(finalUser))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
              }
              
              setAuthState({
                user: finalUser,
                isLoading: false,
                isAuthenticated: true,
              })
              return { user: finalUser }
            }
          }
        } catch (refreshError) {
          console.error("Failed to refresh user data after login:", refreshError)
          // Continue with original user data if refresh fails
        }
      }
      
      // Only authenticate if user is verified
      const isAuthenticated = isVerified
      
      // Set cookies for middleware (in addition to localStorage)
      if (typeof document !== "undefined") {
        document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(finalUser))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      }
      
      setAuthState({
        user: finalUser,
        isLoading: false,
        isAuthenticated,
      })
      return { user: finalUser }
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

      // Only authenticate immediately if user is verified
      if (user?.isVerified) {
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
      } else {
        // User needs email verification - don't authenticate yet
        setAuthState((prev) => ({ ...prev, isLoading: false }))
      }

      return { user, token } // Return the response so caller can check verification status
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

  const refreshUser = useCallback(async () => {
    try {
      const user = await AuthService.verifyToken()
      if (user) {
        // Only update state if user data actually changed
        setAuthState((prev) => {
          // Check if user data actually changed to prevent unnecessary re-renders
          const userChanged = 
            prev.user?.id !== user.id ||
            prev.user?.isVerified !== user.isVerified ||
            prev.user?.is_verified !== user.is_verified ||
            prev.user?.email_verified_at !== user.email_verified_at
          
          if (!userChanged && prev.user) {
            return prev // No change, return previous state
          }
          
          return {
            ...prev,
            user,
          }
        })

        // Update cookie with fresh user data
        if (typeof document !== "undefined") {
          document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        }
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error)
    }
  }, []) // Empty deps - function doesn't depend on any props or state

  const verifyEmail = async (token: string, email: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      const response = await AuthService.verifyEmail({ token, email })

      if (response.success) {
        // Refresh user data to get updated verification status
        const user = await AuthService.verifyToken()
        if (user) {
          const isAuthenticated = user.isVerified === true
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated,
          })

          // Update cookie with fresh user data
          if (typeof document !== "undefined") {
            const authToken = AuthService.getToken()
            if (authToken) {
              document.cookie = `auth_token=${authToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
            }
            document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
          }
        }
      }

      return response
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const resendVerificationEmail = async (email: string) => {
    await AuthService.resendVerificationEmail(email)
  }

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    socialAuth,
    logout,
    forgotPassword,
    refreshUser,
    verifyEmail,
    resendVerificationEmail,
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
