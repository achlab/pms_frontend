/**
 * Authentication Service
 * Handles all authentication-related API calls
 * Following Single Responsibility Principle
 */

import apiClient, { tokenManager } from "../api-client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyPasswordRequest,
  User,
  ApiResponse,
} from "../api-types";
import type {
  RegisterData,
  LoginData,
  VerifyEmailData,
  AuthResponse,
} from "@/types/auth";

class AuthenticationService {
  private static instance: AuthenticationService;

  private constructor() {}

  static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  /**
   * Login user with email and password
   */
  /**
   * Normalize user data to ensure consistent field names
   */
  private normalizeUserData(user: any): any {
    if (!user) return user;
    
    // Normalize verification status - check both camelCase and snake_case
    const isVerified = user.isVerified === true || 
                      user.is_verified === true || 
                      (user.email_verified_at !== null && user.email_verified_at !== undefined);
    
    return {
      ...user,
      isVerified: isVerified,
      is_verified: isVerified, // Keep both for compatibility
    };
  }

  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>("login", {
        email: credentials.email,
        password: credentials.password,
      });

      // Handle response - check if it already has success/message structure
      if (response.success !== undefined) {
        // Store token and user data if present
        const token = response.data?.token
        let user = response.data?.user
        
        // Normalize user data to ensure isVerified is properly set
        if (user) {
          user = this.normalizeUserData(user);
        }
        
        if (token) {
          tokenManager.setToken(token);
        }
        if (user) {
          tokenManager.setUserData(user);
        }
        
        // Store password change requirement flag
        if (response.data?.requires_password_change) {
          localStorage.setItem('requires_password_change', 'true');
        } else {
          localStorage.removeItem('requires_password_change');
        }
        
        return {
          ...response,
          data: {
            ...response.data,
            user: user,
          },
        };
      }

      // Otherwise, wrap the response
      const token = response.token || response.data?.token
      let user = response.user || response.data?.user
      
      // Normalize user data to ensure isVerified is properly set
      if (user) {
        user = this.normalizeUserData(user);
      }
      
      if (token) {
        tokenManager.setToken(token);
      }
      if (user) {
        tokenManager.setUserData(user);
      }
      
      // Store password change requirement flag
      if (response.requires_password_change) {
        localStorage.setItem('requires_password_change', 'true');
      } else {
        localStorage.removeItem('requires_password_change');
      }

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: user,
          token: token,
          requires_password_change: response.requires_password_change,
        },
      };
    } catch (error: any) {
      // Clear any stored tokens on error
      tokenManager.clearAll();
      throw error;
    }
  }

  /**
   * Register new user (Landlord only for public registration)
   * Tenants and Caretakers are created by Landlords/Super Admins
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log("📤 AuthService.register - Sending registration request:", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        hasAddress: !!data.address,
      });

      const response = await apiClient.post<any>("register", data);

      console.log("📥 AuthService.register - Raw API Response:", response);
      console.log("📥 AuthService.register - Response structure:", {
        hasSuccess: response.success !== undefined,
        hasData: !!response.data,
        hasUser: !!(response.user || response.data?.user),
        hasToken: !!(response.token || response.data?.token),
        message: response.message,
      });

      // Handle undefined or null response
      if (!response) {
        console.error("❌ AuthService.register - No response from server");
        throw new Error('No response from server');
      }

      // Handle response - check if it already has success/message structure
      if (response.success !== undefined) {
        console.log("✅ AuthService.register - Response has success structure:", {
          success: response.success,
          message: response.message,
          user: response.data?.user ? {
            id: response.data.user.id,
            email: response.data.user.email,
            isVerified: response.data.user.is_verified || response.data.user.isVerified,
          } : null,
        });
        return response;
      }

      // Otherwise, wrap the response
      const wrappedResponse = {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
          user: response.user || response.data?.user,
          token: response.token || response.data?.token,
        },
      };

      console.log("✅ AuthService.register - Wrapped response:", {
        success: wrappedResponse.success,
        message: wrappedResponse.message,
        user: wrappedResponse.data?.user ? {
          id: wrappedResponse.data.user.id,
          email: wrappedResponse.data.user.email,
          isVerified: wrappedResponse.data.user.is_verified || wrappedResponse.data.user.isVerified,
        } : null,
      });

      return wrappedResponse;
    } catch (error: any) {
      console.error("❌ AuthService.register - Error occurred:", error);
      console.error("❌ AuthService.register - Error details:", {
        message: error?.message,
        status: error?.status,
        response: error?.response?.data,
        errors: error?.errors,
      });
      throw error;
    }
  }

  /**
   * Verify user email with token
   */
  async verifyEmail(data: VerifyEmailData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>("email/verify", {
        token: data.token,
        email: data.email,
      });

      // If response already has the right structure, return it
      if (response.success !== undefined) {
        return response;
      }

      return {
        success: true,
        message: 'Email verified successfully. You can now login.',
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<AuthResponse> {
    try {
      console.log("📤 AuthService.resendVerificationEmail - Sending request:", { email });

      const response = await apiClient.post<any>("email/resend", { email });

      console.log("📥 AuthService.resendVerificationEmail - Raw API Response:", response);
      console.log("📥 AuthService.resendVerificationEmail - Response structure:", {
        hasSuccess: response.success !== undefined,
        success: response.success,
        message: response.message,
        data: response.data,
      });

      // If response already has the right structure, return it
      if (response.success !== undefined) {
        console.log("✅ AuthService.resendVerificationEmail - Response received:", {
          success: response.success,
          message: response.message,
        });
        return response;
      }

      const wrappedResponse = {
        success: true,
        message: 'Verification email has been resent.',
      };

      console.log("✅ AuthService.resendVerificationEmail - Wrapped response:", wrappedResponse);
      return wrappedResponse;
    } catch (error: any) {
      console.error("❌ AuthService.resendVerificationEmail - Error occurred:", error);
      console.error("❌ AuthService.resendVerificationEmail - Error details:", {
        message: error?.message,
        status: error?.status,
        response: error?.response?.data,
        errors: error?.errors,
        requestUrl: error?.config?.url,
        requestData: error?.config?.data,
      });
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>("logout");
      
      // If response already has the right structure, return it but still clear local data
      if (response.success !== undefined) {
        return response;
      }
      
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error: any) {
      // Even if API call fails, still return success for local logout
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } finally {
      // Always clear local data even if API call fails
      tokenManager.clearAll();
      localStorage.removeItem('requires_password_change');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('session_id');
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAllDevices(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>("logout/all");
      
      // If response already has the right structure, return it
      if (response.success !== undefined) {
        return response;
      }
      
      return {
        success: true,
        message: 'Logged out from all devices',
      };
    } catch (error: any) {
      throw error;
    } finally {
      // Always clear local data
      tokenManager.clearAll();
      localStorage.removeItem('requires_password_change');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('session_id');
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: { email: string }): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>("password/forgot", { email: data.email });
      
      // If response already has the right structure, return it
      if (response.success !== undefined) {
        return response;
      }
      
      return {
        success: true,
        message: 'Password reset link has been sent to your email.',
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>("password/reset", data);
      
      // If response already has the right structure, return it
      if (response.success !== undefined) {
        return response;
      }
      
      return {
        success: true,
        message: 'Password has been reset successfully. You can now login with your new password.',
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Change current user's password
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<null>> {
    return apiClient.put<ApiResponse<null>>("profile/password", data);
  }

  /**
   * Verify user's password
   */
  async verifyPassword(password: string): Promise<ApiResponse<{ valid: boolean }>> {
    return apiClient.post<ApiResponse<{ valid: boolean }>>("profile/password/verify", {
      password,
    });
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>("token/refresh");
      
      // If response already has the right structure, use it
      if (response.success !== undefined) {
        const token = response.data?.token
        if (token) {
          tokenManager.setToken(token);
        }
        return response;
      }
      
      // Otherwise extract token
      const token = response.token || response.data?.token
      if (token) {
        tokenManager.setToken(token);
        return {
          success: true,
          message: 'Token refreshed successfully',
          data: {
            token: token,
            user: tokenManager.getUserData()!,
          },
        };
      }

      throw new Error('Failed to refresh token');
    } catch (error: any) {
      // Clear auth data if refresh fails
      tokenManager.clearAll();
      throw error;
    }
  }

  /**
   * Refresh authentication by verifying token and fetching user
   */
  async refreshAuth(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await apiClient.get<ApiResponse<User>>("profile");
      
      if (response.success && response.data) {
        // Normalize user data to ensure isVerified is properly set
        const normalizedUser = this.normalizeUserData(response.data);
        tokenManager.setUserData(normalizedUser);
        return normalizedUser;
      }

      return null;
    } catch (error) {
      tokenManager.clearAll();
      return null;
    }
  }

  /**
   * Get current user from API (validates token)
   */
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Unauthenticated');
      }

      const response = await apiClient.get<any>("profile");
      
      // If response already has the right structure, use it
      if (response.success !== undefined) {
        let user = response.data?.user || response.data
        if (user && typeof user === 'object') {
          // Normalize user data to ensure isVerified is properly set
          user = this.normalizeUserData(user);
          tokenManager.setUserData(user);
        }
        return {
          ...response,
          data: {
            ...response.data,
            user: user,
          },
        };
      }
      
      // Otherwise extract user data
      let user = response.user || response.data?.user || response.data
      if (user && typeof user === 'object') {
        // Normalize user data to ensure isVerified is properly set
        user = this.normalizeUserData(user);
        tokenManager.setUserData(user);
        return {
          success: true,
          message: 'User data retrieved successfully',
          data: {
            user: user,
            token: token,
          },
        };
      }

      throw new Error('Failed to get user');
    } catch (error: any) {
      // Clear auth data if token is invalid
      if (error.response?.status === 401) {
        tokenManager.clearAll();
      }
      throw error;
    }
  }

  /**
   * Get current user from storage (synchronous)
   */
  getCurrentUserSync(): User | null {
    return tokenManager.getUserData();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!tokenManager.getToken();
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return tokenManager.getToken();
  }

  /**
   * Verify token validity (optional - can call a verify endpoint if available)
   */
  async verifyToken(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      // Try to get user profile to verify token
      const response = await apiClient.get<ApiResponse<User>>("profile");
      
      if (response.success && response.data) {
        // Normalize user data to ensure isVerified is properly set
        const normalizedUser = this.normalizeUserData(response.data);
        tokenManager.setUserData(normalizedUser);
        return normalizedUser;
      }

      return null;
    } catch (error) {
      // Token is invalid
      tokenManager.clearAll();
      return null;
    }
  }

  /**
   * Update stored user data
   */
  updateUserData(user: User): void {
    tokenManager.setUserData(user);
  }

  /**
   * Clear all authentication data
   */
  clearAuth(): void {
    tokenManager.clearAll();
  }
}

// Export singleton instance
export const authService = AuthenticationService.getInstance();
export default authService;

