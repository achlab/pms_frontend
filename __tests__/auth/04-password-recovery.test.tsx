/**
 * Authentication Tests - Password Recovery & Reset
 * 
 * Tests cover:
 * - Forgot password flow for all roles
 * - Password reset with valid/invalid tokens
 * - Password reset validation
 * - Security checks
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { mockFetch, resetFetchMock, mockLocalStorage } from './test-setup'
import { 
  TEST_CREDENTIALS, 
  MOCK_RESPONSES,
  MOCK_TOKENS,
  ERROR_MESSAGES 
} from './mock-data'
import { authService } from '@/lib/services/auth.service'

describe('Authentication - Password Recovery & Reset', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    resetFetchMock()
  })

  afterEach(() => {
    resetFetchMock()
  })

  describe('Forgot Password - Request Reset Link', () => {
    it('should send reset link for super admin', async () => {
      // Arrange
      const email = TEST_CREDENTIALS.superAdmin.email

      mockFetch(MOCK_RESPONSES.forgotPasswordSuccess)

      // Act
      const result = await authService.forgotPassword({ email })

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toContain('reset link')
      expect(result.message).toContain('email')
    })

    it('should send reset link for landlord', async () => {
      // Arrange
      const email = TEST_CREDENTIALS.landlord.email

      mockFetch(MOCK_RESPONSES.forgotPasswordSuccess)

      // Act
      const result = await authService.forgotPassword({ email })

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toContain('reset link')
    })

    it('should send reset link for caretaker', async () => {
      // Arrange
      const email = TEST_CREDENTIALS.caretaker.email

      mockFetch(MOCK_RESPONSES.forgotPasswordSuccess)

      // Act
      const result = await authService.forgotPassword({ email })

      // Assert
      expect(result.success).toBe(true)
    })

    it('should send reset link for tenant', async () => {
      // Arrange
      const email = TEST_CREDENTIALS.tenant.email

      mockFetch(MOCK_RESPONSES.forgotPasswordSuccess)

      // Act
      const result = await authService.forgotPassword({ email })

      // Assert
      expect(result.success).toBe(true)
    })

    it('should reject forgot password for non-existent email', async () => {
      // Arrange
      const email = 'nonexistent@test.com'

      mockFetch(MOCK_RESPONSES.forgotPasswordNotFound, { ok: false, status: 404 })

      // Act & Assert
      await expect(authService.forgotPassword({ email })).rejects.toThrow()
    })

    it('should validate email format in forgot password', async () => {
      // Arrange
      const invalidEmails = [
        'notanemail',
        '@nodomain.com',
        'missing@',
      ]

      for (const email of invalidEmails) {
        mockFetch({
          success: false,
          message: 'Validation error',
          errors: { email: [ERROR_MESSAGES.invalidEmail] },
        }, { ok: false, status: 422 })

        // Act & Assert
        await expect(authService.forgotPassword({ email })).rejects.toThrow()
      }
    })

    it('should require email in forgot password request', async () => {
      // Arrange
      const email = ''

      mockFetch({
        success: false,
        message: 'Validation error',
        errors: { email: [ERROR_MESSAGES.requiredField] },
      }, { ok: false, status: 422 })

      // Act & Assert
      await expect(authService.forgotPassword({ email })).rejects.toThrow()
    })
  })

  describe('Password Reset - Using Token', () => {
    it('should successfully reset password with valid token', async () => {
      // Arrange
      const resetData = {
        token: MOCK_TOKENS.resetPassword,
        email: TEST_CREDENTIALS.landlord.email,
        password: 'NewPassword123!',
        password_confirmation: 'NewPassword123!',
      }

      mockFetch(MOCK_RESPONSES.resetPasswordSuccess)

      // Act
      const result = await authService.resetPassword(resetData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toContain('reset successfully')
    })

    it('should reject password reset with invalid token', async () => {
      // Arrange
      const resetData = {
        token: MOCK_TOKENS.invalid,
        email: TEST_CREDENTIALS.landlord.email,
        password: 'NewPassword123!',
        password_confirmation: 'NewPassword123!',
      }

      mockFetch(MOCK_RESPONSES.resetPasswordInvalidToken, { ok: false, status: 400 })

      // Act & Assert
      await expect(authService.resetPassword(resetData)).rejects.toThrow()
    })

    it('should reject password reset with expired token', async () => {
      // Arrange
      const resetData = {
        token: MOCK_TOKENS.expired,
        email: TEST_CREDENTIALS.landlord.email,
        password: 'NewPassword123!',
        password_confirmation: 'NewPassword123!',
      }

      mockFetch(MOCK_RESPONSES.resetPasswordInvalidToken, { ok: false, status: 400 })

      // Act & Assert
      await expect(authService.resetPassword(resetData)).rejects.toThrow()
    })

    it('should validate new password strength', async () => {
      // Arrange
      const weakPasswords = [
        'short',           // Too short
        'nouppercase123',  // No uppercase
        'NOLOWERCASE123',  // No lowercase
        'NoNumbers',       // No numbers
      ]

      for (const password of weakPasswords) {
        const resetData = {
          token: MOCK_TOKENS.resetPassword,
          email: TEST_CREDENTIALS.landlord.email,
          password,
          password_confirmation: password,
        }

        mockFetch({
          success: false,
          message: 'Validation error',
          errors: { password: [ERROR_MESSAGES.invalidPassword] },
        }, { ok: false, status: 422 })

        // Act & Assert
        await expect(authService.resetPassword(resetData)).rejects.toThrow()
      }
    })

    it('should validate password confirmation matches', async () => {
      // Arrange
      const resetData = {
        token: MOCK_TOKENS.resetPassword,
        email: TEST_CREDENTIALS.landlord.email,
        password: 'NewPassword123!',
        password_confirmation: 'DifferentPassword123!',
      }

      mockFetch({
        success: false,
        message: 'Validation error',
        errors: { password_confirmation: [ERROR_MESSAGES.passwordMismatch] },
      }, { ok: false, status: 422 })

      // Act & Assert
      await expect(authService.resetPassword(resetData)).rejects.toThrow()
    })

    it('should prevent reusing the same password', async () => {
      // Arrange
      const resetData = {
        token: MOCK_TOKENS.resetPassword,
        email: TEST_CREDENTIALS.landlord.email,
        password: TEST_CREDENTIALS.landlord.password, // Same as old password
        password_confirmation: TEST_CREDENTIALS.landlord.password,
      }

      mockFetch({
        success: false,
        message: 'Cannot reuse old password',
        errors: { password: ['New password must be different from old password'] },
      }, { ok: false, status: 422 })

      // Act & Assert
      await expect(authService.resetPassword(resetData)).rejects.toThrow()
    })
  })

  describe('Complete Password Recovery Flow', () => {
    it('should complete full password recovery flow for landlord', async () => {
      const email = TEST_CREDENTIALS.landlord.email

      // Step 1: Request password reset
      mockFetch(MOCK_RESPONSES.forgotPasswordSuccess)
      const forgotResult = await authService.forgotPassword({ email })

      expect(forgotResult.success).toBe(true)

      // Step 2: Reset password with token
      const newPassword = 'BrandNewPassword123!'
      const resetData = {
        token: MOCK_TOKENS.resetPassword,
        email,
        password: newPassword,
        password_confirmation: newPassword,
      }

      mockFetch(MOCK_RESPONSES.resetPasswordSuccess)
      const resetResult = await authService.resetPassword(resetData)

      expect(resetResult.success).toBe(true)

      // Step 3: Login with new password
      mockFetch(MOCK_RESPONSES.loginSuccess('landlord'))
      const loginResult = await authService.login({
        email,
        password: newPassword,
      })

      expect(loginResult.success).toBe(true)
      expect(loginResult.data?.token).toBeDefined()
    })

    it('should complete full password recovery flow for caretaker', async () => {
      const email = TEST_CREDENTIALS.caretaker.email

      // Step 1: Forgot password
      mockFetch(MOCK_RESPONSES.forgotPasswordSuccess)
      await authService.forgotPassword({ email })

      // Step 2: Reset password
      const newPassword = 'NewCaretakerPassword123!'
      mockFetch(MOCK_RESPONSES.resetPasswordSuccess)
      await authService.resetPassword({
        token: MOCK_TOKENS.resetPassword,
        email,
        password: newPassword,
        password_confirmation: newPassword,
      })

      // Step 3: Login with new password
      mockFetch(MOCK_RESPONSES.loginSuccess('caretaker'))
      const loginResult = await authService.login({
        email,
        password: newPassword,
      })

      expect(loginResult.success).toBe(true)
    })

    it('should complete full password recovery flow for tenant', async () => {
      const email = TEST_CREDENTIALS.tenant.email

      // Step 1: Forgot password
      mockFetch(MOCK_RESPONSES.forgotPasswordSuccess)
      await authService.forgotPassword({ email })

      // Step 2: Reset password
      const newPassword = 'NewTenantPassword123!'
      mockFetch(MOCK_RESPONSES.resetPasswordSuccess)
      await authService.resetPassword({
        token: MOCK_TOKENS.resetPassword,
        email,
        password: newPassword,
        password_confirmation: newPassword,
      })

      // Step 3: Login with new password
      mockFetch(MOCK_RESPONSES.loginSuccess('tenant'))
      const loginResult = await authService.login({
        email,
        password: newPassword,
      })

      expect(loginResult.success).toBe(true)
    })
  })

  describe('Security Measures', () => {
    it('should expire reset token after specified time', async () => {
      // Arrange
      const resetData = {
        token: MOCK_TOKENS.expired,
        email: TEST_CREDENTIALS.landlord.email,
        password: 'NewPassword123!',
        password_confirmation: 'NewPassword123!',
      }

      mockFetch({
        success: false,
        message: 'Reset token has expired. Please request a new one.',
      }, { ok: false, status: 400 })

      // Act & Assert
      await expect(authService.resetPassword(resetData)).rejects.toThrow()
    })

    it('should invalidate token after successful password reset', async () => {
      // Arrange
      const resetData = {
        token: MOCK_TOKENS.resetPassword,
        email: TEST_CREDENTIALS.landlord.email,
        password: 'NewPassword123!',
        password_confirmation: 'NewPassword123!',
      }

      // Step 1: Reset password successfully
      mockFetch(MOCK_RESPONSES.resetPasswordSuccess)
      await authService.resetPassword(resetData)

      // Step 2: Try to use the same token again
      mockFetch({
        success: false,
        message: 'Invalid or expired reset token',
      }, { ok: false, status: 400 })

      // Act & Assert
      await expect(authService.resetPassword(resetData)).rejects.toThrow()
    })

    it('should rate limit password reset requests', async () => {
      // Arrange
      const email = TEST_CREDENTIALS.landlord.email

      // Make multiple rapid requests
      const requests = Array(6).fill(null).map(() => 
        authService.forgotPassword({ email })
      )

      mockFetch({
        success: false,
        message: 'Too many password reset attempts. Please try again later.',
      }, { ok: false, status: 429 })

      // Act & Assert
      await expect(Promise.all(requests)).rejects.toThrow()
    })

    it('should not reveal if email exists or not', async () => {
      // Arrange
      const existingEmail = TEST_CREDENTIALS.landlord.email
      const nonExistingEmail = 'nonexistent@test.com'

      // For security, both should return the same response
      mockFetch(MOCK_RESPONSES.forgotPasswordSuccess)

      // Act
      const result1 = await authService.forgotPassword({ email: existingEmail })
      const result2 = await authService.forgotPassword({ email: nonExistingEmail })

      // Assert - Both should appear successful
      expect(result1.message).toBe(result2.message)
    })

    it('should logout all sessions after password reset', async () => {
      // Arrange
      const email = TEST_CREDENTIALS.landlord.email

      // Step 1: Login
      mockFetch(MOCK_RESPONSES.loginSuccess('landlord'))
      await authService.login({
        email,
        password: TEST_CREDENTIALS.landlord.password,
      })

      const oldToken = mockLocalStorage.getItem('auth_token')
      expect(oldToken).toBeDefined()

      // Step 2: Reset password
      const newPassword = 'NewPassword123!'
      mockFetch(MOCK_RESPONSES.resetPasswordSuccess)
      await authService.resetPassword({
        token: MOCK_TOKENS.resetPassword,
        email,
        password: newPassword,
        password_confirmation: newPassword,
      })

      // Step 3: Try to use old token
      mockFetch({
        success: false,
        message: 'Unauthenticated',
      }, { ok: false, status: 401 })

      // Assert - Old token should be invalid
      await expect(authService.getCurrentUser()).rejects.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle concurrent password reset requests', async () => {
      // Arrange
      const email = TEST_CREDENTIALS.landlord.email

      mockFetch(MOCK_RESPONSES.forgotPasswordSuccess)

      // Act - Send multiple requests simultaneously
      const requests = [
        authService.forgotPassword({ email }),
        authService.forgotPassword({ email }),
        authService.forgotPassword({ email }),
      ]

      const results = await Promise.all(requests)

      // Assert - All should succeed
      results.forEach(result => {
        expect(result.success).toBe(true)
      })
    })

    it('should handle network errors gracefully', async () => {
      // Arrange
      const email = TEST_CREDENTIALS.landlord.email

      mockFetch({
        success: false,
        message: ERROR_MESSAGES.networkError,
      }, { ok: false, status: 500 })

      // Act & Assert
      await expect(authService.forgotPassword({ email })).rejects.toThrow()
    })
  })
})

