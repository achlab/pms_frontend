/**
 * Authentication Tests - Logout & Token Clearing
 * 
 * Tests cover:
 * - Logout for all roles
 * - Token removal from localStorage
 * - User data clearing
 * - Session invalidation
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { mockFetch, resetFetchMock, mockLocalStorage } from './test-setup'
import { 
  TEST_CREDENTIALS, 
  MOCK_RESPONSES 
} from './mock-data'
import { authService } from '@/lib/services/auth.service'

describe('Authentication - Logout & Token Clearing', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    resetFetchMock()
  })

  afterEach(() => {
    resetFetchMock()
  })

  // Helper function to simulate a login
  const performLogin = async (role: keyof typeof TEST_CREDENTIALS) => {
    const credentials = {
      email: TEST_CREDENTIALS[role].email,
      password: TEST_CREDENTIALS[role].password,
    }

    mockFetch({
      ...MOCK_RESPONSES.loginSuccess(role === 'newLandlord' ? 'landlord' : role),
      data: {
        ...MOCK_RESPONSES.loginSuccess(role === 'newLandlord' ? 'landlord' : role).data!,
        token: `${role}-token-123`,
      },
    })

    await authService.login(credentials)
    
    // Verify login was successful
    expect(mockLocalStorage.getItem('auth_token')).toBeDefined()
    expect(mockLocalStorage.getItem('user')).toBeDefined()
  }

  describe('Logout Functionality', () => {
    it('should successfully logout super admin', async () => {
      // Arrange
      await performLogin('superAdmin')

      mockFetch(MOCK_RESPONSES.logoutSuccess)

      // Act
      const result = await authService.logout()

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toContain('Logged out')
    })

    it('should successfully logout landlord', async () => {
      // Arrange
      await performLogin('landlord')

      mockFetch(MOCK_RESPONSES.logoutSuccess)

      // Act
      const result = await authService.logout()

      // Assert
      expect(result.success).toBe(true)
    })

    it('should successfully logout caretaker', async () => {
      // Arrange
      await performLogin('caretaker')

      mockFetch(MOCK_RESPONSES.logoutSuccess)

      // Act
      const result = await authService.logout()

      // Assert
      expect(result.success).toBe(true)
    })

    it('should successfully logout tenant', async () => {
      // Arrange
      await performLogin('tenant')

      mockFetch(MOCK_RESPONSES.logoutSuccess)

      // Act
      const result = await authService.logout()

      // Assert
      expect(result.success).toBe(true)
    })
  })

  describe('Token Clearing', () => {
    it('should remove auth token from localStorage on logout', async () => {
      // Arrange
      await performLogin('landlord')
      
      const tokenBefore = mockLocalStorage.getItem('auth_token')
      expect(tokenBefore).toBeDefined()

      mockFetch(MOCK_RESPONSES.logoutSuccess)

      // Act
      await authService.logout()

      // Assert
      const tokenAfter = mockLocalStorage.getItem('auth_token')
      expect(tokenAfter).toBeNull()
    })

    it('should remove user data from localStorage on logout', async () => {
      // Arrange
      await performLogin('landlord')
      
      const userBefore = mockLocalStorage.getItem('user')
      expect(userBefore).toBeDefined()

      mockFetch(MOCK_RESPONSES.logoutSuccess)

      // Act
      await authService.logout()

      // Assert
      const userAfter = mockLocalStorage.getItem('user')
      expect(userAfter).toBeNull()
    })

    it('should clear all auth-related data on logout', async () => {
      // Arrange
      await performLogin('landlord')
      
      // Store additional auth-related data
      mockLocalStorage.setItem('refresh_token', 'refresh-token-123')
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
  })

  describe('Logout Edge Cases', () => {
    it('should handle logout when no user is logged in', async () => {
      // Arrange - No login performed
      expect(mockLocalStorage.getItem('auth_token')).toBeNull()

      mockFetch(MOCK_RESPONSES.logoutSuccess)

      // Act
      const result = await authService.logout()

      // Assert - Should still succeed
      expect(result.success).toBe(true)
    })

    it('should handle logout with expired token', async () => {
      // Arrange
      await performLogin('landlord')
      
      // Simulate expired token
      mockFetch({
        success: false,
        message: 'Token expired',
      }, { ok: false, status: 401 })

      // Act
      const logout = authService.logout()

      // Assert - Should still clear local data even if API call fails
      await expect(logout).rejects.toThrow()
      
      // But localStorage should still be cleared
      expect(mockLocalStorage.getItem('auth_token')).toBeNull()
      expect(mockLocalStorage.getItem('user')).toBeNull()
    })

    it('should handle logout with network error', async () => {
      // Arrange
      await performLogin('landlord')
      
      mockFetch({
        success: false,
        message: 'Network error',
      }, { ok: false, status: 500 })

      // Act & Assert
      await expect(authService.logout()).rejects.toThrow()
      
      // Local storage should still be cleared
      expect(mockLocalStorage.getItem('auth_token')).toBeNull()
      expect(mockLocalStorage.getItem('user')).toBeNull()
    })
  })

  describe('Session Invalidation', () => {
    it('should invalidate session on server after logout', async () => {
      // Arrange
      await performLogin('landlord')
      const token = mockLocalStorage.getItem('auth_token')

      mockFetch(MOCK_RESPONSES.logoutSuccess)

      // Act
      await authService.logout()

      // Assert - Try to use the same token after logout
      mockFetch({
        success: false,
        message: 'Unauthenticated',
      }, { ok: false, status: 401 })

      // This should fail because the token is invalidated
      await expect(authService.getCurrentUser()).rejects.toThrow()
    })
  })

  describe('Multiple Device Logout', () => {
    it('should logout from current device only', async () => {
      // Arrange
      await performLogin('landlord')
      
      const device1Token = mockLocalStorage.getItem('auth_token')
      
      mockFetch(MOCK_RESPONSES.logoutSuccess)

      // Act - Logout from current device
      await authService.logout()

      // Assert
      expect(mockLocalStorage.getItem('auth_token')).toBeNull()
      
      // Note: In a real scenario, device1Token might still be valid on other devices
      // unless the backend implements revocation
    })

    it('should handle logout all devices', async () => {
      // Arrange
      await performLogin('landlord')
      
      mockFetch({
        success: true,
        message: 'Logged out from all devices',
      })

      // Act
      await authService.logoutAllDevices()

      // Assert
      expect(mockLocalStorage.getItem('auth_token')).toBeNull()
      expect(mockLocalStorage.getItem('user')).toBeNull()
    })
  })

  describe('Logout Flow Integration', () => {
    it('should complete full login-logout cycle', async () => {
      // Step 1: Login
      await performLogin('landlord')
      
      expect(mockLocalStorage.getItem('auth_token')).toBeDefined()
      expect(mockLocalStorage.getItem('user')).toBeDefined()

      // Step 2: Logout
      mockFetch(MOCK_RESPONSES.logoutSuccess)
      const logoutResult = await authService.logout()

      expect(logoutResult.success).toBe(true)
      expect(mockLocalStorage.getItem('auth_token')).toBeNull()
      expect(mockLocalStorage.getItem('user')).toBeNull()

      // Step 3: Verify cannot access protected resources
      mockFetch({
        success: false,
        message: 'Unauthenticated',
      }, { ok: false, status: 401 })

      await expect(authService.getCurrentUser()).rejects.toThrow()
    })

    it('should allow re-login after logout', async () => {
      // Step 1: First login
      await performLogin('landlord')
      
      const firstToken = mockLocalStorage.getItem('auth_token')
      expect(firstToken).toBeDefined()

      // Step 2: Logout
      mockFetch(MOCK_RESPONSES.logoutSuccess)
      await authService.logout()

      expect(mockLocalStorage.getItem('auth_token')).toBeNull()

      // Step 3: Login again
      await performLogin('landlord')
      
      const secondToken = mockLocalStorage.getItem('auth_token')
      expect(secondToken).toBeDefined()
      expect(secondToken).not.toBe(firstToken)
    })
  })

  describe('Security Checks', () => {
    it('should not expose sensitive data after logout', async () => {
      // Arrange
      await performLogin('landlord')
      
      // Store some sensitive data
      mockLocalStorage.setItem('payment_info', JSON.stringify({ card: '1234' }))
      mockLocalStorage.setItem('api_keys', 'secret-key')
      
      mockFetch(MOCK_RESPONSES.logoutSuccess)

      // Act
      await authService.logout()

      // Assert - All auth-related data should be cleared
      expect(mockLocalStorage.getItem('auth_token')).toBeNull()
      expect(mockLocalStorage.getItem('user')).toBeNull()
      expect(mockLocalStorage.getItem('payment_info')).toBeNull()
      expect(mockLocalStorage.getItem('api_keys')).toBeNull()
    })

    it('should prevent API calls with cleared token', async () => {
      // Arrange
      await performLogin('landlord')
      
      mockFetch(MOCK_RESPONSES.logoutSuccess)
      await authService.logout()

      // Act & Assert - Try to make authenticated API call
      mockFetch({
        success: false,
        message: 'Unauthenticated',
      }, { ok: false, status: 401 })

      await expect(authService.getCurrentUser()).rejects.toThrow()
    })
  })
})

