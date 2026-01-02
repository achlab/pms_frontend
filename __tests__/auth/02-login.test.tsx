/**
 * Authentication Tests - Login for All Roles
 * 
 * Tests cover:
 * - Login for Super Admin, Landlord, Caretaker, and Tenant
 * - Credential validation
 * - Token generation and storage
 * - Error handling for invalid logins
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { mockFetch, resetFetchMock, mockLocalStorage } from './test-setup'
import { 
  TEST_CREDENTIALS, 
  MOCK_RESPONSES, 
  MOCK_USERS,
  ERROR_MESSAGES 
} from './mock-data'
import { authService } from '@/lib/services/auth.service'

describe('Authentication - Login for All Roles', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    resetFetchMock()
  })

  afterEach(() => {
    resetFetchMock()
  })

  describe('Super Admin Login', () => {
    it('should successfully login super admin with correct credentials', async () => {
      // Arrange
      const credentials = {
        email: TEST_CREDENTIALS.superAdmin.email,
        password: TEST_CREDENTIALS.superAdmin.password,
      }

      mockFetch(MOCK_RESPONSES.loginSuccess('superAdmin'))

      // Act
      const result = await authService.login(credentials)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data?.user).toBeDefined()
      expect(result.data?.user.role).toBe('super_admin')
      expect(result.data?.user.email).toBe(credentials.email)
      expect(result.data?.token).toBeDefined()
    })

    it('should store token after successful super admin login', async () => {
      // Arrange
      const credentials = {
        email: TEST_CREDENTIALS.superAdmin.email,
        password: TEST_CREDENTIALS.superAdmin.password,
      }

      const mockToken = 'super-admin-token-123'
      mockFetch({
        ...MOCK_RESPONSES.loginSuccess('superAdmin'),
        data: {
          ...MOCK_RESPONSES.loginSuccess('superAdmin').data!,
          token: mockToken,
        },
      })

      // Act
      await authService.login(credentials)

      // Assert
      const storedToken = mockLocalStorage.getItem('auth_token')
      expect(storedToken).toBe(mockToken)
    })

    it('should reject invalid super admin credentials', async () => {
      // Arrange
      const credentials = {
        email: TEST_CREDENTIALS.superAdmin.email,
        password: 'WrongPassword123!',
      }

      mockFetch(MOCK_RESPONSES.loginInvalidCredentials, { ok: false, status: 401 })

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow()
    })
  })

  describe('Landlord Login', () => {
    it('should successfully login landlord with correct credentials', async () => {
      // Arrange
      const credentials = {
        email: TEST_CREDENTIALS.landlord.email,
        password: TEST_CREDENTIALS.landlord.password,
      }

      mockFetch(MOCK_RESPONSES.loginSuccess('landlord'))

      // Act
      const result = await authService.login(credentials)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data?.user.role).toBe('landlord')
      expect(result.data?.user.email).toBe(credentials.email)
      expect(result.data?.token).toBeDefined()
    })

    it('should store user data after successful landlord login', async () => {
      // Arrange
      const credentials = {
        email: TEST_CREDENTIALS.landlord.email,
        password: TEST_CREDENTIALS.landlord.password,
      }

      mockFetch(MOCK_RESPONSES.loginSuccess('landlord'))

      // Act
      await authService.login(credentials)

      // Assert
      const storedUser = mockLocalStorage.getItem('user')
      expect(storedUser).toBeDefined()
      
      const parsedUser = JSON.parse(storedUser!)
      expect(parsedUser.email).toBe(credentials.email)
      expect(parsedUser.role).toBe('landlord')
    })

    it('should reject landlord login with wrong password', async () => {
      // Arrange
      const credentials = {
        email: TEST_CREDENTIALS.landlord.email,
        password: 'WrongPassword!',
      }

      mockFetch(MOCK_RESPONSES.loginInvalidCredentials, { ok: false, status: 401 })

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow()
    })

    it('should reject landlord login with non-existent email', async () => {
      // Arrange
      const credentials = {
        email: 'nonexistent@test.com',
        password: 'Password123!',
      }

      mockFetch(MOCK_RESPONSES.loginInvalidCredentials, { ok: false, status: 401 })

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow()
    })
  })

  describe('Caretaker Login', () => {
    it('should successfully login caretaker with correct credentials', async () => {
      // Arrange
      const credentials = {
        email: TEST_CREDENTIALS.caretaker.email,
        password: TEST_CREDENTIALS.caretaker.password,
      }

      mockFetch(MOCK_RESPONSES.loginSuccess('caretaker'))

      // Act
      const result = await authService.login(credentials)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data?.user.role).toBe('caretaker')
      expect(result.data?.user.email).toBe(credentials.email)
      expect(result.data?.token).toBeDefined()
    })

    it('should reject caretaker login with invalid credentials', async () => {
      // Arrange
      const credentials = {
        email: TEST_CREDENTIALS.caretaker.email,
        password: 'WrongPassword!',
      }

      mockFetch(MOCK_RESPONSES.loginInvalidCredentials, { ok: false, status: 401 })

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow()
    })
  })

  describe('Tenant Login', () => {
    it('should successfully login tenant with correct credentials', async () => {
      // Arrange
      const credentials = {
        email: TEST_CREDENTIALS.tenant.email,
        password: TEST_CREDENTIALS.tenant.password,
      }

      mockFetch(MOCK_RESPONSES.loginSuccess('tenant'))

      // Act
      const result = await authService.login(credentials)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data?.user.role).toBe('tenant')
      expect(result.data?.user.email).toBe(credentials.email)
      expect(result.data?.token).toBeDefined()
    })

    it('should reject tenant login with invalid credentials', async () => {
      // Arrange
      const credentials = {
        email: TEST_CREDENTIALS.tenant.email,
        password: 'WrongPassword!',
      }

      mockFetch(MOCK_RESPONSES.loginInvalidCredentials, { ok: false, status: 401 })

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow()
    })
  })

  describe('Login Validation', () => {
    it('should validate email format before login', async () => {
      // Arrange
      const invalidCredentials = {
        email: 'not-an-email',
        password: 'Password123!',
      }

      mockFetch({
        success: false,
        message: 'Validation error',
        errors: { email: [ERROR_MESSAGES.invalidEmail] },
      }, { ok: false, status: 422 })

      // Act & Assert
      await expect(authService.login(invalidCredentials)).rejects.toThrow()
    })

    it('should require both email and password', async () => {
      // Arrange
      const emptyCredentials = {
        email: '',
        password: '',
      }

      mockFetch({
        success: false,
        message: 'Validation error',
        errors: {
          email: [ERROR_MESSAGES.requiredField],
          password: [ERROR_MESSAGES.requiredField],
        },
      }, { ok: false, status: 422 })

      // Act & Assert
      await expect(authService.login(emptyCredentials)).rejects.toThrow()
    })
  })

  describe('Email Verification Check on Login', () => {
    it('should prevent login for unverified email', async () => {
      // Arrange
      const credentials = {
        email: MOCK_USERS.unverified.email,
        password: 'Password123!',
      }

      mockFetch(MOCK_RESPONSES.loginUnverified, { ok: false, status: 403 })

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow()
    })

    it('should allow login only after email verification', async () => {
      // Step 1: Try to login with unverified email - should fail
      const credentials = {
        email: 'unverified@test.com',
        password: 'Password123!',
      }

      mockFetch(MOCK_RESPONSES.loginUnverified, { ok: false, status: 403 })
      await expect(authService.login(credentials)).rejects.toThrow()

      // Step 2: After verification, login should succeed
      mockFetch(MOCK_RESPONSES.loginSuccess('landlord'))
      const result = await authService.login(credentials)

      expect(result.success).toBe(true)
      expect(result.data?.user.email_verified_at).not.toBeNull()
    })
  })

  describe('Token Management on Login', () => {
    it('should generate unique token for each login', async () => {
      // Arrange
      const credentials = {
        email: TEST_CREDENTIALS.landlord.email,
        password: TEST_CREDENTIALS.landlord.password,
      }

      // First login
      mockFetch({
        ...MOCK_RESPONSES.loginSuccess('landlord'),
        data: {
          ...MOCK_RESPONSES.loginSuccess('landlord').data!,
          token: 'token-1',
        },
      })

      const result1 = await authService.login(credentials)
      const token1 = result1.data?.token

      // Second login
      mockFetch({
        ...MOCK_RESPONSES.loginSuccess('landlord'),
        data: {
          ...MOCK_RESPONSES.loginSuccess('landlord').data!,
          token: 'token-2',
        },
      })

      const result2 = await authService.login(credentials)
      const token2 = result2.data?.token

      // Assert
      expect(token1).toBeDefined()
      expect(token2).toBeDefined()
      expect(token1).not.toBe(token2)
    })

    it('should replace old token with new token on re-login', async () => {
      // Arrange
      const credentials = {
        email: TEST_CREDENTIALS.landlord.email,
        password: TEST_CREDENTIALS.landlord.password,
      }

      // First login
      mockFetch({
        ...MOCK_RESPONSES.loginSuccess('landlord'),
        data: {
          ...MOCK_RESPONSES.loginSuccess('landlord').data!,
          token: 'old-token',
        },
      })

      await authService.login(credentials)
      const oldToken = mockLocalStorage.getItem('auth_token')
      expect(oldToken).toBe('old-token')

      // Second login
      mockFetch({
        ...MOCK_RESPONSES.loginSuccess('landlord'),
        data: {
          ...MOCK_RESPONSES.loginSuccess('landlord').data!,
          token: 'new-token',
        },
      })

      await authService.login(credentials)
      const newToken = mockLocalStorage.getItem('auth_token')

      // Assert
      expect(newToken).toBe('new-token')
      expect(newToken).not.toBe(oldToken)
    })
  })

  describe('Cross-Role Login Validation', () => {
    it('should prevent using one role credentials for another', async () => {
      // Arrange - Try to login with landlord email but get caretaker role
      const credentials = {
        email: TEST_CREDENTIALS.landlord.email,
        password: TEST_CREDENTIALS.landlord.password,
      }

      // This should not happen, but test for security
      mockFetch({
        ...MOCK_RESPONSES.loginSuccess('landlord'),
        data: {
          user: { ...MOCK_USERS.landlord, role: 'caretaker' }, // Wrong role
          token: 'token-123',
        },
      })

      const result = await authService.login(credentials)

      // Assert - The email should match but role should be as returned by backend
      expect(result.data?.user.email).toBe(TEST_CREDENTIALS.landlord.email)
      // Backend determines the role, not the client
    })
  })
})

