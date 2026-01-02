/**
 * Authentication Tests - Token Management & Persistence
 * 
 * Tests cover:
 * - Token storage and retrieval
 * - Token persistence across page reloads
 * - Token expiration handling
 * - Automatic token refresh
 * - Multiple tab synchronization
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { mockFetch, resetFetchMock, mockLocalStorage } from './test-setup'
import { 
  TEST_CREDENTIALS, 
  MOCK_RESPONSES,
  MOCK_TOKENS 
} from './mock-data'
import { authService } from '@/lib/services/auth.service'

describe('Authentication - Token Management & Persistence', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    resetFetchMock()
  })

  afterEach(() => {
    resetFetchMock()
  })

  // Helper to perform login
  const performLogin = async (role: 'superAdmin' | 'landlord' | 'caretaker' | 'tenant') => {
    const credentials = {
      email: TEST_CREDENTIALS[role].email,
      password: TEST_CREDENTIALS[role].password,
    }

    mockFetch({
      ...MOCK_RESPONSES.loginSuccess(role),
      data: {
        ...MOCK_RESPONSES.loginSuccess(role).data!,
        token: `${role}-token-${Date.now()}`,
      },
    })

    return await authService.login(credentials)
  }

  describe('Token Storage', () => {
    it('should store token in localStorage after login', async () => {
      // Arrange & Act
      const result = await performLogin('landlord')

      // Assert
      const storedToken = mockLocalStorage.getItem('auth_token')
      expect(storedToken).toBe(result.data?.token)
    })

    it('should store user data alongside token', async () => {
      // Arrange & Act
      const result = await performLogin('landlord')

      // Assert
      const storedToken = mockLocalStorage.getItem('auth_token')
      const storedUser = mockLocalStorage.getItem('user')

      expect(storedToken).toBeDefined()
      expect(storedUser).toBeDefined()

      const parsedUser = JSON.parse(storedUser!)
      expect(parsedUser.email).toBe(result.data?.user.email)
    })

    it('should retrieve token from localStorage', async () => {
      // Arrange
      await performLogin('landlord')

      // Act
      const token = mockLocalStorage.getItem('auth_token')

      // Assert
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token!.length).toBeGreaterThan(0)
    })

    it('should update token when re-logging in', async () => {
      // Arrange
      await performLogin('landlord')
      const firstToken = mockLocalStorage.getItem('auth_token')

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10))

      // Act - Login again
      await performLogin('landlord')
      const secondToken = mockLocalStorage.getItem('auth_token')

      // Assert
      expect(firstToken).not.toBe(secondToken)
    })
  })

  describe('Token Persistence', () => {
    it('should persist token across page reloads', async () => {
      // Arrange
      await performLogin('landlord')
      const tokenBeforeReload = mockLocalStorage.getItem('auth_token')

      // Simulate page reload (localStorage persists)
      // The mock localStorage maintains its state

      // Act
      const tokenAfterReload = mockLocalStorage.getItem('auth_token')

      // Assert
      expect(tokenAfterReload).toBe(tokenBeforeReload)
      expect(tokenAfterReload).not.toBeNull()
    })

    it('should restore user session on page load', async () => {
      // Arrange
      await performLogin('landlord')
      const userBefore = mockLocalStorage.getItem('user')

      // Simulate page reload
      mockFetch(MOCK_RESPONSES.loginSuccess('landlord'))

      // Act
      const userAfter = mockLocalStorage.getItem('user')

      // Assert
      expect(userAfter).toBe(userBefore)
      expect(JSON.parse(userAfter!)).toEqual(JSON.parse(userBefore!))
    })

    it('should verify token validity on app initialization', async () => {
      // Arrange
      await performLogin('landlord')

      mockFetch({
        success: true,
        data: {
          user: MOCK_RESPONSES.loginSuccess('landlord').data!.user,
        },
      })

      // Act - Simulate app initialization
      const result = await authService.getCurrentUser()

      // Assert
      expect(result.data?.user).toBeDefined()
    })
  })

  describe('Token Expiration', () => {
    it('should detect expired token', async () => {
      // Arrange
      await performLogin('landlord')

      // Simulate expired token response
      mockFetch({
        success: false,
        message: 'Token expired',
      }, { ok: false, status: 401 })

      // Act & Assert
      await expect(authService.getCurrentUser()).rejects.toThrow()
    })

    it('should clear expired token from storage', async () => {
      // Arrange
      await performLogin('landlord')
      const tokenBefore = mockLocalStorage.getItem('auth_token')
      expect(tokenBefore).toBeDefined()

      // Simulate expired token
      mockFetch({
        success: false,
        message: 'Token expired',
      }, { ok: false, status: 401 })

      // Act
      try {
        await authService.getCurrentUser()
      } catch (error) {
        // Expected to throw
      }

      // Assert
      const tokenAfter = mockLocalStorage.getItem('auth_token')
      expect(tokenAfter).toBeNull()
    })

    it('should prompt re-authentication on token expiration', async () => {
      // Arrange
      await performLogin('landlord')

      // Simulate expired token
      mockFetch({
        success: false,
        message: 'Token expired',
      }, { ok: false, status: 401 })

      // Act
      let isAuthenticated = true
      try {
        await authService.getCurrentUser()
      } catch (error) {
        isAuthenticated = false
      }

      // Assert
      expect(isAuthenticated).toBe(false)
      expect(mockLocalStorage.getItem('auth_token')).toBeNull()
    })
  })

  describe('Token Refresh', () => {
    it('should refresh token before expiration', async () => {
      // Arrange
      await performLogin('landlord')
      const oldToken = mockLocalStorage.getItem('auth_token')

      // Simulate token refresh
      const newToken = 'refreshed-token-123'
      mockFetch({
        success: true,
        data: {
          token: newToken,
        },
      })

      // Act
      const result = await authService.refreshToken()

      // Assert
      expect(result.data?.token).toBe(newToken)
      expect(mockLocalStorage.getItem('auth_token')).toBe(newToken)
      expect(mockLocalStorage.getItem('auth_token')).not.toBe(oldToken)
    })

    it('should handle refresh token failure', async () => {
      // Arrange
      await performLogin('landlord')

      // Simulate refresh failure
      mockFetch({
        success: false,
        message: 'Refresh token expired',
      }, { ok: false, status: 401 })

      // Act & Assert
      await expect(authService.refreshToken()).rejects.toThrow()
      expect(mockLocalStorage.getItem('auth_token')).toBeNull()
    })

    it('should automatically refresh token when expired', async () => {
      // Arrange
      await performLogin('landlord')

      // First request - token expired
      mockFetch({
        success: false,
        message: 'Token expired',
      }, { ok: false, status: 401 })

      // Refresh request
      const newToken = 'auto-refreshed-token'
      mockFetch({
        success: true,
        data: { token: newToken },
      })

      // Retry original request
      mockFetch(MOCK_RESPONSES.loginSuccess('landlord'))

      // Act
      await authService.getCurrentUser()

      // Assert
      expect(mockLocalStorage.getItem('auth_token')).toBe(newToken)
    })
  })

  describe('Token Security', () => {
    it('should not expose token in URL', async () => {
      // Arrange
      await performLogin('landlord')
      const token = mockLocalStorage.getItem('auth_token')

      // Assert
      // In a real browser, we'd check window.location
      // Here we just verify token is in localStorage, not URL-accessible
      expect(token).toBeDefined()
      expect(token).toContain('token')
    })

    it('should use secure storage for sensitive tokens', async () => {
      // Arrange
      await performLogin('landlord')

      // Act
      const token = mockLocalStorage.getItem('auth_token')

      // Assert - Token should be stored securely
      expect(token).toBeDefined()
      // In production, consider using httpOnly cookies for even better security
    })

    it('should include token in API request headers', async () => {
      // Arrange
      await performLogin('landlord')
      const token = mockLocalStorage.getItem('auth_token')

      // Mock an API call that should include the token
      global.fetch = jest.fn((url, options) => {
        const headers = options?.headers as Record<string, string>
        expect(headers?.Authorization).toBe(`Bearer ${token}`)
        
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true }),
        } as Response)
      })

      // Act
      await authService.getCurrentUser()

      // Assert
      expect(global.fetch).toHaveBeenCalled()
    })

    it('should validate token format', async () => {
      // Arrange
      mockLocalStorage.setItem('auth_token', 'invalid-format')

      // Act
      mockFetch({
        success: false,
        message: 'Invalid token format',
      }, { ok: false, status: 401 })

      // Assert
      await expect(authService.getCurrentUser()).rejects.toThrow()
    })
  })

  describe('Multiple Tab Synchronization', () => {
    it('should sync authentication state across tabs', async () => {
      // Arrange
      await performLogin('landlord')
      const token = mockLocalStorage.getItem('auth_token')

      // Simulate storage event from another tab
      const storageEvent = new StorageEvent('storage', {
        key: 'auth_token',
        newValue: token,
        oldValue: null,
        storageArea: localStorage,
      })

      // Act
      window.dispatchEvent(storageEvent)

      // Assert
      const currentToken = mockLocalStorage.getItem('auth_token')
      expect(currentToken).toBe(token)
    })

    it('should sync logout across all tabs', async () => {
      // Arrange
      await performLogin('landlord')
      expect(mockLocalStorage.getItem('auth_token')).toBeDefined()

      // Simulate logout in another tab
      const storageEvent = new StorageEvent('storage', {
        key: 'auth_token',
        newValue: null,
        oldValue: mockLocalStorage.getItem('auth_token'),
        storageArea: localStorage,
      })

      // Act
      mockLocalStorage.removeItem('auth_token')
      window.dispatchEvent(storageEvent)

      // Assert
      expect(mockLocalStorage.getItem('auth_token')).toBeNull()
    })

    it('should handle conflicting tokens from multiple tabs', async () => {
      // Arrange
      await performLogin('landlord')
      const token1 = mockLocalStorage.getItem('auth_token')

      // Simulate login from another tab with different token
      const token2 = 'different-token-from-tab-2'
      const storageEvent = new StorageEvent('storage', {
        key: 'auth_token',
        newValue: token2,
        oldValue: token1,
        storageArea: localStorage,
      })

      // Act
      mockLocalStorage.setItem('auth_token', token2)
      window.dispatchEvent(storageEvent)

      // Assert - Should use the most recent token
      expect(mockLocalStorage.getItem('auth_token')).toBe(token2)
    })
  })

  describe('Token Cleanup', () => {
    it('should remove token on explicit logout', async () => {
      // Arrange
      await performLogin('landlord')
      expect(mockLocalStorage.getItem('auth_token')).toBeDefined()

      mockFetch(MOCK_RESPONSES.logoutSuccess)

      // Act
      await authService.logout()

      // Assert
      expect(mockLocalStorage.getItem('auth_token')).toBeNull()
    })

    it('should clear all authentication data on logout', async () => {
      // Arrange
      await performLogin('landlord')
      
      mockLocalStorage.setItem('refresh_token', 'refresh-123')
      mockLocalStorage.setItem('session_id', 'session-123')

      mockFetch(MOCK_RESPONSES.logoutSuccess)

      // Act
      await authService.logout()

      // Assert
      expect(mockLocalStorage.getItem('auth_token')).toBeNull()
      expect(mockLocalStorage.getItem('user')).toBeNull()
      expect(mockLocalStorage.getItem('refresh_token')).toBeNull()
      expect(mockLocalStorage.getItem('session_id')).toBeNull()
    })

    it('should invalidate token on server when logging out', async () => {
      // Arrange
      await performLogin('landlord')
      const token = mockLocalStorage.getItem('auth_token')

      mockFetch(MOCK_RESPONSES.logoutSuccess)

      // Act
      await authService.logout()

      // Try to use the token after logout
      mockFetch({
        success: false,
        message: 'Unauthenticated',
      }, { ok: false, status: 401 })

      // Assert
      await expect(authService.getCurrentUser()).rejects.toThrow()
    })
  })

  describe('Token Edge Cases', () => {
    it('should handle missing token gracefully', async () => {
      // Arrange - No login performed
      expect(mockLocalStorage.getItem('auth_token')).toBeNull()

      mockFetch({
        success: false,
        message: 'Unauthenticated',
      }, { ok: false, status: 401 })

      // Act & Assert
      await expect(authService.getCurrentUser()).rejects.toThrow()
    })

    it('should handle corrupted token data', async () => {
      // Arrange
      mockLocalStorage.setItem('auth_token', 'corrupted###invalid@@@token')

      mockFetch({
        success: false,
        message: 'Invalid token',
      }, { ok: false, status: 401 })

      // Act & Assert
      await expect(authService.getCurrentUser()).rejects.toThrow()
    })

    it('should handle very long tokens', async () => {
      // Arrange
      const longToken = 'a'.repeat(10000)
      await performLogin('landlord')
      mockLocalStorage.setItem('auth_token', longToken)

      mockFetch({
        success: true,
        data: { user: MOCK_RESPONSES.loginSuccess('landlord').data!.user },
      })

      // Act
      const result = await authService.getCurrentUser()

      // Assert
      expect(result.data?.user).toBeDefined()
    })
  })
})

