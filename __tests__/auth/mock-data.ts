/**
 * Mock Data for Authentication Tests
 * Contains test users, responses, and payloads for all authentication scenarios
 */

import { User } from '@/types/auth'

// Test user credentials by role
export const TEST_CREDENTIALS = {
  superAdmin: {
    email: 'sundaydev4@gmail.com',
    password: 'Pa$$word',
    role: 'super_admin' as const,
  },
  landlord: {
    email: 'landlord1@pms.com',
    password: 'Landlord123!',
    role: 'landlord' as const,
  },
  caretaker: {
    email: 'caretaker1@pms.com',
    password: 'Caretaker123!',
    role: 'caretaker' as const,
  },
  tenant: {
    email: 'tenant1@pms.com',
    password: 'Tenant123!',
    role: 'tenant' as const,
  },
  newLandlord: {
    email: 'newlandlord@test.com',
    password: 'Test123!@#',
    name: 'New Landlord',
    phone: '+1234567890',
    role: 'landlord' as const,
  },
}

// Mock user objects
export const MOCK_USERS: Record<string, User> = {
  superAdmin: {
    id: 'super-admin-uuid',
    name: 'Super Administrator',
    email: TEST_CREDENTIALS.superAdmin.email,
    role: 'super_admin',
    phone: '+233000000000',
    address: 'System Administration Office',
    bio: 'System Super Administrator',
    email_verified_at: '2025-12-30T22:53:47.000000Z',
    profile_picture: null,
    created_at: '2025-12-30T22:53:47.000000Z',
    updated_at: '2025-12-30T22:53:47.000000Z',
  },
  landlord: {
    id: 'landlord-uuid-1',
    name: 'John Landlord',
    email: TEST_CREDENTIALS.landlord.email,
    role: 'landlord',
    phone: '+233555123456',
    address: 'Accra, Ghana',
    bio: 'Property owner',
    email_verified_at: '2025-01-01T00:00:00.000000Z',
    profile_picture: null,
    created_at: '2025-01-01T00:00:00.000000Z',
    updated_at: '2025-01-01T00:00:00.000000Z',
  },
  caretaker: {
    id: 'caretaker-uuid-1',
    name: 'Sarah Caretaker',
    email: TEST_CREDENTIALS.caretaker.email,
    role: 'caretaker',
    phone: '+233555987654',
    address: 'Kumasi, Ghana',
    bio: 'Property caretaker',
    email_verified_at: '2025-01-01T00:00:00.000000Z',
    profile_picture: null,
    created_at: '2025-01-01T00:00:00.000000Z',
    updated_at: '2025-01-01T00:00:00.000000Z',
  },
  tenant: {
    id: 'tenant-uuid-1',
    name: 'Mike Tenant',
    email: TEST_CREDENTIALS.tenant.email,
    role: 'tenant',
    phone: '+233555456789',
    address: 'Tema, Ghana',
    bio: 'Property tenant',
    email_verified_at: '2025-01-01T00:00:00.000000Z',
    profile_picture: null,
    created_at: '2025-01-01T00:00:00.000000Z',
    updated_at: '2025-01-01T00:00:00.000000Z',
  },
  unverified: {
    id: 'unverified-uuid',
    name: 'Unverified User',
    email: 'unverified@test.com',
    role: 'landlord',
    phone: '+233555111222',
    address: 'Accra, Ghana',
    bio: 'Unverified landlord',
    email_verified_at: null,
    profile_picture: null,
    created_at: '2025-01-01T00:00:00.000000Z',
    updated_at: '2025-01-01T00:00:00.000000Z',
  },
}

// Mock API responses
export const MOCK_RESPONSES = {
  // Registration success
  registerSuccess: {
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
    data: {
      user: {
        ...MOCK_USERS.landlord,
        email_verified_at: null,
      },
    },
  },

  // Registration with existing email
  registerEmailExists: {
    success: false,
    message: 'The email has already been taken.',
    errors: {
      email: ['The email has already been taken.'],
    },
  },

  // Login success responses for each role
  loginSuccess: (role: keyof typeof MOCK_USERS) => ({
    success: true,
    message: 'Login successful',
    data: {
      user: MOCK_USERS[role],
      token: `mock-token-${role}-${Date.now()}`,
      requires_password_change: false,
    },
  }),

  // Login with unverified email
  loginUnverified: {
    success: false,
    message: 'Email not verified',
    errors: {
      email: ['Please verify your email address before logging in.'],
    },
  },

  // Login with invalid credentials
  loginInvalidCredentials: {
    success: false,
    message: 'Invalid credentials',
    errors: {
      email: ['The provided credentials are incorrect.'],
    },
  },

  // Email verification success
  verifyEmailSuccess: {
    success: true,
    message: 'Email verified successfully. You can now login.',
  },

  // Email verification invalid/expired token
  verifyEmailInvalid: {
    success: false,
    message: 'Invalid or expired verification token.',
  },

  // Forgot password - email sent
  forgotPasswordSuccess: {
    success: true,
    message: 'Password reset link has been sent to your email.',
  },

  // Forgot password - email not found
  forgotPasswordNotFound: {
    success: false,
    message: 'We could not find a user with that email address.',
    errors: {
      email: ['User not found.'],
    },
  },

  // Reset password success
  resetPasswordSuccess: {
    success: true,
    message: 'Password has been reset successfully. You can now login with your new password.',
  },

  // Reset password invalid token
  resetPasswordInvalidToken: {
    success: false,
    message: 'Invalid or expired reset token.',
  },

  // Logout success
  logoutSuccess: {
    success: true,
    message: 'Logged out successfully',
  },
}

// Test tokens
export const MOCK_TOKENS = {
  valid: 'mock-valid-token-12345',
  expired: 'mock-expired-token-67890',
  invalid: 'mock-invalid-token-00000',
  verification: 'mock-verification-token-abcde',
  resetPassword: 'mock-reset-password-token-fghij',
}

// Error messages
export const ERROR_MESSAGES = {
  invalidEmail: 'Please enter a valid email address',
  invalidPassword: 'Password must be at least 8 characters',
  passwordMismatch: 'Passwords do not match',
  requiredField: 'This field is required',
  networkError: 'Network error. Please check your connection.',
  serverError: 'Server error. Please try again later.',
}

export default {
  TEST_CREDENTIALS,
  MOCK_USERS,
  MOCK_RESPONSES,
  MOCK_TOKENS,
  ERROR_MESSAGES,
}

