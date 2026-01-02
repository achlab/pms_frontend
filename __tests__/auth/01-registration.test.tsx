/**
 * Authentication Tests - Registration & Email Verification
 * 
 * Tests cover:
 * - Landlord registration flow
 * - Email verification process
 * - Form validation
 * - Error handling
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { mockFetch, resetFetchMock, mockLocalStorage } from './test-setup'
import { 
  TEST_CREDENTIALS, 
  MOCK_RESPONSES, 
  MOCK_TOKENS,
  ERROR_MESSAGES 
} from './mock-data'

// Import authentication services
import { authService } from '@/lib/services/auth.service'

describe('Authentication - Registration & Email Verification', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    resetFetchMock()
  })

  afterEach(() => {
    resetFetchMock()
  })

  describe('Landlord Registration', () => {
    it('should successfully register a new landlord', async () => {
      // Arrange
      const registrationData = {
        name: TEST_CREDENTIALS.newLandlord.name,
        email: TEST_CREDENTIALS.newLandlord.email,
        password: TEST_CREDENTIALS.newLandlord.password,
        password_confirmation: TEST_CREDENTIALS.newLandlord.password,
        phone: TEST_CREDENTIALS.newLandlord.phone!,
        address: 'Test Address',
        bio: 'Test Bio',
      }

      mockFetch(MOCK_RESPONSES.registerSuccess)

      // Act
      const result = await authService.register(registrationData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toContain('email to verify')
      expect(result.data?.user).toBeDefined()
      expect(result.data?.user.email).toBe(registrationData.email)
      expect(result.data?.user.role).toBe('landlord')
      expect(result.data?.user.email_verified_at).toBeNull() // Not verified yet
    })

    it('should reject registration with existing email', async () => {
      // Arrange
      const registrationData = {
        name: 'Existing User',
        email: TEST_CREDENTIALS.landlord.email, // Email that already exists
        password: 'Test123!@#',
        password_confirmation: 'Test123!@#',
        phone: '+1234567890',
      }

      mockFetch(MOCK_RESPONSES.registerEmailExists, { ok: false, status: 422 })

      // Act & Assert
      await expect(authService.register(registrationData)).rejects.toThrow()
    })

    it('should validate password meets requirements', async () => {
      // Arrange
      const weakPasswords = [
        'short',           // Too short
        'nouppercase123',  // No uppercase
        'NOLOWERCASE123',  // No lowercase
        'NoNumbers',       // No numbers
      ]

      for (const password of weakPasswords) {
        const registrationData = {
          name: 'Test User',
          email: 'test@example.com',
          password,
          password_confirmation: password,
          phone: '+1234567890',
        }

        mockFetch({
          success: false,
          message: 'Validation error',
          errors: { password: [ERROR_MESSAGES.invalidPassword] },
        }, { ok: false, status: 422 })

        // Act & Assert
        await expect(authService.register(registrationData)).rejects.toThrow()
      }
    })

    it('should validate password confirmation matches', async () => {
      // Arrange
      const registrationData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        password_confirmation: 'DifferentPassword123!',
        phone: '+1234567890',
      }

      mockFetch({
        success: false,
        message: 'Validation error',
        errors: { password_confirmation: [ERROR_MESSAGES.passwordMismatch] },
      }, { ok: false, status: 422 })

      // Act & Assert
      await expect(authService.register(registrationData)).rejects.toThrow()
    })

    it('should validate required fields', async () => {
      // Arrange
      const incompleteData = {
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
      }

      mockFetch({
        success: false,
        message: 'Validation error',
        errors: {
          name: [ERROR_MESSAGES.requiredField],
          email: [ERROR_MESSAGES.requiredField],
          password: [ERROR_MESSAGES.requiredField],
          phone: [ERROR_MESSAGES.requiredField],
        },
      }, { ok: false, status: 422 })

      // Act & Assert
      await expect(authService.register(incompleteData)).rejects.toThrow()
    })

    it('should validate email format', async () => {
      // Arrange
      const invalidEmails = [
        'notanemail',
        '@nodomain.com',
        'spaces in@email.com',
        'missing@.com',
      ]

      for (const email of invalidEmails) {
        const registrationData = {
          name: 'Test User',
          email,
          password: 'Password123!',
          password_confirmation: 'Password123!',
          phone: '+1234567890',
        }

        mockFetch({
          success: false,
          message: 'Validation error',
          errors: { email: [ERROR_MESSAGES.invalidEmail] },
        }, { ok: false, status: 422 })

        // Act & Assert
        await expect(authService.register(registrationData)).rejects.toThrow()
      }
    })
  })

  describe('Email Verification', () => {
    it('should successfully verify email with valid token', async () => {
      // Arrange
      const verificationData = {
        token: MOCK_TOKENS.verification,
        email: TEST_CREDENTIALS.newLandlord.email,
      }

      mockFetch(MOCK_RESPONSES.verifyEmailSuccess)

      // Act
      const result = await authService.verifyEmail(verificationData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toContain('verified successfully')
    })

    it('should reject invalid verification token', async () => {
      // Arrange
      const verificationData = {
        token: MOCK_TOKENS.invalid,
        email: TEST_CREDENTIALS.newLandlord.email,
      }

      mockFetch(MOCK_RESPONSES.verifyEmailInvalid, { ok: false, status: 400 })

      // Act & Assert
      await expect(authService.verifyEmail(verificationData)).rejects.toThrow()
    })

    it('should reject expired verification token', async () => {
      // Arrange
      const verificationData = {
        token: MOCK_TOKENS.expired,
        email: TEST_CREDENTIALS.newLandlord.email,
      }

      mockFetch(MOCK_RESPONSES.verifyEmailInvalid, { ok: false, status: 400 })

      // Act & Assert
      await expect(authService.verifyEmail(verificationData)).rejects.toThrow()
    })

    it('should allow resending verification email', async () => {
      // Arrange
      const email = TEST_CREDENTIALS.newLandlord.email

      mockFetch({
        success: true,
        message: 'Verification email has been resent.',
      })

      // Act
      const result = await authService.resendVerificationEmail(email)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toContain('resent')
    })
  })

  describe('Registration Flow Integration', () => {
    it('should complete full registration and verification flow', async () => {
      // Step 1: Register
      const registrationData = {
        name: TEST_CREDENTIALS.newLandlord.name,
        email: TEST_CREDENTIALS.newLandlord.email,
        password: TEST_CREDENTIALS.newLandlord.password,
        password_confirmation: TEST_CREDENTIALS.newLandlord.password,
        phone: TEST_CREDENTIALS.newLandlord.phone!,
      }

      mockFetch(MOCK_RESPONSES.registerSuccess)
      const registerResult = await authService.register(registrationData)

      expect(registerResult.success).toBe(true)
      expect(registerResult.data?.user.email_verified_at).toBeNull()

      // Step 2: Verify email
      const verificationData = {
        token: MOCK_TOKENS.verification,
        email: registrationData.email,
      }

      mockFetch(MOCK_RESPONSES.verifyEmailSuccess)
      const verifyResult = await authService.verifyEmail(verificationData)

      expect(verifyResult.success).toBe(true)

      // Step 3: Login with verified account
      mockFetch(MOCK_RESPONSES.loginSuccess('landlord'))
      const loginResult = await authService.login({
        email: registrationData.email,
        password: registrationData.password,
      })

      expect(loginResult.success).toBe(true)
      expect(loginResult.data?.user.email_verified_at).not.toBeNull()
      expect(loginResult.data?.token).toBeDefined()
    })

    it('should prevent login before email verification', async () => {
      // Arrange
      const credentials = {
        email: 'unverified@test.com',
        password: 'Password123!',
      }

      mockFetch(MOCK_RESPONSES.loginUnverified, { ok: false, status: 403 })

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow()
    })
  })

  describe('Registration Role Assignment', () => {
    it('should assign landlord role to new registrations', async () => {
      // Arrange
      const registrationData = {
        name: 'New User',
        email: 'newuser@test.com',
        password: 'Password123!',
        password_confirmation: 'Password123!',
        phone: '+1234567890',
      }

      const response = {
        ...MOCK_RESPONSES.registerSuccess,
        data: {
          user: {
            ...MOCK_RESPONSES.registerSuccess.data.user,
            role: 'landlord',
          },
        },
      }

      mockFetch(response)

      // Act
      const result = await authService.register(registrationData)

      // Assert
      expect(result.data?.user.role).toBe('landlord')
    })

    it('should not allow registering as super_admin', async () => {
      // Arrange - attempting to register as super_admin should be rejected
      const registrationData = {
        name: 'Hacker',
        email: 'hacker@test.com',
        password: 'Password123!',
        password_confirmation: 'Password123!',
        phone: '+1234567890',
        role: 'super_admin', // This should be ignored/rejected
      }

      mockFetch({
        success: false,
        message: 'Invalid role',
        errors: { role: ['Cannot register as super admin'] },
      }, { ok: false, status: 400 })

      // Act & Assert
      await expect(authService.register(registrationData)).rejects.toThrow()
    })
  })
})

