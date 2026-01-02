/**
 * Authentication Types
 * Type definitions for authentication-related data structures
 */

export type UserRole = 'super_admin' | 'landlord' | 'caretaker' | 'tenant'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone: string | null
  address: string | null
  bio: string | null
  email_verified_at: string | null
  profile_picture: string | null
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: User
    token: string
    requires_password_change?: boolean
  }
  errors?: Record<string, string[]>
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone: string
  address?: string
  bio?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export interface VerifyEmailData {
  token: string
  email: string
}

