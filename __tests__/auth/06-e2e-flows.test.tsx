/**
 * Authentication Tests - End-to-End Complete Flows
 * 
 * Tests cover complete authentication journeys:
 * - Full landlord registration to dashboard access
 * - Complete password recovery journey
 * - Multi-session handling
 * - Role-specific authentication flows
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { mockFetch, resetFetchMock, mockLocalStorage } from './test-setup'
import { 
  TEST_CREDENTIALS, 
  MOCK_RESPONSES,
  MOCK_TOKENS,
  MOCK_USERS 
} from './mock-data'
import { authService } from '@/lib/services/auth.service'

describe('Authentication - End-to-End Complete Flows', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    resetFetchMock()
  })

  afterEach(() => {
    resetFetchMock()
  })

  describe('Complete Landlord Journey', () => {
    it('should complete full landlord onboarding: register → verify → login → logout', async () => {
      const newLandlord = {
        name: 'New Property Owner',
        email: 'newowner@test.com',
        password: 'SecurePass123!',
        phone: '+233555123456',
      }

      // Step 1: Registration
      mockFetch(MOCK_RESPONSES.registerSuccess)
      const registerResult = await authService.register({
        ...newLandlord,
        password_confirmation: newLandlord.password,
      })

      expect(registerResult.success).toBe(true)
      expect(registerResult.data?.user.email_verified_at).toBeNull()

      // Step 2: Email Verification
      mockFetch(MOCK_RESPONSES.verifyEmailSuccess)
      const verifyResult = await authService.verifyEmail({
        token: MOCK_TOKENS.verification,
        email: newLandlord.email,
      })

      expect(verifyResult.success).toBe(true)

      // Step 3: First Login
      mockFetch(MOCK_RESPONSES.loginSuccess('landlord'))
      const loginResult = await authService.login({
        email: newLandlord.email,
        password: newLandlord.password,
      })

      expect(loginResult.success).toBe(true)
      expect(loginResult.data?.token).toBeDefined()
      expect(mockLocalStorage.getItem('auth_token')).toBeDefined()

      // Step 4: Access Protected Resource
      mockFetch({
        success: true,
        data: { user: MOCK_USERS.landlord },
      })
      const userResult = await authService.getCurrentUser()

      expect(userResult.data?.user).toBeDefined()
      expect(userResult.data?.user.role).toBe('landlord')

      // Step 5: Logout
      mockFetch(MOCK_RESPONSES.logoutSuccess)
      await authService.logout()

      expect(mockLocalStorage.getItem('auth_token')).toBeNull()
      expect(mockLocalStorage.getItem('user')).toBeNull()
    })

    it('should handle registration with existing email', async () => {
      // Attempt to register with existing email
      mockFetch(MOCK_RESPONSES.registerEmailExists, { ok: false, status: 422 })

      await expect(authService.register({
        name: 'Duplicate User',
        email: TEST_CREDENTIALS.landlord.email, // Existing email
        password: 'Password123!',
        password_confirmation: 'Password123!',
        phone: '+233555000000',
      })).rejects.toThrow()
    })
  })

  describe('Complete Password Recovery Journey', () => {
    it('should complete full password reset flow for any role', async () => {
      const roles: Array<'landlord' | 'caretaker' | 'tenant'> = ['landlord', 'caretaker', 'tenant']

      for (const role of roles) {
        mockLocalStorage.clear()
        
        const email = TEST_CREDENTIALS[role].email
        const newPassword = 'NewSecurePassword123!'

        // Step 1: Request password reset
        mockFetch(MOCK_RESPONSES.forgotPasswordSuccess)
        const forgotResult = await authService.forgotPassword({ email })

        expect(forgotResult.success).toBe(true)

        // Step 2: Reset password with token
        mockFetch(MOCK_RESPONSES.resetPasswordSuccess)
        const resetResult = await authService.resetPassword({
          token: MOCK_TOKENS.resetPassword,
          email,
          password: newPassword,
          password_confirmation: newPassword,
        })

        expect(resetResult.success).toBe(true)

        // Step 3: Login with new password
        mockFetch(MOCK_RESPONSES.loginSuccess(role))
        const loginResult = await authService.login({
          email,
          password: newPassword,
        })

        expect(loginResult.success).toBe(true)
        expect(loginResult.data?.token).toBeDefined()

        // Step 4: Verify can access protected resources
        mockFetch({
          success: true,
          data: { user: MOCK_USERS[role] },
        })
        const userResult = await authService.getCurrentUser()

        expect(userResult.data?.user.role).toBe(role)
      }
    })

    it('should prevent login with old password after reset', async () => {
      const email = TEST_CREDENTIALS.landlord.email
      const oldPassword = TEST_CREDENTIALS.landlord.password
      const newPassword = 'BrandNewPassword123!'

      // Step 1: Reset password
      mockFetch(MOCK_RESPONSES.forgotPasswordSuccess)
      await authService.forgotPassword({ email })

      mockFetch(MOCK_RESPONSES.resetPasswordSuccess)
      await authService.resetPassword({
        token: MOCK_TOKENS.resetPassword,
        email,
        password: newPassword,
        password_confirmation: newPassword,
      })

      // Step 2: Try to login with old password
      mockFetch(MOCK_RESPONSES.loginInvalidCredentials, { ok: false, status: 401 })
      await expect(authService.login({
        email,
        password: oldPassword, // Old password
      })).rejects.toThrow()

      // Step 3: Login with new password should work
      mockFetch(MOCK_RESPONSES.loginSuccess('landlord'))
      const loginResult = await authService.login({
        email,
        password: newPassword,
      })

      expect(loginResult.success).toBe(true)
    })
  })

  describe('Super Admin Complete Flow', () => {
    it('should complete super admin authentication flow', async () => {
      const credentials = {
        email: TEST_CREDENTIALS.superAdmin.email,
        password: TEST_CREDENTIALS.superAdmin.password,
      }

      // Step 1: Login (Super admin doesn't register)
      mockFetch(MOCK_RESPONSES.loginSuccess('superAdmin'))
      const loginResult = await authService.login(credentials)

      expect(loginResult.success).toBe(true)
      expect(loginResult.data?.user.role).toBe('super_admin')

      // Step 2: Access super admin features
      mockFetch({
        success: true,
        data: { user: MOCK_USERS.superAdmin },
      })
      const userResult = await authService.getCurrentUser()

      expect(userResult.data?.user.role).toBe('super_admin')

      // Step 3: Logout
      mockFetch(MOCK_RESPONSES.logoutSuccess)
      await authService.logout()

      expect(mockLocalStorage.getItem('auth_token')).toBeNull()
    })

    it('should allow super admin to reset password', async () => {
      const email = TEST_CREDENTIALS.superAdmin.email
      const newPassword = 'NewSuperAdminPass123!'

      // Step 1: Request password reset
      mockFetch(MOCK_RESPONSES.forgotPasswordSuccess)
      await authService.forgotPassword({ email })

      // Step 2: Reset password
      mockFetch(MOCK_RESPONSES.resetPasswordSuccess)
      await authService.resetPassword({
        token: MOCK_TOKENS.resetPassword,
        email,
        password: newPassword,
        password_confirmation: newPassword,
      })

      // Step 3: Login with new password
      mockFetch(MOCK_RESPONSES.loginSuccess('superAdmin'))
      const loginResult = await authService.login({
        email,
        password: newPassword,
      })

      expect(loginResult.success).toBe(true)
    })
  })

  describe('Caretaker & Tenant Authentication (Created by Landlord)', () => {
    it('should complete caretaker authentication flow', async () => {
      // Caretaker is created by landlord, so they just login
      const credentials = {
        email: TEST_CREDENTIALS.caretaker.email,
        password: TEST_CREDENTIALS.caretaker.password,
      }

      // Step 1: First time login
      mockFetch(MOCK_RESPONSES.loginSuccess('caretaker'))
      const loginResult = await authService.login(credentials)

      expect(loginResult.success).toBe(true)
      expect(loginResult.data?.user.role).toBe('caretaker')

      // Step 2: Verify caretaker can access their features
      mockFetch({
        success: true,
        data: { user: MOCK_USERS.caretaker },
      })
      const userResult = await authService.getCurrentUser()

      expect(userResult.data?.user.role).toBe('caretaker')

      // Step 3: Logout
      mockFetch(MOCK_RESPONSES.logoutSuccess)
      await authService.logout()

      expect(mockLocalStorage.getItem('auth_token')).toBeNull()
    })

    it('should complete tenant authentication flow', async () => {
      const credentials = {
        email: TEST_CREDENTIALS.tenant.email,
        password: TEST_CREDENTIALS.tenant.password,
      }

      // Step 1: Login
      mockFetch(MOCK_RESPONSES.loginSuccess('tenant'))
      const loginResult = await authService.login(credentials)

      expect(loginResult.success).toBe(true)
      expect(loginResult.data?.user.role).toBe('tenant')

      // Step 2: Access tenant features
      mockFetch({
        success: true,
        data: { user: MOCK_USERS.tenant },
      })
      const userResult = await authService.getCurrentUser()

      expect(userResult.data?.user.role).toBe('tenant')

      // Step 3: Logout
      mockFetch(MOCK_RESPONSES.logoutSuccess)
      await authService.logout()

      expect(mockLocalStorage.getItem('auth_token')).toBeNull()
    })

    it('should allow caretaker to reset their own password', async () => {
      const email = TEST_CREDENTIALS.caretaker.email
      const newPassword = 'NewCaretakerPass123!'

      // Password reset flow
      mockFetch(MOCK_RESPONSES.forgotPasswordSuccess)
      await authService.forgotPassword({ email })

      mockFetch(MOCK_RESPONSES.resetPasswordSuccess)
      await authService.resetPassword({
        token: MOCK_TOKENS.resetPassword,
        email,
        password: newPassword,
        password_confirmation: newPassword,
      })

      // Login with new password
      mockFetch(MOCK_RESPONSES.loginSuccess('caretaker'))
      const loginResult = await authService.login({
        email,
        password: newPassword,
      })

      expect(loginResult.success).toBe(true)
    })
  })

  describe('Multi-Session & Concurrent Access', () => {
    it('should handle multiple concurrent logins', async () => {
      const credentials = {
        email: TEST_CREDENTIALS.landlord.email,
        password: TEST_CREDENTIALS.landlord.password,
      }

      // Simulate logging in from multiple devices
      mockFetch({
        ...MOCK_RESPONSES.loginSuccess('landlord'),
        data: {
          ...MOCK_RESPONSES.loginSuccess('landlord').data!,
          token: 'device-1-token',
        },
      })
      const login1 = await authService.login(credentials)

      mockFetch({
        ...MOCK_RESPONSES.loginSuccess('landlord'),
        data: {
          ...MOCK_RESPONSES.loginSuccess('landlord').data!,
          token: 'device-2-token',
        },
      })
      const login2 = await authService.login(credentials)

      // Both logins should succeed with different tokens
      expect(login1.success).toBe(true)
      expect(login2.success).toBe(true)
      expect(login1.data?.token).not.toBe(login2.data?.token)
    })

    it('should handle logout from one device while logged in on another', async () => {
      const credentials = {
        email: TEST_CREDENTIALS.landlord.email,
        password: TEST_CREDENTIALS.landlord.password,
      }

      // Login from device 1
      mockFetch({
        ...MOCK_RESPONSES.loginSuccess('landlord'),
        data: {
          ...MOCK_RESPONSES.loginSuccess('landlord').data!,
          token: 'device-1-token',
        },
      })
      await authService.login(credentials)
      const device1Token = mockLocalStorage.getItem('auth_token')

      // Logout from device 1
      mockFetch(MOCK_RESPONSES.logoutSuccess)
      await authService.logout()

      expect(mockLocalStorage.getItem('auth_token')).toBeNull()

      // Device 2 should still be able to login
      mockFetch({
        ...MOCK_RESPONSES.loginSuccess('landlord'),
        data: {
          ...MOCK_RESPONSES.loginSuccess('landlord').data!,
          token: 'device-2-token',
        },
      })
      const device2Login = await authService.login(credentials)

      expect(device2Login.success).toBe(true)
      expect(device2Login.data?.token).not.toBe(device1Token)
    })
  })

  describe('Security & Edge Cases', () => {
    it('should prevent unauthorized access without authentication', async () => {
      // Try to access protected resource without logging in
      mockFetch({
        success: false,
        message: 'Unauthenticated',
      }, { ok: false, status: 401 })

      await expect(authService.getCurrentUser()).rejects.toThrow()
    })

    it('should handle token expiration during active session', async () => {
      const credentials = {
        email: TEST_CREDENTIALS.landlord.email,
        password: TEST_CREDENTIALS.landlord.password,
      }

      // Login
      mockFetch(MOCK_RESPONSES.loginSuccess('landlord'))
      await authService.login(credentials)

      expect(mockLocalStorage.getItem('auth_token')).toBeDefined()

      // Simulate token expiring
      mockFetch({
        success: false,
        message: 'Token expired',
      }, { ok: false, status: 401 })

      // Try to access resource with expired token
      try {
        await authService.getCurrentUser()
      } catch (error) {
        // Expected
      }

      // Token should be cleared
      expect(mockLocalStorage.getItem('auth_token')).toBeNull()

      // Should be able to re-login
      mockFetch(MOCK_RESPONSES.loginSuccess('landlord'))
      const reloginResult = await authService.login(credentials)

      expect(reloginResult.success).toBe(true)
    })

    it('should handle network errors gracefully throughout the flow', async () => {
      // Test network error during login
      mockFetch({
        success: false,
        message: 'Network error',
      }, { ok: false, status: 500 })

      await expect(authService.login({
        email: TEST_CREDENTIALS.landlord.email,
        password: TEST_CREDENTIALS.landlord.password,
      })).rejects.toThrow()

      // Should not store anything on error
      expect(mockLocalStorage.getItem('auth_token')).toBeNull()
      expect(mockLocalStorage.getItem('user')).toBeNull()
    })

    it('should handle rapid successive login/logout operations', async () => {
      const credentials = {
        email: TEST_CREDENTIALS.landlord.email,
        password: TEST_CREDENTIALS.landlord.password,
      }

      // Rapid login/logout cycles
      for (let i = 0; i < 5; i++) {
        // Login
        mockFetch(MOCK_RESPONSES.loginSuccess('landlord'))
        await authService.login(credentials)
        expect(mockLocalStorage.getItem('auth_token')).toBeDefined()

        // Logout
        mockFetch(MOCK_RESPONSES.logoutSuccess)
        await authService.logout()
        expect(mockLocalStorage.getItem('auth_token')).toBeNull()
      }

      // Final state should be logged out
      expect(mockLocalStorage.getItem('auth_token')).toBeNull()
      expect(mockLocalStorage.getItem('user')).toBeNull()
    })
  })

  describe('Role-Based Access Control', () => {
    it('should enforce role-specific access after authentication', async () => {
      const roles: Array<'superAdmin' | 'landlord' | 'caretaker' | 'tenant'> = 
        ['superAdmin', 'landlord', 'caretaker', 'tenant']

      for (const role of roles) {
        mockLocalStorage.clear()

        // Login
        mockFetch(MOCK_RESPONSES.loginSuccess(role === 'superAdmin' ? 'superAdmin' : role))
        await authService.login({
          email: TEST_CREDENTIALS[role].email,
          password: TEST_CREDENTIALS[role].password,
        })

        // Verify correct role
        mockFetch({
          success: true,
          data: { user: MOCK_USERS[role === 'superAdmin' ? 'superAdmin' : role] },
        })
        const userResult = await authService.getCurrentUser()

        expect(userResult.data?.user.role).toBe(
          role === 'superAdmin' ? 'super_admin' : role
        )

        // Logout
        mockFetch(MOCK_RESPONSES.logoutSuccess)
        await authService.logout()
      }
    })
  })
})

